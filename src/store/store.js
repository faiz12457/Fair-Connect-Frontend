import { useSyncExternalStore } from 'react'
import { createSeed } from '@/data/seed'
import { bestJobMatch } from '@/lib/match'
import { uid } from '@/lib/format'

const KEY = 'fairconnect-demo-v1'
const SESSION_KEY = 'fairconnect-session'
const VERSION = 1

// ---------- persistence + cross-tab sync ----------
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.version === VERSION ? parsed : null
  } catch {
    return null
  }
}

let state = load() || createSeed()
if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(state))

const listeners = new Set()
const notify = () => listeners.forEach((l) => l())
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fairconnect') : null
const eventListeners = new Set()

function reloadFromStorage(event) {
  const next = load()
  if (next) {
    state = next
    notify()
  }
  if (event) eventListeners.forEach((l) => l(event))
}
channel?.addEventListener('message', (e) => reloadFromStorage(e.data?.event))
window.addEventListener('storage', (e) => {
  if (e.key === KEY) reloadFromStorage()
})

function commit(mutator, event) {
  const draft = structuredClone(state)
  const result = mutator(draft)
  state = draft
  localStorage.setItem(KEY, JSON.stringify(state))
  notify()
  channel?.postMessage({ type: 'sync', event })
  if (event) eventListeners.forEach((l) => l(event, true))
  return result
}

export function getState() {
  return state
}
export function useStore() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )
}
/** Subscribe to domain events (fired locally and from other tabs). */
export function onStoreEvent(fn) {
  eventListeners.add(fn)
  return () => eventListeners.delete(fn)
}

// ---------- session (per tab) ----------
const sessionListeners = new Set()
let sessionUserId = sessionStorage.getItem(SESSION_KEY)
function setSession(userId) {
  sessionUserId = userId
  if (userId) sessionStorage.setItem(SESSION_KEY, userId)
  else sessionStorage.removeItem(SESSION_KEY)
  sessionListeners.forEach((l) => l())
}
export function getSessionUser() {
  return state.users.find((u) => u.id === sessionUserId) || null
}
export function useSession() {
  const s = useStore()
  const id = useSyncExternalStore(
    (l) => (sessionListeners.add(l), () => sessionListeners.delete(l)),
    () => sessionUserId,
  )
  const user = s.users.find((u) => u.id === id) || null
  return {
    user,
    student: user?.studentId ? s.students.find((st) => st.id === user.studentId) : null,
    company: user?.companyId ? s.companies.find((c) => c.id === user.companyId) : null,
  }
}
export function homeFor(user) {
  if (!user) return '/login'
  if (user.role === 'student') return '/student'
  if (user.role === 'recruiter') return '/recruiter'
  return '/admin'
}

// ---------- toasts ----------
let toasts = []
const toastListeners = new Set()
export function toast(input) {
  const t = typeof input === 'string' ? { title: input } : input
  const id = uid('t')
  toasts = [...toasts, { id, tone: 'default', ...t }]
  toastListeners.forEach((l) => l())
  setTimeout(() => dismissToast(id), t.duration || 5000)
  return id
}
export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id)
  toastListeners.forEach((l) => l())
}
export function useToasts() {
  return useSyncExternalStore(
    (l) => (toastListeners.add(l), () => toastListeners.delete(l)),
    () => toasts,
  )
}

// ---------- helpers ----------
const now = () => new Date().toISOString()
function pushNote(d, to, title, body, link, kind = 'info') {
  d.notifications.unshift({ id: uid('n'), to, title, body, link, at: now(), read: false, kind })
}
function audit(d, action, target) {
  const u = getSessionUser()
  d.audit.unshift({ id: uid('a'), at: now(), actor: u?.name || 'System', action, target })
}
const fail = (code, message, extra = {}) => ({ ok: false, code, message, ...extra })

export function stallFor(s, fairId, companyId) {
  return s.stalls.find((st) => st.fairId === fairId && st.companyId === companyId) || null
}
export function currentFair(s = state) {
  return s.fairs.find((f) => f.status === 'live') || s.fairs.find((f) => f.status === 'upcoming') || s.fairs[0]
}

/**
 * Validates a share request. Student identity comes from the session only —
 * never from the QR payload or request body.
 */
export function validateShare(companyId, fairId, code, s = state) {
  const user = s.users.find((u) => u.id === sessionUserId)
  const fair = s.fairs.find((f) => f.id === fairId)
  const company = s.companies.find((c) => c.id === companyId)
  if (!fair || !company || !fair.companyIds.includes(companyId)) return fail('invalid', 'This QR code is not recognised for any fair.')
  const stall = stallFor(s, fairId, companyId)
  if (!stall || stall.qr.status === 'none') return fail('invalid', 'This company has no active stall QR for this fair.')
  if (stall.qr.status === 'revoked') return fail('revoked', 'This stall QR has been revoked by the organisers.')
  if (code && code !== stall.qr.code) return fail('expired', 'This QR has been replaced with a newer one.')
  if (!user) return fail('signed_out', 'Sign in to share your profile.')
  if (user.role !== 'student') return fail('not_student', 'Only students can share a profile with a company.')
  const student = s.students.find((st) => st.id === user.studentId)
  if (fair.status !== 'live') return fail('not_live', fair.status === 'upcoming' ? 'The fair has not started yet.' : 'This fair has ended.')
  if (fair.policy.requireVerification && student.verification !== 'verified')
    return fail('unverified', 'Your academic record is still being verified by Career Services.')
  if (student.privacy.hiddenFairs.includes(fairId)) return fail('hidden', 'You have turned off profile visibility for this fair.')
  const existing = s.interactions.find((i) => i.studentId === student.id && i.companyId === companyId && i.fairId === fairId)
  if (existing) return fail('already', 'You already shared your profile with this company.', { interaction: existing })
  return { ok: true, fair, company, stall, student }
}

function createInteraction(d, studentId, companyId, fairId) {
  const student = d.students.find((s) => s.id === studentId)
  const fair = d.fairs.find((f) => f.id === fairId)
  const jobs = d.jobs.filter((j) => j.companyId === companyId && j.status === 'active')
  const best = bestJobMatch(student, jobs, fair.weights)
  const at = now()
  const ix = {
    id: uid('ix'),
    studentId,
    companyId,
    fairId,
    jobId: best?.jobId || null,
    score: best?.score ?? 0,
    breakdown: best?.breakdown || { skills: 0, cgpa: 0, fyp: 0, certs: 0 },
    matchedSkills: best?.matchedSkills || [],
    missingSkills: best?.missingSkills || [],
    weights: { ...fair.weights },
    status: 'pending',
    createdAt: at,
    history: [{ status: 'pending', at }],
    notes: [],
  }
  d.interactions.unshift(ix)
  const stall = d.stalls.find((s) => s.fairId === fairId && s.companyId === companyId)
  pushNote(d, `company:${companyId}`, `New visitor: ${student.name}`, `${best?.score ?? 0}% match for ${best?.job?.title || 'your roles'} · Stall ${stall?.number}`, `/recruiter/live?open=${ix.id}`, 'visitor')
  return ix
}

function requireRecruiterInteraction(d, interactionId) {
  const user = getSessionUser()
  const ix = d.interactions.find((i) => i.id === interactionId)
  if (!ix || !user || user.role !== 'recruiter' || user.companyId !== ix.companyId) return null
  return ix
}

// ---------- actions ----------
export const actions = {
  login(email, password) {
    const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user || user.password !== password) return fail('invalid', 'That email and password don\u2019t match an account.')
    if (user.status === 'suspended') return fail('suspended', 'This account has been suspended by Career Services.')
    if (user.emailVerified === false) return fail('unverified', 'Please verify your email first.', { user })
    setSession(user.id)
    return { ok: true, user }
  },
  loginAs(userId) {
    setSession(userId)
    return state.users.find((u) => u.id === userId)
  },
  logout() {
    setSession(null)
  },

  registerStudent({ name, email, password, rollNo, department }) {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!state.university.domains.includes(domain))
      return fail('domain', `Use your university email (${state.university.domains.map((d) => '@' + d).join(' or ')}).`)
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return fail('exists', 'An account with this email already exists.')
    return commit((d) => {
      const sid = uid('st')
      d.students.push({
        id: sid, name, email, phone: '', rollNo, department, batch: 'Fall 2021', semester: 8, cgpa: 0,
        skills: [], fyp: { title: '', abstract: '', stack: [], supervisor: '' }, certifications: [],
        links: { github: '', linkedin: '', portfolio: '' }, resume: null, bio: '',
        privacy: { showCgpa: true, showLinks: true, hiddenFairs: [] }, verification: 'pending', bookmarks: [],
        tint: 'ai', onboarded: false, createdAt: now(),
      })
      const user = { id: `u_${sid}`, role: 'student', name, email, password, status: 'active', studentId: sid, emailVerified: false }
      d.users.push(user)
      pushNote(d, 'admin', 'New student registration', `${name} (${rollNo}) is waiting for academic verification.`, '/admin/students', 'verify')
      return { ok: true, user }
    })
  },
  registerRecruiter({ companyName, industry, city, website, name, title, email, password }) {
    if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return fail('exists', 'An account with this email already exists.')
    return commit((d) => {
      const cid = uid('co')
      d.companies.push({ id: cid, name: companyName, industry, city, website, color: '#2563EB', size: '—', about: '', status: 'pending', rejectReason: '', submittedAt: now(), perks: [] })
      d.fairs.filter((f) => f.status !== 'ended' && f.status !== 'archived').forEach((f) => f.companyIds.push(cid))
      const user = { id: uid('u'), role: 'recruiter', name, title, email, password, status: 'active', companyId: cid, emailVerified: false }
      d.users.push(user)
      pushNote(d, 'admin', `${companyName} requested approval`, 'A new company registration is waiting for review.', '/admin/companies', 'company')
      return { ok: true, user }
    })
  },
  verifyEmail(userId) {
    commit((d) => {
      const u = d.users.find((x) => x.id === userId)
      if (u) u.emailVerified = true
    })
    setSession(userId)
  },

  // ----- student -----
  updateStudent(patch) {
    const user = getSessionUser()
    if (user?.role !== 'student') return
    commit((d) => {
      const s = d.students.find((x) => x.id === user.studentId)
      Object.assign(s, typeof patch === 'function' ? patch(structuredClone(s)) : patch)
    })
  },
  toggleBookmark(companyId) {
    actions.updateStudent((s) => ({ bookmarks: s.bookmarks.includes(companyId) ? s.bookmarks.filter((b) => b !== companyId) : [...s.bookmarks, companyId] }))
  },
  shareProfile(companyId, fairId, code) {
    const v = validateShare(companyId, fairId, code)
    if (!v.ok) return v
    const ix = commit((d) => createInteraction(d, v.student.id, companyId, fairId), { type: 'interaction', companyId, studentId: v.student.id })
    return { ok: true, interaction: ix }
  },
  checkIn(fairId) {
    const user = getSessionUser()
    if (user?.role !== 'student') return fail('not_student', 'Only students check in at the gate.')
    const fair = state.fairs.find((f) => f.id === fairId)
    if (!fair) return fail('invalid', 'Unknown fair.')
    if (fair.status === 'ended' || fair.status === 'archived') return fail('ended', 'This fair has ended.')
    const existing = state.checkins.find((c) => c.fairId === fairId && c.studentId === user.studentId)
    if (existing) return fail('already', 'You are already checked in.', { checkin: existing })
    const c = commit((d) => {
      const ci = { id: uid('ci'), fairId, studentId: user.studentId, at: now() }
      d.checkins.push(ci)
      return ci
    }, { type: 'checkin' })
    return { ok: true, checkin: c }
  },
  respondToInvite(interviewId, slotId) {
    const user = getSessionUser()
    const iv = state.interviews.find((i) => i.id === interviewId)
    if (!iv || iv.studentId !== user?.studentId) return fail('forbidden', 'Not your interview.')
    const slot = state.slots.find((s) => s.id === slotId)
    if (!slot || (slot.interviewId && slot.interviewId !== iv.id)) return fail('taken', 'That slot was just taken. Pick another one.')
    commit((d) => {
      const i = d.interviews.find((x) => x.id === interviewId)
      d.slots.forEach((s) => s.interviewId === i.id && (s.interviewId = null))
      d.slots.find((s) => s.id === slotId).interviewId = i.id
      i.slotId = slotId
      i.status = 'scheduled'
      i.proposedTime = ''
      const ix = d.interactions.find((x) => x.id === i.interactionId)
      ix.status = 'interview_scheduled'
      ix.history.push({ status: 'interview_scheduled', at: now() })
      const st = d.students.find((s) => s.id === i.studentId)
      pushNote(d, `company:${i.companyId}`, `${st.name} confirmed ${slot.time}`, `${slot.location}`, '/recruiter/interviews', 'interview')
    }, { type: 'interview' })
    return { ok: true }
  },
  proposeTime(interviewId, text) {
    commit((d) => {
      const i = d.interviews.find((x) => x.id === interviewId)
      i.proposedTime = text
      const st = d.students.find((s) => s.id === i.studentId)
      pushNote(d, `company:${i.companyId}`, `${st.name} proposed another time`, `"${text}"`, '/recruiter/interviews', 'interview')
    }, { type: 'interview' })
  },
  declineInvite(interviewId) {
    commit((d) => {
      const i = d.interviews.find((x) => x.id === interviewId)
      i.status = 'declined'
      d.slots.forEach((s) => s.interviewId === i.id && (s.interviewId = null))
      const st = d.students.find((s) => s.id === i.studentId)
      pushNote(d, `company:${i.companyId}`, `${st.name} declined the interview`, '', '/recruiter/interviews', 'interview')
    })
  },

  // ----- recruiter -----
  setInteractionStatus(interactionId, status, { silent } = {}) {
    let prev = null
    commit((d) => {
      const ix = requireRecruiterInteraction(d, interactionId)
      if (!ix || ix.status === status) return
      prev = ix.status
      ix.status = status
      ix.history.push({ status, at: now() })
      const company = d.companies.find((c) => c.id === ix.companyId)
      if (!silent && status === 'shortlisted')
        pushNote(d, `student:${ix.studentId}`, `${company.name} shortlisted you`, 'Your profile moved forward. Watch for an interview invite.', `/student/activity/${ix.id}`, 'status')
    }, { type: 'status', interactionId })
    return prev
  },
  bulkStatus(ids, status) {
    ids.forEach((id) => actions.setInteractionStatus(id, status))
  },
  addNote(interactionId, text) {
    const user = getSessionUser()
    commit((d) => {
      const ix = requireRecruiterInteraction(d, interactionId)
      if (ix) ix.notes.push({ id: uid('note'), text, at: now(), by: user.name })
    })
  },
  inviteInterview(interactionId, slotIds, { mode = 'in-person', message = '' } = {}) {
    return commit((d) => {
      const ix = requireRecruiterInteraction(d, interactionId)
      if (!ix) return fail('forbidden', 'Not allowed')
      const iv = { id: uid('iv'), interactionId, companyId: ix.companyId, studentId: ix.studentId, fairId: ix.fairId, offeredSlotIds: slotIds, slotId: null, status: 'invited', mode, message, proposedTime: '', createdAt: now(), notes: '' }
      d.interviews.push(iv)
      ix.status = 'interview_invited'
      ix.history.push({ status: 'interview_invited', at: now() })
      const company = d.companies.find((c) => c.id === ix.companyId)
      pushNote(d, `student:${ix.studentId}`, `${company.name} invited you to interview`, 'Pick one of the offered slots or propose another time.', '/student/interviews', 'interview')
      return { ok: true, interview: iv }
    }, { type: 'interview' })
  },
  scheduleInterview(interactionId, slotId, { mode = 'in-person' } = {}) {
    const slot = state.slots.find((s) => s.id === slotId)
    if (!slot || slot.interviewId) return fail('taken', 'That slot is already booked. Choose another.')
    return commit((d) => {
      const ix = requireRecruiterInteraction(d, interactionId)
      if (!ix) return fail('forbidden', 'Not allowed')
      let iv = d.interviews.find((i) => i.interactionId === interactionId && i.status !== 'declined')
      if (!iv) {
        iv = { id: uid('iv'), interactionId, companyId: ix.companyId, studentId: ix.studentId, fairId: ix.fairId, offeredSlotIds: [slotId], createdAt: now(), notes: '', message: '', proposedTime: '' }
        d.interviews.push(iv)
      }
      d.slots.forEach((s) => s.interviewId === iv.id && (s.interviewId = null))
      d.slots.find((s) => s.id === slotId).interviewId = iv.id
      Object.assign(iv, { slotId, status: 'scheduled', mode })
      ix.status = 'interview_scheduled'
      ix.history.push({ status: 'interview_scheduled', at: now() })
      const company = d.companies.find((c) => c.id === ix.companyId)
      pushNote(d, `student:${ix.studentId}`, `Interview scheduled with ${company.name}`, `${slot.time} · ${slot.location}`, '/student/interviews', 'interview')
      return { ok: true, interview: iv }
    }, { type: 'interview' })
  },
  completeInterview(interactionId, notes) {
    commit((d) => {
      const ix = requireRecruiterInteraction(d, interactionId)
      if (!ix) return
      let iv = d.interviews.find((i) => i.interactionId === interactionId && i.status !== 'declined')
      if (!iv) {
        iv = { id: uid('iv'), interactionId, companyId: ix.companyId, studentId: ix.studentId, fairId: ix.fairId, offeredSlotIds: [], slotId: null, mode: 'in-person', createdAt: now(), message: '', proposedTime: '' }
        d.interviews.push(iv)
      }
      iv.status = 'completed'
      iv.notes = notes
      ix.status = 'interview_completed'
      ix.history.push({ status: 'interview_completed', at: now() })
      if (notes) ix.notes.push({ id: uid('note'), text: `Interview notes: ${notes}`, at: now(), by: getSessionUser().name })
    }, { type: 'interview' })
  },
  addSlot(fairId, time, location) {
    const user = getSessionUser()
    commit((d) => {
      d.slots.push({ id: uid('slot'), companyId: user.companyId, fairId, time, location, interviewId: null })
      d.slots.sort((a, b) => a.time.localeCompare(b.time))
    })
  },
  removeSlot(slotId) {
    commit((d) => {
      d.slots = d.slots.filter((s) => s.id !== slotId || s.interviewId)
    })
  },
  updateCompany(patch) {
    const user = getSessionUser()
    commit((d) => Object.assign(d.companies.find((c) => c.id === user.companyId), patch))
  },
  saveJob(job) {
    const user = getSessionUser()
    return commit((d) => {
      if (job.id) {
        Object.assign(d.jobs.find((j) => j.id === job.id && j.companyId === user.companyId), job)
        return job.id
      }
      const id = uid('job')
      d.jobs.push({ ...job, id, companyId: user.companyId, createdAt: now(), location: job.location || 'Lahore' })
      return id
    })
  },
  deleteJob(id) {
    commit((d) => {
      d.jobs = d.jobs.filter((j) => j.id !== id)
    })
  },
  requestQrRegeneration(fairId) {
    const user = getSessionUser()
    const company = state.companies.find((c) => c.id === user.companyId)
    commit((d) => pushNote(d, 'admin', `${company.name} requested a new stall QR`, 'Review on the stall assignment page.', `/admin/fairs/${fairId}/stalls`, 'stall'))
  },
  inviteTeammate(name, email) {
    const user = getSessionUser()
    commit((d) => d.users.push({ id: uid('u'), role: 'recruiter', name, title: 'Recruiter', email, password: 'demo1234', status: 'invited', companyId: user.companyId }))
  },

  // ----- admin -----
  approveCompany(id) {
    commit((d) => {
      const c = d.companies.find((x) => x.id === id)
      c.status = 'approved'
      c.rejectReason = ''
      pushNote(d, `company:${id}`, 'Your company was approved', 'You can now build your stall profile, post jobs and get your stall QR once a stall is assigned.', '/recruiter', 'company')
      audit(d, 'Approved company', c.name)
    }, { type: 'company' })
  },
  rejectCompany(id, reason) {
    commit((d) => {
      const c = d.companies.find((x) => x.id === id)
      c.status = 'rejected'
      c.rejectReason = reason
      audit(d, 'Rejected company', `${c.name} — ${reason}`)
    }, { type: 'company' })
  },
  verifyStudent(id) {
    commit((d) => {
      const s = d.students.find((x) => x.id === id)
      s.verification = 'verified'
      s.verificationNote = ''
      pushNote(d, `student:${id}`, 'Your profile is verified', 'Career Services matched your academic record.', '/student/profile', 'verify')
      audit(d, 'Verified student', `${s.name} (${s.rollNo})`)
    })
  },
  flagStudent(id, note) {
    commit((d) => {
      const s = d.students.find((x) => x.id === id)
      s.verification = 'flagged'
      s.verificationNote = note
      pushNote(d, `student:${id}`, 'Verification needs attention', note, '/student/profile/edit', 'verify')
      audit(d, 'Flagged student', s.name)
    })
  },
  runRegistrarMatch() {
    return commit((d) => {
      let verified = 0
      let flagged = 0
      d.students.filter((s) => s.verification === 'pending').forEach((s) => {
        const rec = d.registrar.find((r) => r.rollNo === s.rollNo)
        if (!rec) return
        if (Math.abs(rec.cgpa - s.cgpa) < 0.02 && rec.department === s.department) {
          s.verification = 'verified'
          verified++
          pushNote(d, `student:${s.id}`, 'Your profile is verified', 'Career Services matched your academic record.', '/student/profile', 'verify')
        } else {
          s.verification = 'flagged'
          s.verificationNote = `Profile CGPA (${s.cgpa}) differs from registrar record (${rec.cgpa}).`
          flagged++
        }
      })
      audit(d, 'Ran registrar match', `${verified} verified, ${flagged} flagged`)
      return { verified, flagged }
    })
  },
  assignStall(fairId, number, companyId) {
    const conflict = companyId && state.stalls.find((s) => s.fairId === fairId && s.companyId === companyId && s.number !== number)
    return commit((d) => {
      if (conflict) {
        const old = d.stalls.find((s) => s.id === conflict.id)
        old.companyId = null
        old.qr = { status: 'none', code: '', generatedAt: null }
      }
      const st = d.stalls.find((s) => s.fairId === fairId && s.number === number)
      st.companyId = companyId
      st.qr = { status: 'none', code: '', generatedAt: null }
      const c = d.companies.find((x) => x.id === companyId)
      if (c) {
        pushNote(d, `company:${companyId}`, `Stall ${number} assigned`, 'Your stall QR will be available once Career Services generates it.', '/recruiter/qr', 'stall')
        audit(d, 'Assigned stall', `${c.name} → Stall ${number}`)
      }
      return { ok: true, movedFrom: conflict?.number }
    })
  },
  generateQR(stallId) {
    commit((d) => {
      const st = d.stalls.find((s) => s.id === stallId)
      st.qr = { status: 'active', code: `${st.companyId.toUpperCase().slice(0, 3)}-${st.number}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, generatedAt: now() }
      const c = d.companies.find((x) => x.id === st.companyId)
      pushNote(d, `company:${st.companyId}`, 'Your stall QR is ready', `Stall ${st.number}. Print the poster from Stall & QR.`, '/recruiter/qr', 'stall')
      audit(d, 'Generated stall QR', `${c.name} · Stall ${st.number}`)
    }, { type: 'qr' })
  },
  revokeQR(stallId) {
    commit((d) => {
      const st = d.stalls.find((s) => s.id === stallId)
      st.qr.status = 'revoked'
      const c = d.companies.find((x) => x.id === st.companyId)
      pushNote(d, `company:${st.companyId}`, 'Your stall QR was revoked', 'Scans of the old poster will be rejected. A new QR can be generated by Career Services.', '/recruiter/qr', 'stall')
      audit(d, 'Revoked stall QR', `${c.name} · Stall ${st.number}`)
    }, { type: 'qr' })
  },
  setFairStatus(fairId, status) {
    commit((d) => {
      const f = d.fairs.find((x) => x.id === fairId)
      f.status = status
      if (status === 'live') {
        d.students.forEach((s) => pushNote(d, `student:${s.id}`, `${f.name} is Live`, 'Scan a company\u2019s stall QR to share your profile.', '/student/scan', 'fair'))
        f.companyIds.forEach((cid) => pushNote(d, `company:${cid}`, `${f.name} is Live`, 'Your live candidate dashboard is open.', '/recruiter/live', 'fair'))
      }
      audit(d, `Set fair status: ${status}`, f.name)
    }, { type: 'fair', status })
  },
  createFair(data) {
    return commit((d) => {
      const id = uid('fair')
      d.fairs.unshift({ ...data, id, status: 'upcoming', companyIds: d.companies.filter((c) => c.status === 'approved').map((c) => c.id), stallCount: data.stallCount || 24 })
      for (let n = 1; n <= (data.stallCount || 24); n++)
        d.stalls.push({ id: `${id}_s${n}`, fairId: id, number: n, zone: n <= 8 ? 'A' : n <= 16 ? 'B' : 'C', companyId: null, qr: { status: 'none', code: '', generatedAt: null } })
      audit(d, 'Created fair', data.name)
      return id
    })
  },
  updateFair(fairId, patch) {
    commit((d) => Object.assign(d.fairs.find((f) => f.id === fairId), patch))
  },
  updateWeights(fairId, weights) {
    const sum = weights.skills + weights.cgpa + weights.fyp + weights.certs
    if (sum !== 100) return fail('sum', `Weights must add up to 100 (currently ${sum}).`)
    commit((d) => {
      d.fairs.find((f) => f.id === fairId).weights = { ...weights }
      audit(d, 'Updated AI weights', `${weights.skills}/${weights.cgpa}/${weights.fyp}/${weights.certs}`)
    })
    return { ok: true }
  },
  setUserStatus(userId, status) {
    commit((d) => {
      const u = d.users.find((x) => x.id === userId)
      u.status = status
      audit(d, status === 'suspended' ? 'Suspended user' : 'Reactivated user', u.name)
    })
  },
  adminCheckIn(fairId, studentId) {
    if (state.checkins.some((c) => c.fairId === fairId && c.studentId === studentId)) return
    commit((d) => d.checkins.push({ id: uid('ci'), fairId, studentId, at: now() }), { type: 'checkin' })
  },
  updateUniversity(patch) {
    commit((d) => Object.assign(d.university, patch))
  },

  // ----- notifications -----
  markRead(to, id) {
    commit((d) => d.notifications.forEach((n) => n.to === to && (!id || n.id === id) && (n.read = true)))
  },

  // ----- demo -----
  resetDemo() {
    const user = getSessionUser()
    commit((d) => {
      const fresh = createSeed()
      Object.keys(d).forEach((k) => delete d[k])
      Object.assign(d, fresh)
    }, { type: 'reset' })
    if (user && !state.users.some((u) => u.id === user.id)) setSession(null)
  },
  simulateScan(companyId = 'arb') {
    const fair = state.fairs.find((f) => f.status === 'live')
    if (!fair) return fail('not_live', 'Set the fair to Live first.')
    const stall = stallFor(state, fair.id, companyId)
    if (!stall || stall.qr.status !== 'active') return fail('no_qr', 'That company has no active stall QR.')
    const taken = new Set(state.interactions.filter((i) => i.fairId === fair.id && i.companyId === companyId).map((i) => i.studentId))
    const pool = state.students.filter((s) => s.verification === 'verified' && !taken.has(s.id) && s.id !== 'st1' && !s.privacy.hiddenFairs.includes(fair.id))
    if (!pool.length) return fail('empty', 'Every verified student has already visited this stall.')
    const student = pool[Math.floor(Math.random() * pool.length)]
    const ix = commit((d) => createInteraction(d, student.id, companyId, fair.id), { type: 'interaction', companyId, studentId: student.id })
    return { ok: true, interaction: ix, student }
  },
}

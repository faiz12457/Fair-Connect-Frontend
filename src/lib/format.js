export const STATUS = {
  pending: { student: 'New', recruiter: 'New', tone: 'neutral' },
  reviewed: { student: 'Reviewed', recruiter: 'Reviewed', tone: 'brand' },
  shortlisted: { student: 'Shortlisted', recruiter: 'Shortlisted', tone: 'success' },
  interview_invited: { student: 'Interview invited', recruiter: 'Interview invited', tone: 'ai' },
  interview_scheduled: { student: 'Interview scheduled', recruiter: 'Interview scheduled', tone: 'ai' },
  interview_completed: { student: 'Interview done', recruiter: 'Interview done', tone: 'navy' },
  rejected: { student: 'Not progressed', recruiter: 'Skipped', tone: 'gray' },
}

export function statusLabel(status, audience = 'recruiter') {
  return STATUS[status]?.[audience] ?? status
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(iso, opts = {}) {
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', ...opts })
}

export function fmtDateTime(iso) {
  return `${fmtDate(iso, { year: undefined })}, ${fmtTime(iso)}`
}

export function timeAgo(iso) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export function daysUntil(iso) {
  const ms = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(ms / 86400000)
}

export function scoreTone(score) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'gray'
}

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`

export function cx(...args) {
  return args.filter(Boolean).join(' ')
}

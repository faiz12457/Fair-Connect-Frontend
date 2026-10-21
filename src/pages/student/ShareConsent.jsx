import { useState } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router'
import { Check, X, Lock, EyeOff, ShieldCheck, CircleX, Clock, CalendarDays, Ban, UserX, CircleCheck } from 'lucide-react'
import { Logo, Button, CompanyLogo, Card, Badge, StatusPill, IconTile } from '@/components/ui'
import { actions, useStore, useSession, validateShare, stallFor, toast } from '@/store/store'
import { fmtTime, fmtDate } from '@/lib/format'

function Frame({ children }) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4"><Logo size="sm" /></header>
      <main id="main" className="mx-auto max-w-md px-4 py-6 pb-36">{children}</main>
    </div>
  )
}

function StateCard({ icon: Icon, tone = 'brand', title, body, actions: act }) {
  return (
    <Card className="p-6 text-center">
      <IconTile tone={tone} size="lg" className="mx-auto"><Icon className="size-5" /></IconTile>
      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-1.5 text-sm text-ink-600">{body}</p>
      {act && <div className="mt-5 flex flex-col gap-2">{act}</div>}
    </Card>
  )
}

export default function ShareConsent() {
  const { companyId, fairId } = useParams()
  const [params] = useSearchParams()
  const code = params.get('t')
  const s = useStore()
  const { user, student } = useSession()
  const navigate = useNavigate()
  const loc = useLocation()
  const [busy, setBusy] = useState(false)
  const v = validateShare(companyId, fairId, code, s)
  const company = s.companies.find((c) => c.id === companyId)
  const fair = s.fairs.find((f) => f.id === fairId)
  const stall = company && fair ? stallFor(s, fairId, companyId) : null

  const header = company && fair && (
    <div className="mb-4 flex items-center gap-3">
      <CompanyLogo company={company} size="lg" />
      <div className="min-w-0">
        <div className="text-lg font-bold text-ink-900">{company.name}</div>
        <div className="text-[13px] text-ink-400">Stall {stall?.number ?? '—'} · {fair.name}</div>
      </div>
    </div>
  )

  if (!v.ok && ['invalid', 'revoked', 'expired'].includes(v.code))
    return <Frame><StateCard tone="danger" icon={v.code === 'revoked' ? Ban : CircleX} title={v.code === 'revoked' ? 'This stall QR was revoked' : v.code === 'expired' ? 'This QR is out of date' : 'QR not recognised'} body={`${v.message} Ask the recruiter at the stall for the current poster, or pick the stall from the scanner.`} actions={<Button to="/student/scan">Back to scanner</Button>} /></Frame>

  if (v.code === 'signed_out')
    return (
      <Frame>
        {header}
        <StateCard icon={Lock} title="Sign in to share your profile" body={`Use your UOL student account. You’ll come straight back here to confirm what ${company.name} can see.`} actions={<><Button size="lg" onClick={() => navigate(`/login?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`)}>Sign in</Button><Button size="lg" variant="secondary" to="/register/student">Create student account</Button></>} />
      </Frame>
    )
  if (v.code === 'not_student') return <Frame>{header}<StateCard icon={UserX} tone="warning" title="Student accounts only" body={`You're signed in as ${user.name} (${user.role}). Only students can share a profile with a company.`} actions={<Button variant="secondary" onClick={() => (actions.logout(), navigate(`/login?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`))}>Switch account</Button>} /></Frame>
  if (v.code === 'not_live') return <Frame>{header}<StateCard icon={CalendarDays} tone="warning" title={fair.status === 'upcoming' ? 'The fair hasn’t started yet' : 'This fair has ended'} body={fair.status === 'upcoming' ? `Sharing opens when ${fair.name} goes Live on ${fmtDate(fair.date, { weekday: 'long' })}, ${fair.startTime}.` : 'Profiles can no longer be shared for this fair.'} actions={<Button variant="secondary" to="/student">Go to home</Button>} /></Frame>
  if (v.code === 'unverified') return <Frame>{header}<StateCard icon={Clock} tone="warning" title="Verification needed first" body="Career Services hasn’t verified your academic record yet, so companies can’t receive your profile. Visit the Career Services desk at the entrance." actions={<Button variant="secondary" to="/student/profile">View my profile</Button>} /></Frame>
  if (v.code === 'hidden') return <Frame>{header}<StateCard icon={EyeOff} tone="warning" title="Your profile is hidden for this fair" body="Turn visibility back on in Privacy settings to share with companies." actions={<Button to="/student/settings/privacy">Open privacy settings</Button>} /></Frame>
  if (v.code === 'already')
    return (
      <Frame>
        {header}
        <StateCard icon={CircleCheck} tone="success" title={`Already shared at ${fmtTime(v.interaction.createdAt)}`} body={`${company.name} already has your profile. Scanning again doesn’t change anything.`} actions={<><div className="flex justify-center"><StatusPill status={v.interaction.status} audience="student" /></div><Button to={`/student/activity/${v.interaction.id}`}>View status</Button><Button variant="secondary" to="/student/scan">Scan another stall</Button></>} />
      </Frame>
    )

  const p = student.privacy
  const sharing = [
    ['Name, programme & batch', true],
    ['Verified badge from UOL', true],
    ['CGPA', p.showCgpa, 'Hidden — you turned this off'],
    [`Skills (${student.skills.length})`, true],
    ['Final Year Project', !!student.fyp.title, 'Not added'],
    ['Certifications', student.certifications.length > 0, 'None added'],
    ['Resume', !!student.resume, 'Not uploaded'],
    ['GitHub / LinkedIn links', p.showLinks, 'Hidden — you turned this off'],
  ]
  const share = () => {
    setBusy(true)
    const r = actions.shareProfile(companyId, fairId, code)
    if (!r.ok) return setBusy(false)
    toast({ title: `Profile shared with ${company.name}`, tone: 'success' })
    navigate(`/student/shared/${r.interaction.id}`, { replace: true })
  }
  return (
    <Frame>
      {header}
      <Card className="p-5">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-brand-600 uppercase">You are sharing</div>
        <ul className="mt-3 space-y-2.5">
          {sharing.map(([label, on, offLabel]) => (
            <li key={label} className="flex items-start gap-3 text-sm">
              {on ? <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600"><Check className="size-3" strokeWidth={3} /></span> : <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface-muted text-ink-400"><EyeOff className="size-3" /></span>}
              <span className={on ? 'font-medium text-ink-900' : 'text-ink-400'}>{label}{!on && <span className="block text-xs">{offLabel}</span>}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-line pt-4 text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">Not shared</div>
        <ul className="mt-2.5 space-y-2 text-sm text-ink-600">
          {['Phone number', 'Roll number', 'Your activity with other companies'].map((x) => (
            <li key={x} className="flex items-center gap-3"><span className="grid size-5 place-items-center rounded-full bg-danger-50 text-danger-600"><X className="size-3" strokeWidth={3} /></span>{x}</li>
          ))}
        </ul>
      </Card>
      <div className="mt-4 flex items-start gap-2 px-1 text-[13px] text-ink-600"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-600" /> Scanning doesn’t book an interview. {company.name} may shortlist you or invite you — you’ll be notified.</div>
      <div className="mt-2 px-1 text-xs text-ink-400">Signed in as {student.name} · <Badge tone="success" className="px-1.5! py-0! text-[10px]!">Verified</Badge></div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white/95 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <Button size="lg" className="w-full" loading={busy} onClick={share}>Share My Profile</Button>
          <Button size="lg" variant="ghost" className="w-full" onClick={() => navigate('/student/scan')}>Cancel</Button>
        </div>
      </div>
    </Frame>
  )
}

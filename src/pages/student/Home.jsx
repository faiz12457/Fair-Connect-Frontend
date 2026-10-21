import { Link } from 'react-router'
import { ScanLine, BadgeCheck, Clock, ArrowRight, MapPin, CalendarDays, ChevronRight, DoorOpen, Flag } from 'lucide-react'
import { Card, CardHeader, Button, StatusPill, MatchPill, CompanyLogo, Callout, EmptyState, IconTile, Badge } from '@/components/ui'
import { useStudent, suggestionsFor } from './common'
import { completeness } from '@/lib/match'
import { daysUntil, fmtDate, timeAgo } from '@/lib/format'

export default function StudentHome() {
  const { s, student, fair } = useStudent()
  const pct = completeness(student)
  const suggestions = suggestionsFor(s, student, fair)
  const mine = s.interactions.filter((i) => i.studentId === student.id)
  const thisFair = mine.filter((i) => i.fairId === fair.id)
  const checkedIn = s.checkins.some((c) => c.fairId === fair.id && c.studentId === student.id)
  const days = daysUntil(fair.date)
  const firstName = student.name.split(' ')[0]

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[20px] bg-navy-950 p-5 text-white sm:p-7">
        <div className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">Welcome back, {firstName}</span>
              {student.verification === 'verified' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-600/20 px-2 py-0.5 text-[11px] font-semibold text-success-50"><BadgeCheck className="size-3.5" /> Verified</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-600/25 px-2 py-0.5 text-[11px] font-semibold text-warning-50"><Clock className="size-3.5" /> {student.verification === 'flagged' ? 'Needs attention' : 'Verification pending'}</span>
              )}
            </div>
            {fair.status === 'live' ? (
              <>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-[28px]">{fair.name} is Live.</h1>
                <p className="mt-1 text-sm text-white/70">Walk up to a stall and scan the company's QR to share your profile.</p>
              </>
            ) : fair.status === 'upcoming' ? (
              <>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-[28px]">{days > 0 ? `${days} day${days === 1 ? '' : 's'} to ${fair.name}` : `${fair.name} is today`}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/70"><span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> {fmtDate(fair.date, { weekday: 'short' })}, {fair.startTime}–{fair.endTime}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {fair.venue}</span></p>
              </>
            ) : (
              <>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-[28px]">{fair.name} has ended.</h1>
                <p className="mt-1 text-sm text-white/70">Track follow-ups below and read your skill-gap feedback.</p>
              </>
            )}
          </div>
          {fair.status === 'live' ? (
            <Button to="/student/scan" size="lg" variant="white" icon={ScanLine} className="sm:self-center">Scan a stall</Button>
          ) : fair.status === 'ended' ? (
            <Button to={`/student/feedback/${fair.id}`} size="lg" variant="white" className="sm:self-center">View feedback</Button>
          ) : (
            <span className="hidden size-14 shrink-0 place-items-center rounded-xl bg-navy-800 text-sm font-bold sm:grid">QR</span>
          )}
        </div>
        <div className="relative mt-6">
          <div className="flex justify-between text-xs"><span className="text-white/70">Profile completion</span><span className="font-semibold tabular">{pct}%</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-brand-400 transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
          {pct < 100 && <Link to="/student/profile/edit" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-white">Complete your profile <ArrowRight className="size-3" /></Link>}
        </div>
      </section>

      {student.verification !== 'verified' && (
        <Callout tone="warning" title={student.verification === 'flagged' ? 'Your academic record needs attention' : 'Verification in progress'}>
          {student.verification === 'flagged' ? student.verificationNote || 'Career Services found a mismatch. Update your profile or visit the office.' : 'Career Services is matching your profile with registrar records. You can share your profile at stalls once you’re verified.'}
        </Callout>
      )}

      {fair.status === 'live' && !checkedIn && (
        <Card className="flex items-center gap-4 p-4">
          <IconTile tone="success"><DoorOpen className="size-5" /></IconTile>
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink-900">Check in at the gate</div>
            <div className="text-[13px] text-ink-400">Scan the entrance QR so Career Services can count attendance.</div>
          </div>
          <Button size="sm" variant="secondary" to={`/fair/${fair.id}/checkin`}>Check in</Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link to="/student/suggestions"><Card className="p-4 transition-shadow hover:shadow-raised sm:p-5">
          <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Companies to visit</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="text-[28px] font-bold text-ink-900 tabular">{String(suggestions.filter((x) => x.best.score >= 60).length).padStart(2, '0')}</span><span className="text-xs text-success-600">Based on your skills</span></div>
        </Card></Link>
        <Link to="/student/activity"><Card className="p-4 transition-shadow hover:shadow-raised sm:p-5">
          <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Profiles shared</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="text-[28px] font-bold text-ink-900 tabular">{String(thisFair.length).padStart(2, '0')}</span><span className="text-xs text-ink-400">This fair</span></div>
        </Card></Link>
      </div>

      <Card>
        <CardHeader title="Companies you may want to visit" description="Only you can see these suggestions." actions={<Link to="/student/suggestions" className="text-[13px] font-semibold text-brand-600">See all</Link>} />
        <ul className="p-3">
          {suggestions.slice(0, 4).map(({ company, best, stall }) => (
            <li key={company.id}>
              <Link to={`/student/companies/${company.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted">
                <CompanyLogo company={company} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-900">{company.name}</div>
                  <div className="truncate text-[13px] text-ink-400">{best.job.title}{stall && ` · Stall ${stall.number}`}</div>
                </div>
                <MatchPill score={best.score} size="sm" />
                <ChevronRight className="size-4 text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Recent activity" actions={<Link to="/student/activity" className="text-[13px] font-semibold text-brand-600">View all</Link>} />
        {mine.length === 0 ? (
          <EmptyState tile="QR" title="No shared profiles yet" body={fair.status === 'live' ? 'Scan a company’s stall QR to share your profile.' : 'When the fair is Live, scan stalls to share your profile.'} />
        ) : (
          <ul className="p-3">
            {mine.slice(0, 4).map((ix) => {
              const c = s.companies.find((x) => x.id === ix.companyId)
              return (
                <li key={ix.id}>
                  <Link to={`/student/activity/${ix.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted">
                    <CompanyLogo company={c} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">{c.name}</div>
                      <div className="text-xs text-ink-400">Shared {timeAgo(ix.createdAt)}</div>
                    </div>
                    <StatusPill status={ix.status} audience="student" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {fair.status === 'ended' && (
        <Link to={`/student/feedback/${fair.id}`}><Card className="flex items-center gap-4 p-4 hover:shadow-raised">
          <IconTile tone="ai"><Flag className="size-5" /></IconTile>
          <div className="flex-1"><div className="text-sm font-semibold text-ink-900">Post-fair skill-gap feedback</div><div className="text-[13px] text-ink-400">See which skills recruiters asked for most.</div></div>
          <Badge tone="ai">New</Badge>
        </Card></Link>
      )}
    </div>
  )
}

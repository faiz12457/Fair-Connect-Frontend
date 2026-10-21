import { useParams, Link } from 'react-router'
import { Bookmark, MapPin, Globe, Users, ScanLine, Sparkles } from 'lucide-react'
import { Card, Button, CompanyLogo, Badge, MatchPill, Chip, Callout, StatusPill, CardHeader, DecisionSupportNote } from '@/components/ui'
import { actions, stallFor } from '@/store/store'
import { scoreStudentForJob } from '@/lib/match'
import { useStudent } from './common'
import ErrorPage from '@/pages/public/ErrorPage'

export default function CompanyDetail() {
  const { companyId } = useParams()
  const { s, student, fair } = useStudent()
  const c = s.companies.find((x) => x.id === companyId && x.status === 'approved')
  if (!c) return <ErrorPage code={404} />
  const jobs = s.jobs.filter((j) => j.companyId === c.id && j.status === 'active')
  const stall = stallFor(s, fair.id, c.id)
  const marked = student.bookmarks.includes(c.id)
  const shared = s.interactions.find((i) => i.studentId === student.id && i.companyId === c.id && i.fairId === fair.id)
  return (
    <div className="space-y-5">
      <Link to="/student/companies" className="text-[13px] font-semibold text-ink-400 hover:text-ink-700">← Companies</Link>
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <CompanyLogo company={c} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{c.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-400">
              <span>{c.industry}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{c.city}</span>
              <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{c.size}</span>
              <span className="inline-flex items-center gap-1"><Globe className="size-3.5" />{c.website}</span>
            </div>
          </div>
          <Button variant={marked ? 'secondary' : 'primary'} icon={Bookmark} onClick={() => actions.toggleBookmark(c.id)}>{marked ? 'Saved' : 'Save'}</Button>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-600">{c.about}</p>
        {c.perks?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{c.perks.map((p) => <Badge key={p}>{p}</Badge>)}</div>}
      </Card>

      <Card className="flex flex-col gap-4 bg-navy-950 p-5 text-white sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-navy-800 text-lg font-bold tabular">{stall ? stall.number : '—'}</span>
        <div className="flex-1">
          <div className="text-lg font-semibold">{stall ? `Visit at Stall ${stall.number}` : 'Stall not assigned yet'}</div>
          <div className="text-[13px] text-white/70">{fair.name} · Zone {stall?.zone || '—'} · {fair.venue}</div>
        </div>
        {shared ? (
          <div className="flex items-center gap-2"><StatusPill status={shared.status} audience="student" /><Button size="sm" variant="white" to={`/student/activity/${shared.id}`}>View status</Button></div>
        ) : fair.status === 'live' && stall?.qr.status === 'active' ? (
          <Button variant="white" icon={ScanLine} to="/student/scan">Scan stall QR</Button>
        ) : null}
      </Card>

      <Card>
        <CardHeader title={`Open roles (${jobs.length})`} description="Your match is private to you — recruiters only see it after you share." />
        <ul className="divide-y divide-line p-2">
          {jobs.map((j) => {
            const r = scoreStudentForJob(student, j, fair.weights)
            return (
              <li key={j.id} className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink-900">{j.title}</div>
                    <div className="text-[13px] text-ink-400">{j.type} · {j.location} · Min CGPA {j.minCgpa.toFixed(1)} · {j.departments.join(', ')}</div>
                  </div>
                  <MatchPill score={r.score} />
                </div>
                <p className="mt-2 text-sm text-ink-600">{j.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.matchedSkills.map((x) => <Chip key={x} tone="success">{x}</Chip>)}
                  {r.missingSkills.map((x) => <Chip key={x} tone="missing">{x}</Chip>)}
                </div>
              </li>
            )
          })}
        </ul>
        <div className="px-5 pb-5"><DecisionSupportNote compact /></div>
      </Card>
      {!jobs.length && <Callout tone="brand" icon={Sparkles}>This company hasn't posted roles yet.</Callout>}
    </div>
  )
}

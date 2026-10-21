import { useParams } from 'react-router'
import { CalendarClock } from 'lucide-react'
import { PageHeader, Card, CardHeader, CompanyLogo, StatusPill, ScoreRing, ScoreBreakdown, Chip, Timeline, Button, Callout, DecisionSupportNote } from '@/components/ui'
import { useStudent } from './common'
import { fmtDateTime, statusLabel } from '@/lib/format'
import ErrorPage from '@/pages/public/ErrorPage'

const NEXT = {
  pending: 'The recruiter hasn’t reviewed your profile yet. Most companies review during or right after the fair.',
  reviewed: 'The recruiter has looked at your profile. Watch for a shortlist or interview invite.',
  shortlisted: 'You’ve been shortlisted. An interview invite may follow.',
  interview_invited: 'Pick one of the offered slots on the Interviews page.',
  interview_scheduled: 'Your interview is booked. Arrive at the interview desk five minutes early.',
  interview_completed: 'Interview complete. The company will follow up directly.',
  rejected: 'This company isn’t moving forward right now. Your skill-gap feedback can help for next time.',
}

export default function InteractionDetail() {
  const { interactionId } = useParams()
  const { s, student } = useStudent()
  const ix = s.interactions.find((i) => i.id === interactionId)
  if (!ix || ix.studentId !== student.id) return <ErrorPage code={403} />
  const c = s.companies.find((x) => x.id === ix.companyId)
  const job = s.jobs.find((j) => j.id === ix.jobId)
  const fair = s.fairs.find((f) => f.id === ix.fairId)
  const iv = s.interviews.find((i) => i.interactionId === ix.id && i.status !== 'declined')
  const items = ix.history.map((h, i) => ({ title: h.status === 'pending' ? 'Profile shared' : statusLabel(h.status, 'student'), meta: fmtDateTime(h.at), done: true, active: i === ix.history.length - 1 }))
  return (
    <div className="space-y-5">
      <PageHeader back={{ to: '/student/activity', label: 'Activity' }} title={c.name} description={`${job?.title || 'General interest'} · ${fair.name}`} actions={<StatusPill status={ix.status} audience="student" />} />
      <Callout tone={ix.status === 'rejected' ? 'warning' : 'brand'} title="What happens next" action={iv && ix.status.startsWith('interview') && <Button size="sm" variant="secondary" icon={CalendarClock} to="/student/interviews">Interviews</Button>}>{NEXT[ix.status]}</Callout>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Your match" description="Computed when you shared. Only you and this company can see it." />
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
            <ScoreRing score={ix.score} size={96} />
            <div className="flex-1 space-y-4">
              <ScoreBreakdown breakdown={ix.breakdown} weights={ix.weights || fair.weights} cgpaHidden={!student.privacy.showCgpa} />
              <div className="flex flex-wrap gap-1.5">
                {ix.matchedSkills.map((x) => <Chip key={x} tone="success">{x}</Chip>)}
                {ix.missingSkills.map((x) => <Chip key={x} tone="missing">{x}</Chip>)}
              </div>
              <DecisionSupportNote compact />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3"><CompanyLogo company={c} size="sm" /><span className="text-sm font-semibold">Timeline</span></div>
          <Timeline items={items} />
        </Card>
      </div>
    </div>
  )
}

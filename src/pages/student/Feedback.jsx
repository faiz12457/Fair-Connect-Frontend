import { useParams } from 'react-router'
import { Lightbulb, TrendingUp, Target } from 'lucide-react'
import { PageHeader, Card, CardHeader, StatCard, ProgressBar, Chip, EmptyState, Button, DecisionSupportNote } from '@/components/ui'
import { useStudent } from './common'
import ErrorPage from '@/pages/public/ErrorPage'

export default function Feedback() {
  const { fairId } = useParams()
  const { s, student } = useStudent()
  const fair = s.fairs.find((f) => f.id === fairId)
  if (!fair) return <ErrorPage code={404} />
  const mine = s.interactions.filter((i) => i.studentId === student.id && i.fairId === fairId)
  // Demand across all roles at the fair, and what this student is missing
  const jobs = s.jobs.filter((j) => fair.companyIds.includes(j.companyId))
  const demand = {}
  jobs.forEach((j) => j.skills.forEach((k) => (demand[k] = (demand[k] || 0) + 1)))
  const have = new Set(student.skills.map((k) => k.toLowerCase()))
  const gaps = Object.entries(demand).filter(([k]) => !have.has(k.toLowerCase())).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const strengths = Object.entries(demand).filter(([k]) => have.has(k.toLowerCase())).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const max = Math.max(1, ...gaps.map((g) => g[1]))
  const avg = mine.length ? Math.round(mine.reduce((a, i) => a + i.score, 0) / mine.length) : 0
  const progressed = mine.filter((i) => ['shortlisted', 'interview_invited', 'interview_scheduled', 'interview_completed'].includes(i.status)).length
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={fair.name} title="Skill-gap feedback" description="Based on the roles companies posted for this fair and how your profile matched them." />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Companies you shared with" value={mine.length} icon={Target} />
        <StatCard label="Average match" value={mine.length ? `${avg}%` : '—'} icon={TrendingUp} tone="success" />
        <StatCard label="Moved forward" value={progressed} icon={Lightbulb} tone="ai" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Most-requested skills you don’t list" description="Number of roles asking for each skill." />
          {gaps.length ? (
            <ul className="space-y-3 p-5">
              {gaps.map(([k, n]) => (
                <li key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{k}</span><span className="text-ink-400 tabular">{n} roles</span></div>
                  <ProgressBar value={(n / max) * 100} tone="ai" size="sm" />
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Lightbulb} title="No gaps found" body="Your skills cover what companies asked for." />}
        </Card>
        <Card>
          <CardHeader title="Your strengths in demand" />
          <div className="flex flex-wrap gap-2 p-5">{strengths.length ? strengths.map(([k, n]) => <Chip key={k} tone="success">{k} · {n}</Chip>) : <p className="text-sm text-ink-400">Add skills to your profile to see how they compare.</p>}</div>
          <div className="px-5 pb-5"><DecisionSupportNote compact /><Button className="mt-4" variant="secondary" to="/student/profile/edit#skills">Update skills</Button></div>
        </Card>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { Activity as ActivityIcon, ChevronRight } from 'lucide-react'
import { PageHeader, Card, CompanyLogo, StatusPill, MatchPill, EmptyState, Button, SegmentedControl } from '@/components/ui'
import { useStudent } from './common'
import { fmtDateTime } from '@/lib/format'

export default function Activity() {
  const { s, student } = useStudent()
  const fairs = s.fairs.filter((f) => s.interactions.some((i) => i.studentId === student.id && i.fairId === f.id))
  const [fairId, setFairId] = useState(fairs[0]?.id || 'all')
  const list = s.interactions.filter((i) => i.studentId === student.id && (fairId === 'all' || i.fairId === fairId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <div>
      <PageHeader title="Activity" description="Every company you shared your profile with, and where things stand." />
      {fairs.length > 1 && <SegmentedControl className="mb-5" value={fairId} onChange={setFairId} options={fairs.map((f) => ({ value: f.id, label: f.name }))} />}
      {list.length === 0 ? (
        <Card><EmptyState icon={ActivityIcon} title="No shares yet" body="When you scan a stall QR and share your profile, it appears here with live status updates." action={<Button to="/student/suggestions">See companies to visit</Button>} /></Card>
      ) : (
        <Card as="ul" className="divide-y divide-line">
          {list.map((ix) => {
            const c = s.companies.find((x) => x.id === ix.companyId)
            const job = s.jobs.find((j) => j.id === ix.jobId)
            return (
              <li key={ix.id}>
                <Link to={`/student/activity/${ix.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-muted sm:px-5">
                  <CompanyLogo company={c} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900">{c.name}</div>
                    <div className="truncate text-[13px] text-ink-400">{job?.title || 'General interest'} · {fmtDateTime(ix.createdAt)}</div>
                  </div>
                  <div className="hidden sm:block"><MatchPill score={ix.score} size="sm" /></div>
                  <StatusPill status={ix.status} audience="student" />
                  <ChevronRight className="size-4 text-ink-300" />
                </Link>
              </li>
            )
          })}
        </Card>
      )}
    </div>
  )
}

import { useParams } from 'react-router'
import { motion } from 'motion/react'
import { Check, Bell } from 'lucide-react'
import { Card, Button, MatchPill, DecisionSupportNote } from '@/components/ui'
import { useStudent } from './common'
import ErrorPage from '@/pages/public/ErrorPage'

export default function Shared() {
  const { interactionId } = useParams()
  const { s, student } = useStudent()
  const ix = s.interactions.find((i) => i.id === interactionId)
  if (!ix || ix.studentId !== student.id) return <ErrorPage code={403} />
  const company = s.companies.find((c) => c.id === ix.companyId)
  const job = s.jobs.find((j) => j.id === ix.jobId)
  return (
    <div className="mx-auto max-w-md py-4">
      <Card className="p-7 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="mx-auto grid size-20 place-items-center rounded-full bg-success-50">
          <span className="grid size-14 place-items-center rounded-full bg-success-600 text-white"><Check className="size-7" strokeWidth={3} /></span>
        </motion.div>
        <h1 className="mt-5 text-2xl font-bold">Profile shared with {company.name}</h1>
        <p className="mt-1.5 text-sm text-ink-600">Say hello at the stall — they already have your profile.</p>
        {job && (
          <div className="mt-6 rounded-xl bg-surface-muted p-4 text-left">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Your best-match role</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="font-semibold text-ink-900">{job.title}</span>
              <MatchPill score={ix.score} />
            </div>
          </div>
        )}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line p-4 text-left">
          <Bell className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <div className="text-[13px] text-ink-600"><span className="font-semibold text-ink-900">What happens next:</span> the recruiter may shortlist or invite you. You'll be notified.</div>
        </div>
        <DecisionSupportNote compact className="mt-4 text-left" />
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="secondary" to={`/student/activity/${ix.id}`}>View activity</Button>
          <Button to="/student/scan">Scan another stall</Button>
        </div>
      </Card>
    </div>
  )
}

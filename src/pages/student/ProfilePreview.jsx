import { Pencil, FileText, Eye, Sparkles } from 'lucide-react'
import { PageHeader, Button, Card, Callout, ProgressBar, Select } from '@/components/ui'
import StudentProfileView from '@/components/domain/StudentProfileView'
import { useStudent, suggestionsFor } from './common'
import { completeness, aiSummary } from '@/lib/match'
import { useState } from 'react'
import { Link } from 'react-router'

export default function ProfilePreview() {
  const { s, student, fair } = useStudent()
  const sugg = suggestionsFor(s, student, fair)
  const [cid, setCid] = useState(sugg[0]?.company.id)
  const pick = sugg.find((x) => x.company.id === cid) || sugg[0]
  const pct = completeness(student)
  return (
    <div>
      <PageHeader eyebrow="My profile" title="As recruiters see it" description="This is exactly what a company sees after you scan their stall and share your profile." actions={<><Button variant="secondary" icon={FileText} to="/student/profile/resume">Resume</Button><Button icon={Pencil} to="/student/profile/edit">Edit profile</Button></>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <StudentProfileView student={student} matched={pick?.best.matchedSkills} showGithubCard />
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex justify-between text-sm"><span className="font-semibold text-ink-900">Profile completion</span><span className="font-bold tabular">{pct}%</span></div>
            <ProgressBar value={pct} className="mt-3" />
            <p className="mt-3 text-[13px] text-ink-400">Complete profiles get more accurate matches.</p>
          </Card>
          {pick && (
            <Card className="border-ai-600/15 bg-ai-50/40 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ai-700"><Sparkles className="size-4" /> AI summary (preview)</div>
              <Select value={cid} onChange={(e) => setCid(e.target.value)} className="mt-3 h-9 text-[13px]">
                {sugg.map((x) => <option key={x.company.id} value={x.company.id}>{x.company.name} — {x.best.job.title}</option>)}
              </Select>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-700">{aiSummary(student, pick.best.job, pick.best)}</p>
              <p className="mt-3 text-xs text-ai-700/80">Recruiters see a summary like this next to your profile. It’s decision support, never a decision.</p>
            </Card>
          )}
          <Callout tone="brand" icon={Eye} title="Privacy">CGPA is {student.privacy.showCgpa ? 'visible' : 'hidden'}. Links are {student.privacy.showLinks ? 'visible' : 'hidden'}. <Link to="/student/settings/privacy" className="font-semibold underline">Change</Link></Callout>
        </div>
      </div>
    </div>
  )
}

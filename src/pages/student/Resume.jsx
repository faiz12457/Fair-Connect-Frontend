import { FileText, Download, Trash } from 'lucide-react'
import { PageHeader, Card, Button, IconTile } from '@/components/ui'
import ResumeUploader from '@/components/domain/ResumeUploader'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'
import { fmtDate } from '@/lib/format'

export default function Resume() {
  const { student } = useStudent()
  return (
    <div>
      <PageHeader back={{ to: '/student/profile', label: 'Profile' }} title="Resume" description="Upload a new version anytime. AI suggests skills; you confirm them." />
      {student.resume && (
        <Card className="mb-5 flex items-center gap-4 p-4">
          <IconTile tone="danger"><FileText className="size-5" /></IconTile>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink-900">{student.resume.fileName}</div>
            <div className="text-[13px] text-ink-400">{student.resume.size} · Uploaded {fmtDate(student.resume.uploadedAt)}</div>
          </div>
          <Button size="sm" variant="ghost" icon={Download} onClick={() => toast('Download simulated in prototype')}>Download</Button>
          <Button size="sm" variant="ghost" icon={Trash} onClick={() => (actions.updateStudent({ resume: null }), toast({ title: 'Resume removed' }))}>Remove</Button>
        </Card>
      )}
      <ResumeUploader existingSkills={student.skills} onDone={({ file, skills }) => {
        actions.updateStudent((st) => ({ resume: file, skills: [...st.skills, ...skills] }))
        toast({ title: 'Resume saved', description: skills.length ? `${skills.length} skills added to your profile.` : undefined, tone: 'success' })
      }} />
    </div>
  )
}

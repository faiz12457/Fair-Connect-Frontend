import { PageHeader, Card, CardHeader, Switch, PrivacyNote, Callout, LiveIndicator } from '@/components/ui'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'

export default function Privacy() {
  const { s, student, fair } = useStudent()
  const p = student.privacy
  const set = (patch, msg) => {
    actions.updateStudent((st) => ({ privacy: { ...st.privacy, ...patch } }))
    toast({ title: msg, tone: 'success' })
  }
  const fairs = s.fairs.filter((f) => f.status === 'live' || f.status === 'upcoming')
  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Privacy" description="Control what companies see when you share. Changes apply to future shares." />
      <Card>
        <CardHeader title="What you share" />
        <div className="space-y-5 p-5">
          <Switch checked={p.showCgpa} disabled={!fair.policy.allowCgpaHiding} onChange={(v) => set({ showCgpa: v }, v ? 'CGPA will be shared' : 'CGPA hidden from companies')} label="Show CGPA" description="When off, companies see “CGPA hidden” and your score is computed without it." />
          <Switch checked={p.showLinks} onChange={(v) => set({ showLinks: v }, v ? 'Links will be shared' : 'Links hidden from companies')} label="Show GitHub, LinkedIn & portfolio" />
          <PrivacyNote>Your phone number and roll number are never shown to companies.</PrivacyNote>
        </div>
      </Card>
      <Card>
        <CardHeader title="Fair visibility" description="Hiding a fair stops any new shares for that fair. Existing shares stay with the company." />
        <div className="space-y-5 p-5">
          {fairs.map((f) => {
            const visible = !p.hiddenFairs.includes(f.id)
            return <Switch key={f.id} checked={visible} onChange={(v) => set({ hiddenFairs: v ? p.hiddenFairs.filter((x) => x !== f.id) : [...p.hiddenFairs, f.id] }, v ? `Visible for ${f.name}` : `Hidden for ${f.name}`)} label={<span className="inline-flex items-center gap-2">{f.name} <LiveIndicator status={f.status} /></span>} description={visible ? 'Companies can receive your profile when you scan.' : 'Scanning a stall QR won’t share your profile.'} />
          })}
        </div>
      </Card>
      <Callout tone="brand" title="Data retention">Career Services keeps fair interactions for {fair.policy.retentionDays} days after the fair, then removes them from recruiter views.</Callout>
    </div>
  )
}

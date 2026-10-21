import { useMemo, useState } from 'react'
import { useBlocker } from 'react-router'
import { PageHeader, Card, Field, Input, Select, Textarea, Button, Callout, ConfirmDialog } from '@/components/ui'
import SkillInput from '@/components/domain/SkillInput'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'

function Section({ id, title, description, children }) {
  return (
    <Card id={id} className="scroll-mt-24 p-5 sm:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-ink-400">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </Card>
  )
}

export default function ProfileEdit() {
  const { student } = useStudent()
  const [d, setD] = useState(() => structuredClone(student))
  const dirty = useMemo(() => JSON.stringify(d) !== JSON.stringify(student), [d, student])
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname)
  const set = (patch) => setD((x) => ({ ...x, ...patch }))
  const save = () => {
    const cgpaChanged = d.cgpa !== student.cgpa
    actions.updateStudent({ ...d, verification: cgpaChanged ? 'pending' : d.verification })
    toast({ title: 'Profile saved', description: cgpaChanged ? 'CGPA changed — Career Services will re-verify it.' : undefined, tone: 'success' })
  }
  return (
    <div>
      <PageHeader back={{ to: '/student/profile', label: 'Profile' }} title="Edit profile" />
      <nav className="mb-5 flex gap-2 overflow-x-auto">
        {[['basics', 'Basics'], ['academic', 'Academic'], ['skills', 'Skills'], ['fyp', 'FYP'], ['links', 'Links']].map(([id, l]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line bg-white px-3 py-1 text-[13px] font-semibold text-ink-600 hover:border-brand-300">{l}</a>
        ))}
      </nav>
      <div className="space-y-4">
        <Section id="basics" title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={d.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Phone" hint="Never shown to recruiters."><Input value={d.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          </div>
          <Field label="Bio"><Textarea value={d.bio} onChange={(e) => set({ bio: e.target.value })} /></Field>
        </Section>
        <Section id="academic" title="Academic" description="Changing your CGPA sends your profile back for verification.">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Programme"><Select value={d.department} onChange={(e) => set({ department: e.target.value })}>{['BSCS', 'BSSE', 'BSAI', 'BSIT', 'BSDS'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
            <Field label="Batch"><Input value={d.batch} onChange={(e) => set({ batch: e.target.value })} /></Field>
            <Field label="Semester"><Input type="number" value={d.semester} onChange={(e) => set({ semester: Number(e.target.value) })} /></Field>
            <Field label="CGPA"><Input type="number" step="0.01" value={d.cgpa} onChange={(e) => set({ cgpa: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Roll number" hint="Set by registrar."><Input value={d.rollNo} disabled /></Field>
        </Section>
        <Section id="skills" title="Skills & certifications">
          <Field label="Skills"><SkillInput value={d.skills} onChange={(skills) => set({ skills })} /></Field>
          <Field label="Certifications"><SkillInput value={d.certifications} onChange={(certifications) => set({ certifications })} placeholder="Add a certification" suggestions={[]} /></Field>
        </Section>
        <Section id="fyp" title="Final Year Project">
          <Field label="Title"><Input value={d.fyp.title} onChange={(e) => set({ fyp: { ...d.fyp, title: e.target.value } })} /></Field>
          <Field label="Abstract"><Textarea value={d.fyp.abstract} onChange={(e) => set({ fyp: { ...d.fyp, abstract: e.target.value } })} /></Field>
          <Field label="Stack"><SkillInput value={d.fyp.stack} onChange={(stack) => set({ fyp: { ...d.fyp, stack } })} suggestions={[]} /></Field>
        </Section>
        <Section id="links" title="Links">
          {[['github', 'GitHub'], ['linkedin', 'LinkedIn'], ['portfolio', 'Portfolio']].map(([k, l]) => (
            <Field key={k} label={l}><Input value={d.links[k]} onChange={(e) => set({ links: { ...d.links, [k]: e.target.value } })} /></Field>
          ))}
        </Section>
      </div>
      {dirty && (
        <div className="sticky bottom-20 z-10 mt-5 lg:bottom-4">
          <Callout tone="brand" title="You have unsaved changes" className="bg-white shadow-raised" action={<div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => setD(structuredClone(student))}>Discard</Button><Button size="sm" onClick={save}>Save changes</Button></div>} />
        </div>
      )}
      <ConfirmDialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} title="Leave without saving?" body="Your profile changes will be lost." confirmLabel="Leave page" tone="danger" />
    </div>
  )
}

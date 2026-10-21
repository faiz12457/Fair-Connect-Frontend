import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FileText } from 'lucide-react'
import { Logo, Button, Field, Input, Select, Textarea, Stepper, Switch, Card, PrivacyNote, Callout } from '@/components/ui'
import SkillInput from '@/components/domain/SkillInput'
import ResumeUploader from '@/components/domain/ResumeUploader'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'

const STEPS = ['Academic', 'Skills', 'FYP', 'Resume', 'Links', 'Privacy']

export default function Onboarding() {
  const { student } = useStudent()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [d, setD] = useState(() => structuredClone(student))
  const [err, setErr] = useState({})
  const set = (patch) => setD((x) => ({ ...x, ...patch }))

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!(d.cgpa > 0 && d.cgpa <= 4)) e.cgpa = 'Enter a CGPA between 0.00 and 4.00.'
    }
    if (step === 1 && d.skills.length < 3) e.skills = 'Add at least 3 skills so we can match you.'
    setErr(e)
    return !Object.keys(e).length
  }
  const next = () => {
    if (!validate()) return
    if (step < STEPS.length - 1) return setStep(step + 1)
    actions.updateStudent({ ...d, onboarded: true })
    toast({ title: 'Profile ready', description: 'You can edit it anytime from Profile.', tone: 'success' })
    navigate('/student')
  }
  const skip = () => (step < STEPS.length - 1 ? setStep(step + 1) : next())

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-5"><Logo to="/student" size="sm" /><span className="text-[13px] font-semibold text-ink-400 tabular">Step {step + 1} of {STEPS.length}</span></header>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Stepper steps={STEPS} current={step} onStep={setStep} />
        <Card className="mt-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-bold">Academic details</h1><p className="mt-1 text-sm text-ink-600">Career Services verifies these against registrar records.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Programme"><Select value={d.department} onChange={(e) => set({ department: e.target.value })}>{['BSCS', 'BSSE', 'BSAI', 'BSIT', 'BSDS'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
                <Field label="Batch"><Select value={d.batch} onChange={(e) => set({ batch: e.target.value })}>{['Fall 2020', 'Fall 2021', 'Spring 2022', 'Fall 2022'].map((x) => <option key={x}>{x}</option>)}</Select></Field>
                <Field label="Current semester"><Select value={d.semester} onChange={(e) => set({ semester: Number(e.target.value) })}>{[5, 6, 7, 8].map((x) => <option key={x} value={x}>{x}</option>)}</Select></Field>
                <Field label="CGPA" error={err.cgpa} required><Input type="number" step="0.01" min="0" max="4" value={d.cgpa || ''} onChange={(e) => set({ cgpa: Number(e.target.value) })} aria-invalid={!!err.cgpa} placeholder="3.45" /></Field>
              </div>
              <Field label="Short bio" hint="One or two lines recruiters will read first."><Textarea value={d.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="Final-year CS student who enjoys…" /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-bold">Your skills</h1><p className="mt-1 text-sm text-ink-600">Skills carry 40% of the AI match score. Be specific.</p></div>
              <Field error={err.skills}><SkillInput value={d.skills} onChange={(skills) => set({ skills })} /></Field>
              <Field label="Certifications" hint="Press Enter after each."><SkillInput value={d.certifications} onChange={(certifications) => set({ certifications })} placeholder="e.g. AWS Cloud Practitioner" suggestions={['AWS Cloud Practitioner', 'Google Data Analytics', 'Meta Front-End Developer', 'Microsoft Azure Fundamentals']} /></Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-bold">Final Year Project</h1><p className="mt-1 text-sm text-ink-600">FYP relevance is 25% of the match score.</p></div>
              <Field label="Project title"><Input value={d.fyp.title} onChange={(e) => set({ fyp: { ...d.fyp, title: e.target.value } })} placeholder="MediQueue — Hospital Queue Optimisation" /></Field>
              <Field label="Abstract"><Textarea value={d.fyp.abstract} onChange={(e) => set({ fyp: { ...d.fyp, abstract: e.target.value } })} placeholder="What does it do, and how?" /></Field>
              <Field label="Tech stack"><SkillInput value={d.fyp.stack} onChange={(stack) => set({ fyp: { ...d.fyp, stack } })} placeholder="Django, React…" /></Field>
              <Field label="Supervisor"><Input value={d.fyp.supervisor} onChange={(e) => set({ fyp: { ...d.fyp, supervisor: e.target.value } })} /></Field>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-bold">Resume</h1><p className="mt-1 text-sm text-ink-600">Upload once — AI suggests skills you may have missed.</p></div>
              {d.resume && <Callout tone="success" icon={FileText} title={d.resume.fileName}>Uploaded · {d.resume.size}</Callout>}
              <ResumeUploader existingSkills={d.skills} onDone={({ file, skills }) => set({ resume: file, skills: [...d.skills, ...skills] })} />
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div><h1 className="text-xl font-bold">Links</h1><p className="mt-1 text-sm text-ink-600">Optional, but recruiters love seeing real work.</p></div>
              {[['github', 'GitHub', 'github.com/username'], ['linkedin', 'LinkedIn', 'linkedin.com/in/username'], ['portfolio', 'Portfolio', 'yourname.dev']].map(([k, l, p]) => (
                <Field key={k} label={l}><Input value={d.links[k]} onChange={(e) => set({ links: { ...d.links, [k]: e.target.value } })} placeholder={p} /></Field>
              ))}
              <Field label="Phone" hint="Only Career Services can see this. Recruiters never do."><Input value={d.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+92 300 0000000" /></Field>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-5">
              <div><h1 className="text-xl font-bold">Privacy</h1><p className="mt-1 text-sm text-ink-600">You decide what a recruiter sees after you scan their stall.</p></div>
              <Switch checked={d.privacy.showCgpa} onChange={(v) => set({ privacy: { ...d.privacy, showCgpa: v } })} label="Show my CGPA to recruiters" description="If hidden, recruiters see “Hidden by student”. Your match score still accounts for it." />
              <Switch checked={d.privacy.showLinks} onChange={(v) => set({ privacy: { ...d.privacy, showLinks: v } })} label="Show my links" description="GitHub, LinkedIn and portfolio." />
              <PrivacyNote>Recruiters only see your profile after you scan their stall QR and tap Share My Profile. Your phone number is never shared.</PrivacyNote>
            </div>
          )}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
            <div className="flex gap-2">
              {step > 0 && step < 5 && <Button variant="secondary" onClick={skip}>Skip for now</Button>}
              <Button onClick={next}>{step === STEPS.length - 1 ? 'Finish' : 'Continue'}</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

import { BadgeCheck, GraduationCap, FileText, Link as LinkIcon, Globe, Award, Lightbulb, EyeOff, Clock } from 'lucide-react'
import { Card, Avatar, Badge, Chip, IconTile } from '@/components/ui'

/** Renders a student profile exactly as a recruiter would see it. Phone is never rendered. */
export default function StudentProfileView({ student, matched = [], showGithubCard }) {
  const p = student.privacy
  const matchedSet = new Set(matched.map((m) => m.toLowerCase()))
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={student.name} tint={student.tint} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{student.name}</h2>
              {student.verification === 'verified' ? <Badge tone="success" icon={BadgeCheck}>Verified by UOL</Badge> : <Badge tone="warning" icon={Clock}>Verification pending</Badge>}
            </div>
            <div className="mt-0.5 text-sm text-ink-600">{student.department} · {student.batch} · Semester {student.semester}</div>
            {student.bio && <p className="mt-2 text-sm text-ink-600">{student.bio}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-muted px-3 py-2.5">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">CGPA</div>
            {p.showCgpa ? <div className="text-lg font-bold text-ink-900 tabular">{student.cgpa.toFixed(2)}</div> : <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink-400"><EyeOff className="size-4" /> Hidden by student</div>}
          </div>
          <div className="rounded-xl bg-surface-muted px-3 py-2.5">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Skills</div>
            <div className="text-lg font-bold text-ink-900 tabular">{student.skills.length}</div>
          </div>
          <div className="col-span-2 rounded-xl bg-surface-muted px-3 py-2.5 sm:col-span-1">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Resume</div>
            <div className="truncate text-sm font-semibold text-ink-900">{student.resume ? student.resume.fileName : 'Not uploaded'}</div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-[15px] font-semibold">Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {student.skills.length ? student.skills.map((s) => <Chip key={s} tone={matchedSet.has(s.toLowerCase()) ? 'success' : undefined}>{s}</Chip>) : <span className="text-sm text-ink-400">No skills added yet.</span>}
        </div>
      </Card>

      {student.fyp?.title && (
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <IconTile tone="orange" size="sm"><Lightbulb className="size-4" /></IconTile>
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">Final Year Project</div>
              <h3 className="text-[15px] font-semibold">{student.fyp.title}</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">{student.fyp.abstract}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {student.fyp.stack.map((s) => <span key={s} className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs text-ink-700">{s}</span>)}
            {student.fyp.supervisor && <span className="ml-auto text-xs text-ink-400">Supervisor: {student.fyp.supervisor}</span>}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold"><Award className="size-4 text-ink-400" /> Certifications</h3>
          <ul className="mt-3 space-y-2">
            {student.certifications.length ? student.certifications.map((c) => <li key={c} className="text-sm text-ink-700">{c}</li>) : <li className="text-sm text-ink-400">None listed</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold"><LinkIcon className="size-4 text-ink-400" /> Links</h3>
          {p.showLinks ? (
            <ul className="mt-3 space-y-2 text-sm">
              {student.links.github && <li className="flex items-center gap-2 text-brand-700"><span className="grid size-5 place-items-center rounded bg-ink-900 text-[9px] font-bold text-white">GH</span>{student.links.github}</li>}
              {student.links.linkedin && <li className="flex items-center gap-2 text-brand-700"><span className="grid size-5 place-items-center rounded bg-[#0A66C2] text-[9px] font-bold text-white">in</span>{student.links.linkedin}</li>}
              {student.links.portfolio && <li className="flex items-center gap-2 text-brand-700"><Globe className="size-4" />{student.links.portfolio}</li>}
              {!student.links.github && !student.links.linkedin && !student.links.portfolio && <li className="text-ink-400">No links added</li>}
            </ul>
          ) : (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-ink-400"><EyeOff className="size-4" /> Hidden by student</div>
          )}
        </Card>
      </div>

      {showGithubCard && p.showLinks && student.links.github && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">GitHub activity</h3>
            <Badge tone="gray">Preview · static</Badge>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {[['Repos', 24], ['Commits (12 mo)', 412], ['Top language', 'Python']].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-surface-muted py-3"><div className="text-base font-bold text-ink-900 tabular">{v}</div><div className="text-[11px] text-ink-400">{l}</div></div>
            ))}
          </div>
          <div className="mt-3 flex gap-[3px]">
            {Array.from({ length: 52 }).map((_, i) => <span key={i} className="h-6 flex-1 rounded-[2px]" style={{ background: `rgba(37,99,235,${0.1 + ((i * 37) % 10) / 12})` }} />)}
          </div>
        </Card>
      )}
      <div className="flex items-center gap-2 px-1 text-xs text-ink-400"><FileText className="size-3.5" /> Phone number and roll number are never shown to recruiters. <GraduationCap className="ml-auto size-3.5" /> UOL</div>
    </div>
  )
}

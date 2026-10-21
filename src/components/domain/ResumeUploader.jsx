import { useRef, useState } from 'react'
import { Upload, FileText, RotateCcw, Sparkles } from 'lucide-react'
import { Button, Skeleton, Callout, Checkbox } from '@/components/ui'

const PARSED = ['Python', 'Django', 'REST', 'Docker', 'SQL', 'Git', 'Linux', 'React', 'Agile', 'Unit Testing']

/** Simulated resume upload + AI skill extraction. Calls onDone({ file, skills }) with confirmed skills. */
export default function ResumeUploader({ existingSkills = [], onDone, compact }) {
  const input = useRef(null)
  const [stage, setStage] = useState('idle') // idle | parsing | parsed | failed
  const [file, setFile] = useState(null)
  const [picked, setPicked] = useState([])

  const start = (f) => {
    setFile(f)
    if (!/\.(pdf|docx?)$/i.test(f.name)) return setStage('failed')
    setStage('parsing')
    setTimeout(() => {
      const found = PARSED.filter((p) => !existingSkills.some((s) => s.toLowerCase() === p.toLowerCase())).slice(0, 7)
      setPicked(found)
      setStage('parsed')
    }, 1500)
  }

  if (stage === 'parsing')
    return (
      <div className="rounded-2xl border border-line p-5" aria-live="polite">
        <div className="flex items-center gap-3 text-sm font-semibold text-ink-900"><Sparkles className="size-4 animate-pulse text-ai-600" /> Reading {file.name}…</div>
        <div className="mt-4 space-y-2.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/3" /></div>
        <div className="mt-4 flex gap-2"><Skeleton className="h-7 w-16 rounded-full" /><Skeleton className="h-7 w-20 rounded-full" /><Skeleton className="h-7 w-14 rounded-full" /></div>
      </div>
    )
  if (stage === 'failed')
    return (
      <Callout tone="danger" title="We couldn’t read that file" action={<Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => setStage('idle')}>Try again</Button>}>
        {file?.name} isn’t a PDF or Word document. Upload a .pdf or .docx under 5 MB.
      </Callout>
    )
  if (stage === 'parsed') {
    const all = PARSED.filter((p) => !existingSkills.some((s) => s.toLowerCase() === p.toLowerCase())).slice(0, 7)
    return (
      <div className="rounded-2xl border border-ai-600/20 bg-ai-50/50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ai-700"><Sparkles className="size-4" /> AI found {all.length} skills in {file.name}</div>
        <p className="mt-1 text-[13px] text-ink-600">Confirm the ones that are accurate. Nothing is added until you confirm.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {all.map((sk) => <Checkbox key={sk} label={sk} checked={picked.includes(sk)} onChange={(v) => setPicked(v ? [...picked, sk] : picked.filter((x) => x !== sk))} />)}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => (onDone({ file: { fileName: file.name, uploadedAt: new Date().toISOString(), size: file.size ? `${Math.round(file.size / 1024)} KB` : '182 KB' }, skills: picked }), setStage('idle'))}>Add {picked.length} skills & save resume</Button>
          <Button variant="ghost" onClick={() => setStage('idle')}>Cancel</Button>
        </div>
      </div>
    )
  }
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => (e.preventDefault(), e.dataTransfer.files[0] && start(e.dataTransfer.files[0]))}
      className={`flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-surface-muted/60 text-center ${compact ? 'p-5' : 'p-8'}`}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-white text-brand-600 shadow-card"><Upload className="size-5" /></span>
      <div className="mt-3 text-sm font-semibold text-ink-900">Drop your resume here</div>
      <div className="mt-0.5 text-[13px] text-ink-400">PDF or DOCX, up to 5 MB</div>
      <input ref={input} type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files[0] && start(e.target.files[0])} />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => input.current.click()}>Choose file</Button>
        <Button size="sm" variant="secondary" icon={FileText} onClick={() => start({ name: 'Sample_Resume.pdf', size: 186000 })}>Use sample resume</Button>
      </div>
    </div>
  )
}

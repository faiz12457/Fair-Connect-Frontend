import { useState } from 'react'
import { Chip, Input } from '@/components/ui'

const SUGGEST = ['Python', 'JavaScript', 'React', 'Node.js', 'Django', 'Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Machine Learning', 'TensorFlow', 'Flutter', 'Figma', 'C++', 'TypeScript', 'REST', 'Git', 'Power BI', 'NLP', 'Linux']

export default function SkillInput({ value, onChange, placeholder = 'Type a skill and press Enter', suggestions = SUGGEST }) {
  const [text, setText] = useState('')
  const add = (s) => {
    const v = s.trim()
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v])
    setText('')
  }
  const rest = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 10)
  return (
    <div>
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text) } }} />
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((s) => <Chip key={s} onRemove={() => onChange(value.filter((x) => x !== s))}>{s}</Chip>)}
        </div>
      )}
      {rest.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-ink-400">Suggestions:</span>
          {rest.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-ink-300 px-2.5 py-0.5 text-xs font-medium text-ink-600 hover:border-brand-600 hover:text-brand-700">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  )
}

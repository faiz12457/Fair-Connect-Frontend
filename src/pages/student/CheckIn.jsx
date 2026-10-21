import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { Check, CalendarDays, Lock, CircleX } from 'lucide-react'
import { Logo, Card, Button, IconTile } from '@/components/ui'
import { actions, useStore, useSession } from '@/store/store'
import { fmtTime, fmtDate } from '@/lib/format'

export default function CheckIn() {
  const { fairId } = useParams()
  const s = useStore()
  const { user, student } = useSession()
  const loc = useLocation()
  const nav = useNavigate()
  const fair = s.fairs.find((f) => f.id === fairId)
  const existing = student && s.checkins.find((c) => c.fairId === fairId && c.studentId === student.id)
  const [err, setErr] = useState('')

  let body
  if (!fair) body = <State icon={CircleX} tone="danger" title="Unknown fair" text="This check-in code isn’t valid." />
  else if (!user) body = <State icon={Lock} title={`Check in to ${fair.name}`} text="Sign in with your UOL student account to check in at the gate." action={<Button size="lg" className="w-full" onClick={() => nav(`/login?returnTo=${encodeURIComponent(loc.pathname)}`)}>Sign in</Button>} />
  else if (user.role !== 'student') body = <State icon={CircleX} tone="warning" title="Students only" text="Gate check-in is for student accounts." />
  else if (existing)
    body = (
      <div className="text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid size-20 place-items-center rounded-full bg-success-50"><span className="grid size-14 place-items-center rounded-full bg-success-600 text-white"><Check className="size-7" strokeWidth={3} /></span></motion.div>
        <h1 className="mt-5 text-2xl font-bold">You’re checked in</h1>
        <p className="mt-1 text-sm text-ink-600">{student.name} · {fmtTime(existing.at)}</p>
        <p className="mt-1 text-[13px] text-ink-400">{fair.venue}</p>
        <Button size="lg" className="mt-6 w-full" to={fair.status === 'live' ? '/student/scan' : '/student'}>{fair.status === 'live' ? 'Start scanning stalls' : 'Go to home'}</Button>
      </div>
    )
  else if (fair.status === 'ended' || fair.status === 'archived') body = <State icon={CalendarDays} tone="warning" title="This fair has ended" text="Check-in is closed." />
  else
    body = (
      <State icon={CalendarDays} title={fair.name} text={`${fmtDate(fair.date, { weekday: 'long' })} · ${fair.startTime}–${fair.endTime} · ${fair.venue}`} action={<><Button size="lg" className="w-full" onClick={() => { const r = actions.checkIn(fair.id); if (!r.ok && r.code !== 'already') setErr(r.message) }}>Check in as {student.name}</Button>{err && <p className="mt-2 text-[13px] text-danger-600">{err}</p>}</>} />
    )

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="flex h-14 items-center border-b border-line bg-white px-4"><Logo size="sm" /></header>
      <main id="main" className="mx-auto max-w-md px-4 py-10"><Card className="p-7">{body}</Card></main>
    </div>
  )
}

function State({ icon: Icon, tone = 'brand', title, text, action }) {
  return (
    <div className="text-center">
      <IconTile tone={tone} size="lg" className="mx-auto"><Icon className="size-5" /></IconTile>
      <h1 className="mt-4 text-xl font-bold">{title}</h1>
      <p className="mt-1.5 text-sm text-ink-600">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

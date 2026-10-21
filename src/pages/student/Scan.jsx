import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Keyboard, CircleCheck, CameraOff, CalendarDays, ScanLine, ChevronUp } from 'lucide-react'
import { Button, Input, CompanyLogo, Card, EmptyState, Callout } from '@/components/ui'
import { useStudent } from './common'
import { stallPath } from '@/lib/qr'
import { fmtDate, cx } from '@/lib/format'

export default function Scan() {
  const { s, fair } = useStudent()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState(false)
  const [q, setQ] = useState('')
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const [detected, setDetected] = useState(null)
  const [denied, setDenied] = useState(false)

  if (fair.status !== 'live')
    return (
      <div className="px-4 pt-5 lg:px-0 lg:pt-0">
        <Card>
          <EmptyState icon={CalendarDays} title={fair.status === 'upcoming' ? 'Scanning opens when the fair goes Live' : 'This fair has ended'} body={fair.status === 'upcoming' ? `${fair.name} starts ${fmtDate(fair.date, { weekday: 'long' })} at ${fair.startTime}. Until then, plan which stalls to visit.` : 'You can no longer share your profile at stalls. Check Activity for follow-ups.'} action={<Button to={fair.status === 'upcoming' ? '/student/suggestions' : '/student/activity'}>{fair.status === 'upcoming' ? 'See companies to visit' : 'View activity'}</Button>} />
        </Card>
      </div>
    )

  const stalls = s.stalls
    .filter((st) => st.fairId === fair.id && st.companyId && st.qr.status === 'active')
    .map((st) => ({ ...st, company: s.companies.find((c) => c.id === st.companyId) }))
    .filter((st) => st.company?.status === 'approved')
    .filter((st) => !q || st.company.name.toLowerCase().includes(q.toLowerCase()) || String(st.number) === q.trim())
    .sort((a, b) => a.number - b.number)

  const go = (st) => {
    setSheet(false)
    setDetected(st)
    setTimeout(() => navigate(stallPath(st.companyId, fair.id, st.qr.code)), 900)
  }
  const submitCode = (e) => {
    e.preventDefault()
    const st = s.stalls.find((x) => x.fairId === fair.id && x.qr.code && x.qr.code.toLowerCase() === code.trim().toLowerCase())
    if (!st) return setCodeErr('No active stall matches that code. Check the code under the QR on the poster.')
    if (st.qr.status !== 'active') return setCodeErr('That stall QR has been revoked.')
    go({ ...st, company: s.companies.find((c) => c.id === st.companyId) })
  }

  return (
    <div className="relative min-h-[calc(100dvh-56px-72px)] overflow-hidden bg-navy-950 lg:min-h-0 lg:rounded-[20px]">
      <div className="flex flex-col items-center px-6 pt-10 pb-40 lg:pb-10">
        <div className="relative size-[264px]">
          {denied ? (
            <div className="grid size-full place-items-center rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
              <div>
                <CameraOff className="mx-auto size-8 text-white/60" />
                <div className="mt-3 text-sm font-semibold text-white">Camera access is blocked</div>
                <div className="mt-1 text-[13px] text-white/60">Allow camera access in your browser settings, or pick the stall below.</div>
                <button onClick={() => setDenied(false)} className="mt-3 text-[13px] font-semibold text-brand-300">Try again</button>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_40%,rgba(96,165,250,0.18),transparent_65%)]" />
              {['top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl'].map((c) => (
                <span key={c} className={cx('absolute size-14', detected ? 'border-success-600' : 'border-white', c)} />
              ))}
              {!detected && <span className="absolute inset-x-4 top-4 h-0.5 animate-scan rounded-full bg-brand-400 shadow-[0_0_16px_4px_rgba(96,165,250,0.6)]" />}
              <AnimatePresence>
                {detected && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <motion.div initial={{ scale: 0.4 }} animate={{ scale: [0.4, 1.15, 1] }} transition={{ duration: 0.45 }}><CircleCheck className="mx-auto size-14 text-success-600" /></motion.div>
                      <div className="mt-3 text-sm font-semibold text-white">QR detected</div>
                      <div className="text-[13px] text-white/70">{detected.company.name} · Stall {detected.number}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-[15px] font-semibold text-white">Point at the company’s stall QR</p>
        <p className="mt-1 max-w-xs text-center text-[13px] text-white/60">Scanning opens a consent screen. Nothing is shared until you tap Share My Profile.</p>
        <p className="mt-4 text-center text-[11px] text-white/40">Camera preview is simulated in this prototype. <button className="underline" onClick={() => setDenied(true)}>Simulate camera denied</button></p>
        <div className="mt-6 hidden gap-2 lg:flex">
          <Button variant="white" icon={Search} onClick={() => setSheet(true)}>Can't scan? Pick the stall</Button>
        </div>
      </div>

      {/* bottom sheet trigger (mobile) */}
      <button onClick={() => setSheet(true)} className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pt-3 pb-6 text-left lg:hidden">
        <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line" />
        <span className="flex items-center justify-between">
          <span><span className="block text-[15px] font-semibold text-ink-900">Can't scan? Pick the stall</span><span className="text-[13px] text-ink-400">Or enter the code printed under the QR</span></span>
          <ChevronUp className="size-5 text-ink-400" />
        </span>
      </button>

      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-950/60" onClick={() => setSheet(false)} />
            <motion.div role="dialog" aria-label="Pick a stall" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.22, ease: 'easeOut' }} className="relative flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl bg-white lg:rounded-3xl">
              <div className="border-b border-line px-5 pt-3 pb-4">
                <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line lg:hidden" />
                <div className="text-[15px] font-semibold text-ink-900">Pick the stall you're standing at</div>
                <Input icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company name or stall #" className="mt-3" aria-label="Search stalls" />
              </div>
              <ul className="flex-1 overflow-y-auto p-2">
                {stalls.map((st) => (
                  <li key={st.id}>
                    <button onClick={() => go(st)} className="flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-muted">
                      <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-navy-950 text-sm font-bold text-white tabular">{st.number}</span>
                      <CompanyLogo company={st.company} size="sm" />
                      <span className="flex-1 text-sm font-semibold text-ink-900">{st.company.name}</span>
                      <ScanLine className="size-4 text-ink-300" />
                    </button>
                  </li>
                ))}
                {!stalls.length && <li className="px-3 py-8 text-center text-sm text-ink-400">No live stalls match “{q}”.</li>}
              </ul>
              <form onSubmit={submitCode} className="border-t border-line p-4">
                <label className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900"><Keyboard className="size-4 text-ink-400" /> Enter code</label>
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => (setCode(e.target.value), setCodeErr(''))} placeholder="e.g. ARB-14-2571" className="font-mono uppercase" aria-invalid={!!codeErr} />
                  <Button type="submit">Go</Button>
                </div>
                {codeErr && <Callout tone="danger" className="mt-2">{codeErr}</Callout>}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

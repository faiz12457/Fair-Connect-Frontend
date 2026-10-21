import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FlaskConical, X, RotateCcw, Zap, ExternalLink } from 'lucide-react'
import { useStore, useSession, actions, toast, homeFor } from '@/store/store'
import { Button, SegmentedControl, Avatar, Select } from '@/components/ui'
import { cx } from '@/lib/format'

const PERSONAS = [
  { id: 'u_st1', label: 'Ayesha Rehman', role: 'Student · BSCS, verified' },
  { id: 'u_st5', label: 'Fatima Noor', role: 'Student · pending verification' },
  { id: 'u_usman', label: 'Usman Khalid', role: 'Recruiter · Arbisoft' },
  { id: 'u_bilal', label: 'Bilal Siddiqui', role: 'Recruiter · VentureDive (pending)' },
  { id: 'u_admin', label: 'Sana Tariq', role: 'Admin · Career Services' },
]

export default function DemoPanel() {
  const [open, setOpen] = useState(false)
  const s = useStore()
  const { user } = useSession()
  const navigate = useNavigate()
  const fair = s.fairs.find((f) => f.id === 'fair25')
  const [scanCo, setScanCo] = useState('arb')
  const activeStalls = s.stalls.filter((st) => st.fairId === 'fair25' && st.qr.status === 'active')

  const switchTo = (id) => {
    const u = actions.loginAs(id)
    navigate(homeFor(u))
    toast({ title: `Signed in as ${u.name}`, tone: 'success', duration: 2500 })
  }

  return (
    <div className="fixed bottom-20 left-4 z-[70] lg:bottom-4">
      {open ? (
        <div className="w-[320px] overflow-hidden rounded-2xl border border-navy-800 bg-navy-950 text-white shadow-pop">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="size-4 text-brand-400" /> Demo controls</div>
            <button aria-label="Close demo panel" onClick={() => setOpen(false)} className="grid size-7 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-wider text-white/50 uppercase">Switch role (this tab)</div>
              <div className="space-y-1">
                {PERSONAS.map((p) => (
                  <button key={p.id} onClick={() => switchTo(p.id)} className={cx('flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-white/10', user?.id === p.id && 'bg-white/10 ring-1 ring-brand-400/50')}>
                    <Avatar name={p.label} size="xs" />
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold">{p.label}</span>
                      <span className="block text-[11px] text-white/50">{p.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-wider text-white/50 uppercase">Fair phase · {fair.name}</div>
              <SegmentedControl size="sm" className="w-full bg-white/10 ring-white/10 [&>button]:flex-1" value={fair.status} onChange={(v) => (actions.setFairStatus(fair.id, v), toast({ title: `Fair set to ${v}`, tone: 'success', duration: 2500 }))} options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'live', label: 'Live' }, { value: 'ended', label: 'Ended' }]} />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-wider text-white/50 uppercase">Simulate a visitor scan</div>
              <div className="flex gap-2">
                <Select value={scanCo} onChange={(e) => setScanCo(e.target.value)} className="h-8 border-white/10 bg-white/10 text-[13px] text-white">
                  {activeStalls.map((st) => (
                    <option key={st.id} value={st.companyId} className="text-ink-900">{s.companies.find((c) => c.id === st.companyId)?.name} · {st.number}</option>
                  ))}
                </Select>
                <Button size="sm" icon={Zap} onClick={() => {
                  const r = actions.simulateScan(scanCo)
                  toast(r.ok ? { title: `${r.student.name} scanned the stall`, description: `${r.interaction.score}% match`, tone: 'success' } : { title: r.message, tone: 'warning' })
                }}>Scan</Button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <a href={window.location.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-300 hover:text-white"><ExternalLink className="size-3.5" /> Open a second tab</a>
              <button onClick={() => (actions.resetDemo(), navigate('/'), toast({ title: 'Demo data reset', tone: 'success' }))} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"><RotateCcw className="size-3.5" /> Reset demo data</button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-navy-950 py-2 pr-4 pl-3 text-[13px] font-semibold text-white shadow-pop ring-1 ring-white/10 hover:bg-navy-900">
          <FlaskConical className="size-4 text-brand-400" /> Demo
          {fair.status === 'live' && <span className="size-2 rounded-full bg-success-600" />}
        </button>
      )}
    </div>
  )
}

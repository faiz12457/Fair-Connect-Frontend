import { Logo } from '@/components/ui'
import { Check } from 'lucide-react'

export default function AuthLayout({ children, aside }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_520px]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <p className="text-xs text-ink-400">FYP prototype · Demo accounts use the password <span className="font-mono">demo1234</span>.</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-navy-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-24 -right-24 size-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 size-72 rounded-full bg-ai-600/20 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-semibold tracking-[0.12em] text-brand-300 uppercase">The smarter university career fair</div>
          <h2 className="mt-4 text-3xl leading-tight font-bold text-white">{aside?.title || 'A handshake can start with one scan.'}</h2>
          <ul className="mt-8 space-y-4">
            {(aside?.points || ['Scan a company\u2019s stall QR to share a verified profile', 'Recruiters see a live, AI-assisted shortlist', 'You stay in control of what gets shared']).map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-white/80">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600"><Check className="size-3" strokeWidth={3} /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-navy-800 text-sm font-bold">QR</span>
            <div>
              <div className="text-sm font-semibold">Arbisoft · Stall 14</div>
              <div className="text-xs text-white/60">Scan to share your profile</div>
            </div>
            <span className="ml-auto rounded-full bg-success-600/20 px-2.5 py-1 text-xs font-semibold text-success-50">92% match</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

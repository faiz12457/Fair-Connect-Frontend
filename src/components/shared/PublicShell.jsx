import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { Menu, X } from 'lucide-react'
import { Logo, Button } from '@/components/ui'
import { useSession, homeFor } from '@/store/store'

const LINKS = [
  ['How it works', '#how'],
  ['For students', '#students'],
  ['For recruiters', '#recruiters'],
  ['About', '#about'],
]

export function PublicNav() {
  const { user } = useSession()
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="bg-navy-950 px-4 py-2 text-center text-[13px] font-medium text-white/85">Bringing students and employers closer — one career fair at a time.</div>
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map(([l, h]) => (
              <a key={l} href={h} className="text-sm font-medium text-ink-600 hover:text-ink-900">{l}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Button to={homeFor(user)}>Open dashboard</Button>
            ) : (
              <>
                <Link to="/login" className="px-3 text-sm font-semibold text-ink-900 hover:text-brand-600">Log in</Link>
                <Button to="/register">Get started</Button>
              </>
            )}
          </div>
          <button className="grid size-10 place-items-center rounded-lg md:hidden" aria-label="Menu" onClick={() => setOpen((o) => !o)}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
        </div>
        {open && (
          <div className="border-t border-line bg-white px-5 py-4 md:hidden">
            {LINKS.map(([l, h]) => (
              <a key={l} href={h} onClick={() => setOpen(false)} className="block py-2 text-[15px] font-medium text-ink-700">{l}</a>
            ))}
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" to="/login" className="flex-1">Log in</Button>
              <Button to="/register" className="flex-1">Get started</Button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export function PublicFooter() {
  return (
    <footer id="about" className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 md:grid-cols-2">
        <div>
          <Logo dark />
          <p className="mt-2 text-sm text-white/60">Making career connections easier.</p>
          <p className="mt-8 text-xs text-white/40">© {new Date().getFullYear()} FairConnect. Final Year Project, BSCS — University of Lahore.</p>
        </div>
        <div className="md:text-right">
          <div className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-medium md:justify-end">
            <NavLink to="/register/student" className="hover:text-brand-300">For students</NavLink>
            <NavLink to="/register/recruiter" className="hover:text-brand-300">For recruiters</NavLink>
            <a href="#how" className="hover:text-brand-300">How it works</a>
          </div>
          <p className="mt-6 text-xs text-white/40">FYP prototype · All companies, candidates and scores shown are illustrative.</p>
        </div>
      </div>
    </footer>
  )
}

export default function PublicShell() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main id="main"><Outlet /></main>
      <PublicFooter />
    </div>
  )
}

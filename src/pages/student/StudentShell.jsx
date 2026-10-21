import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { House, Building, ScanLine, Activity, User, Sparkles, CalendarClock, Bell, ShieldCheck, Settings, CalendarDays, LogOut } from 'lucide-react'
import { Logo, Avatar, LiveIndicator } from '@/components/ui'
import NotificationBell from '@/components/shared/NotificationBell'
import RequireRole from '@/components/shared/Guards'
import { useSession, useStore, currentFair, actions } from '@/store/store'
import { cx } from '@/lib/format'

const TABS = [
  { to: '/student', label: 'Home', icon: House, end: true },
  { to: '/student/companies', label: 'Companies', icon: Building },
  { to: '/student/scan', label: 'Scan', icon: ScanLine, scan: true },
  { to: '/student/activity', label: 'Activity', icon: Activity },
  { to: '/student/profile', label: 'Profile', icon: User },
]
const MORE = [
  { to: '/student/suggestions', label: 'Companies to visit', icon: Sparkles },
  { to: '/student/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/settings/privacy', label: 'Privacy', icon: ShieldCheck },
  { to: '/student/settings', label: 'Account', icon: Settings, end: true },
]

function Inner() {
  const { user, student } = useSession()
  const s = useStore()
  const fair = currentFair(s)
  const loc = useLocation()
  const navigate = useNavigate()
  if (!student.onboarded && !loc.pathname.startsWith('/student/onboarding')) return <Navigate to="/student/onboarding" replace />
  if (loc.pathname.startsWith('/student/onboarding')) return <Outlet />
  const scanning = loc.pathname === '/student/scan'

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5"><Logo to="/student" size="sm" /></div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {[...TABS, { divider: true }, ...MORE].map((t, i) =>
            t.divider ? <div key={i} className="my-3 border-t border-line" /> : (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cx('flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold', t.scan ? 'my-1 bg-brand-600 text-white hover:bg-brand-700' : isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900')}>
                <t.icon className="size-[18px]" strokeWidth={1.75} /> {t.scan ? 'Scan a stall' : t.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-[10px] p-2">
            <Avatar name={user.name} tint={student.tint} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink-900">{user.name}</div>
              <div className="truncate text-xs text-ink-400">{student.department} · {student.rollNo}</div>
            </div>
            <button aria-label="Sign out" title="Sign out" onClick={() => (actions.logout(), navigate('/login'))} className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-surface-muted hover:text-ink-900"><LogOut className="size-4" /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className={cx('sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-4 backdrop-blur lg:h-16 lg:px-8', scanning ? 'border-white/10 bg-navy-950/95 lg:border-line lg:bg-white/90' : 'border-line bg-white/90')}>
          <div className="lg:hidden">{scanning ? <span className="text-[15px] font-semibold text-white">Scan a stall</span> : <Logo to="/student" size="sm" />}</div>
          <NavLink to={`/student/fairs/${fair.id}`} className="ml-auto flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-1 pl-3 text-xs font-semibold text-ink-700 lg:ml-0">
            <CalendarDays className="size-3.5 text-ink-400" />
            <span className="hidden sm:inline">{fair.name}</span>
            <LiveIndicator status={fair.status} />
          </NavLink>
          <div className="lg:ml-auto"><NotificationBell to={`student:${student.id}`} allHref="/student/notifications" /></div>
        </header>
        <main id="main" className={cx('mx-auto max-w-[960px] pb-28 lg:pb-12', scanning ? 'px-0 lg:px-8 lg:pt-8' : 'px-4 pt-5 lg:px-8 lg:pt-8')}>
          <Outlet />
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Primary">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) =>
            t.scan ? (
              <NavLink key={t.to} to={t.to} className="flex flex-col items-center" aria-label="Scan a company stall QR">
                <span className="-mt-5 grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-[0_8px_20px_-6px_rgb(37_99_235/0.6)] ring-4 ring-white"><ScanLine className="size-6" /></span>
                <span className="mt-0.5 text-[11px] font-semibold text-brand-700">Scan</span>
              </NavLink>
            ) : (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => cx('flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold', isActive ? 'text-brand-700' : 'text-ink-400')}>
                <t.icon className="size-5" strokeWidth={1.75} /> {t.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>
    </div>
  )
}

export default function StudentShell() {
  return (
    <RequireRole role="student">
      <Inner />
    </RequireRole>
  )
}

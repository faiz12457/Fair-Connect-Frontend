import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { Logo, Avatar, LiveIndicator } from '@/components/ui'
import { actions } from '@/store/store'
import { cx } from '@/lib/format'
import NotificationBell from './NotificationBell'

function NavItems({ nav, collapsed, onNavigate }) {
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
      {nav.map((item) =>
        item.section ? (
          <div key={item.section} className={cx('px-3 pt-4 pb-1.5 text-[11px] font-semibold tracking-wider text-ink-400 uppercase', collapsed && 'lg:hidden')}>{item.section}</div>
        ) : (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} title={item.label} className={({ isActive }) => cx('group flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900')}>
            <item.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white tabular">{item.badge}</span> : null}
            {item.live && <span className="size-2 rounded-full bg-success-600" />}
          </NavLink>
        ),
      )}
    </nav>
  )
}

export default function DashboardShell({ nav, user, subtitle, notifTo, notifHref, fair, topLeft, children, homeTo }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()
  useEffect(() => setMobileOpen(false), [loc.pathname])

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5"><Logo to={homeTo} size="sm" /></div>
        <NavItems nav={nav} />
        <div className="border-t border-line p-3 text-[11px] leading-relaxed text-ink-400">University of Lahore · Demo workspace<br />Illustrative data — not real hiring data.</div>
      </aside>
      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] flex-col bg-white shadow-pop">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <Logo to={homeTo} size="sm" />
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg hover:bg-surface-muted"><X className="size-5" /></button>
            </div>
            <NavItems nav={nav} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-[10px] hover:bg-surface-muted lg:hidden"><Menu className="size-5" /></button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {fair && (
              <div className="flex min-w-0 items-center gap-2.5 rounded-[10px] border border-line px-3 py-1.5">
                <span className="truncate text-[13px] font-semibold text-ink-900">{fair.name}</span>
                <LiveIndicator status={fair.status} />
              </div>
            )}
            {topLeft}
          </div>
          <NotificationBell to={notifTo} allHref={notifHref} />
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2.5 rounded-[10px] py-1 pr-2 pl-1 hover:bg-surface-muted" aria-haspopup="menu" aria-expanded={menu}>
              <Avatar name={user.name} size="sm" tint="brand" />
              <span className="hidden text-left md:block">
                <span className="block text-[13px] leading-tight font-semibold text-ink-900">{user.name}</span>
                <span className="block text-xs leading-tight text-ink-400">{subtitle}</span>
              </span>
              <ChevronDown className="hidden size-4 text-ink-400 md:block" />
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-pop" onMouseLeave={() => setMenu(false)}>
                <div className="px-3 py-2 text-xs text-ink-400">{user.email}</div>
                <button role="menuitem" onClick={() => (actions.logout(), navigate('/login'))} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-surface-muted">
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children || <Outlet />}</main>
      </div>
    </div>
  )
}

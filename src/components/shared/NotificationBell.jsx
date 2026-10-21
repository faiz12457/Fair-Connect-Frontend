import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bell } from 'lucide-react'
import { useStore, actions } from '@/store/store'
import { timeAgo, cx } from '@/lib/format'

export function useNotifications(to) {
  const s = useStore()
  const list = s.notifications.filter((n) => n.to === to)
  return { list, unread: list.filter((n) => !n.read).length }
}

export default function NotificationBell({ to, allHref }) {
  const { list, unread } = useNotifications(to)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const nav = useNavigate()
  useEffect(() => {
    if (!open) return
    const h = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} onClick={() => setOpen((o) => !o)} className="relative grid size-10 place-items-center rounded-[10px] text-ink-600 hover:bg-surface-muted hover:text-ink-900">
        <Bell className="size-[18px]" strokeWidth={1.75} />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-danger-600 px-1 text-[10px] font-bold text-white tabular ring-2 ring-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="text-sm font-semibold text-ink-900">Notifications</div>
            {unread > 0 && <button className="text-[13px] font-semibold text-brand-600" onClick={() => actions.markRead(to)}>Mark all read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {list.length === 0 && <div className="px-4 py-10 text-center text-sm text-ink-400">You're all caught up.</div>}
            {list.slice(0, 8).map((n) => (
              <button key={n.id} onClick={() => (actions.markRead(to, n.id), setOpen(false), n.link && nav(n.link))} className={cx('flex w-full gap-3 border-b border-line/60 px-4 py-3 text-left last:border-0 hover:bg-surface-muted', !n.read && 'bg-brand-50/50')}>
                <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-600')} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink-900">{n.title}</span>
                  {n.body && <span className="block truncate text-[13px] text-ink-600">{n.body}</span>}
                  <span className="mt-0.5 block text-xs text-ink-400">{timeAgo(n.at)}</span>
                </span>
              </button>
            ))}
          </div>
          <Link to={allHref} onClick={() => setOpen(false)} className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-semibold text-brand-600 hover:bg-surface-muted">View all</Link>
        </div>
      )}
    </div>
  )
}

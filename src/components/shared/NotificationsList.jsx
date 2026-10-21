import { useNavigate } from 'react-router'
import { BellOff } from 'lucide-react'
import { actions } from '@/store/store'
import { Card, EmptyState, Button, IconTile } from '@/components/ui'
import { timeAgo, cx } from '@/lib/format'
import { useNotifications } from './NotificationBell'

const KIND = { verify: ['ID', 'success'], fair: ['FC', 'brand'], status: ['ST', 'success'], interview: ['IV', 'ai'], visitor: ['QR', 'brand'], stall: ['QR', 'navy'], company: ['CO', 'orange'], info: ['i', 'gray'] }

export default function NotificationsList({ to }) {
  const { list, unread } = useNotifications(to)
  const nav = useNavigate()
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="text-sm font-semibold text-ink-900">{unread} unread</div>
        <Button size="sm" variant="ghost" disabled={!unread} onClick={() => actions.markRead(to)}>Mark all read</Button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications yet" body="Updates about the fair, your stall and status changes will show up here." />
      ) : (
        <ul>
          {list.map((n) => {
            const [m, tone] = KIND[n.kind] || KIND.info
            return (
              <li key={n.id}>
                <button onClick={() => (actions.markRead(to, n.id), n.link && nav(n.link))} className={cx('flex w-full items-start gap-3.5 border-b border-line/60 px-5 py-4 text-left last:border-0 hover:bg-surface-muted', !n.read && 'bg-brand-50/40')}>
                  <IconTile tone={tone} size="sm">{m}</IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-[13px] text-ink-600">{n.body}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-ink-400">
                    {timeAgo(n.at)}
                    {!n.read && <span className="size-2 rounded-full bg-brand-600" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { PageHeader, Card, CardHeader, Field, Input, Button, ConfirmDialog, Badge } from '@/components/ui'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'

export default function Account() {
  const { student, user } = useStudent()
  const nav = useNavigate()
  const [pw, setPw] = useState({ current: '', next: '' })
  const [err, setErr] = useState('')
  const [del, setDel] = useState(false)
  const change = (e) => {
    e.preventDefault()
    if (pw.current !== user.password) return setErr('Current password is incorrect.')
    if (pw.next.length < 8) return setErr('New password must be at least 8 characters.')
    setErr('')
    setPw({ current: '', next: '' })
    toast({ title: 'Password updated (demo)', tone: 'success' })
  }
  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Account" />
      <Card>
        <CardHeader title="Sign-in details" />
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          <div><dt className="text-[13px] text-ink-400">University email</dt><dd className="mt-0.5 font-medium">{student.email}</dd></div>
          <div><dt className="text-[13px] text-ink-400">Roll number</dt><dd className="mt-0.5 font-medium">{student.rollNo} <Badge tone="gray" className="ml-1">Private</Badge></dd></div>
        </dl>
      </Card>
      <Card as="form" onSubmit={change}>
        <CardHeader title="Change password" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Current password" error={err}><Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
          <Field label="New password" hint="At least 8 characters."><Input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={!pw.current || !pw.next}>Update password</Button></div>
        </div>
      </Card>
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><div className="text-sm font-semibold">Sign out</div><div className="text-[13px] text-ink-400">You’ll need to sign in again to share at stalls.</div></div>
        <Button variant="secondary" icon={LogOut} onClick={() => (actions.logout(), nav('/login'))}>Sign out</Button>
      </Card>
      <Card className="flex flex-wrap items-center justify-between gap-3 border-danger-600/20 p-5">
        <div><div className="text-sm font-semibold text-danger-700">Request account deletion</div><div className="text-[13px] text-ink-400">Career Services processes deletion requests within 7 days.</div></div>
        <Button variant="danger-outline" onClick={() => setDel(true)}>Request deletion</Button>
      </Card>
      <ConfirmDialog open={del} onClose={() => setDel(false)} onConfirm={() => (setDel(false), toast({ title: 'Deletion request sent to Career Services', tone: 'success' }))} title="Request account deletion?" body="Your profile and fair history will be removed after Career Services confirms." confirmLabel="Send request" tone="danger" />
    </div>
  )
}

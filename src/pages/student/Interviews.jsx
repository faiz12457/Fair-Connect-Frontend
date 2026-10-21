import { useState } from 'react'
import { CalendarClock, MapPin, Video, Check } from 'lucide-react'
import { PageHeader, Card, CompanyLogo, Badge, Button, EmptyState, Modal, Textarea, Field, ConfirmDialog } from '@/components/ui'
import { actions, toast } from '@/store/store'
import { useStudent } from './common'
import { cx } from '@/lib/format'

function InviteCard({ iv, s }) {
  const c = s.companies.find((x) => x.id === iv.companyId)
  const ix = s.interactions.find((x) => x.id === iv.interactionId)
  const job = s.jobs.find((j) => j.id === ix?.jobId)
  const offered = s.slots.filter((sl) => iv.offeredSlotIds.includes(sl.id))
  const booked = s.slots.find((sl) => sl.id === iv.slotId)
  const [pick, setPick] = useState(null)
  const [propose, setPropose] = useState(false)
  const [text, setText] = useState('')
  const [decline, setDecline] = useState(false)
  const confirm = () => {
    const r = actions.respondToInvite(iv.id, pick)
    if (!r.ok) return toast({ title: r.message, tone: 'danger' })
    toast({ title: `Interview confirmed with ${c.name}`, tone: 'success' })
  }
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <CompanyLogo company={c} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink-900">{c.name}</div>
          <div className="text-[13px] text-ink-400">{job?.title || 'Interview'}</div>
        </div>
        <Badge tone={iv.status === 'scheduled' ? 'success' : iv.status === 'completed' ? 'navy' : iv.status === 'declined' ? 'gray' : 'ai'}>{{ invited: 'Pick a slot', scheduled: 'Confirmed', completed: 'Completed', declined: 'Declined' }[iv.status]}</Badge>
      </div>
      {iv.message && <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm text-ink-600">“{iv.message}”</p>}
      {booked && iv.status !== 'declined' && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink-900"><CalendarClock className="size-4 text-brand-600" />{booked.time}</span>
          <span className="inline-flex items-center gap-1.5 text-ink-600">{iv.mode === 'online' ? <Video className="size-4" /> : <MapPin className="size-4" />}{iv.mode === 'online' ? 'Online' : booked.location}</span>
          {iv.status === 'scheduled' && <Button size="sm" variant="secondary" to={`/student/interviews/${iv.id}/prep`} className="ml-auto">Prepare</Button>}
        </div>
      )}
      {iv.status === 'invited' && (
        <>
          <div className="mt-4 text-[13px] font-semibold text-ink-900">Choose a slot</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {offered.map((sl) => {
              const taken = sl.interviewId && sl.interviewId !== iv.id
              return (
                <button key={sl.id} disabled={taken} onClick={() => setPick(sl.id)} aria-pressed={pick === sl.id} className={cx('flex min-h-12 items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40', pick === sl.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line hover:border-ink-300')}>
                  <span>{sl.time}{taken && <span className="block text-[11px] font-medium">Taken</span>}</span>
                  {pick === sl.id && <Check className="size-4" />}
                </button>
              )
            })}
          </div>
          {iv.proposedTime && <p className="mt-3 text-[13px] text-ink-400">You proposed: “{iv.proposedTime}”. Waiting for the recruiter.</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={!pick} onClick={confirm}>Confirm slot</Button>
            <Button variant="secondary" onClick={() => setPropose(true)}>Propose another time</Button>
            <Button variant="ghost" className="text-danger-600" onClick={() => setDecline(true)}>Decline</Button>
          </div>
        </>
      )}
      <Modal open={propose} onClose={() => setPropose(false)} title="Propose another time" description={`${c.name} will see your message.`} footer={<><Button variant="secondary" onClick={() => setPropose(false)}>Cancel</Button><Button disabled={!text.trim()} onClick={() => (actions.proposeTime(iv.id, text.trim()), setPropose(false), toast({ title: 'Proposal sent', tone: 'success' }))}>Send</Button></>}>
        <Field label="When works for you?"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Any time after 2 pm on fair day" /></Field>
      </Modal>
      <ConfirmDialog open={decline} onClose={() => setDecline(false)} onConfirm={() => (actions.declineInvite(iv.id), setDecline(false))} title="Decline this interview?" body={`${c.name} will be notified. This can’t be undone.`} confirmLabel="Decline interview" tone="danger" />
    </Card>
  )
}

export default function Interviews() {
  const { s, student } = useStudent()
  const list = s.interviews.filter((i) => i.studentId === student.id)
  const order = { invited: 0, scheduled: 1, completed: 2, declined: 3 }
  return (
    <div>
      <PageHeader title="Interviews" description="Invitations from recruiters. Confirm a slot to lock it in." />
      {list.length === 0 ? (
        <Card><EmptyState icon={CalendarClock} title="No interview invites yet" body="When a recruiter invites you, you’ll get a notification and can pick a slot here." /></Card>
      ) : (
        <div className="space-y-3">{[...list].sort((a, b) => order[a.status] - order[b.status]).map((iv) => <InviteCard key={iv.id} iv={iv} s={s} />)}</div>
      )}
    </div>
  )
}

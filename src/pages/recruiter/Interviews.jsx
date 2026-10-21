import { useState } from "react"
import { Link } from "react-router"
import {
  Plus,
  Trash2,
  CalendarClock,
  MapPin,
  Video,
  MessageSquare,
  Mic,
  CalendarPlus,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Input,
  Field,
  IconButton,
  Avatar,
  Badge,
  EmptyState,
  SegmentedControl,
  Callout,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { timeAgo } from "@/lib/format"
import { useRecruiter } from "./common"
import ScheduleModal from "./ScheduleModal"

const TONE = {
  invited: "ai",
  scheduled: "success",
  completed: "navy",
  declined: "gray",
}
const LABEL = {
  invited: "Awaiting pick",
  scheduled: "Booked",
  completed: "Completed",
  declined: "Declined",
}

export default function Interviews() {
  const { s, company, fair, stall } = useRecruiter()
  const [time, setTime] = useState("13:00")
  const [location, setLocation] = useState(
    stall ? `Stall ${stall.number} · Interview desk` : "Interview desk",
  )
  const [filter, setFilter] = useState("upcoming")
  const [modal, setModal] = useState(null)
  const slots = s.slots.filter(
    (sl) => sl.companyId === company.id && sl.fairId === fair.id,
  )
  const ivs = s.interviews
    .filter((i) => i.companyId === company.id && i.fairId === fair.id)
    .map((iv) => ({
      iv,
      ix: s.interactions.find((x) => x.id === iv.interactionId),
      student: s.students.find((st) => st.id === iv.studentId),
      slot: s.slots.find((sl) => sl.id === iv.slotId),
    }))
    .sort((a, b) => (a.slot?.time || "99").localeCompare(b.slot?.time || "99"))
  const groups = {
    upcoming: ivs.filter(
      (x) => x.iv.status === "scheduled" || x.iv.status === "invited",
    ),
    completed: ivs.filter((x) => x.iv.status === "completed"),
    declined: ivs.filter((x) => x.iv.status === "declined"),
  }
  const list = groups[filter]

  const add = () => {
    if (!/^\d{2}:\d{2}$/.test(time))
      return toast({ title: "Pick a valid time", tone: "warning" })
    if (slots.some((sl) => sl.time === time))
      return toast({
        title: `You already have a ${time} slot`,
        tone: "warning",
      })
    actions.addSlot(fair.id, time, location.trim() || "Interview desk")
    toast({ title: `Slot ${time} added`, tone: "success", duration: 2000 })
  }

  return (
    <div>
      <PageHeader
        title="Interviews"
        description={`Your slots and agenda for ${fair.name}.`}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <h3 className="text-[15px] font-semibold text-ink-900">Agenda</h3>
            <SegmentedControl
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                {
                  value: "upcoming",
                  label: "Upcoming",
                  count: groups.upcoming.length,
                },
                {
                  value: "completed",
                  label: "Done",
                  count: groups.completed.length,
                },
                {
                  value: "declined",
                  label: "Declined",
                  count: groups.declined.length,
                },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={
                filter === "upcoming"
                  ? "No interviews yet"
                  : `No ${filter} interviews`
              }
              body="Invite candidates from the live dashboard or pipeline."
              action={
                filter === "upcoming" && (
                  <Button variant="secondary" to="/recruiter/live">
                    Open live dashboard
                  </Button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-line p-2">
              {list.map(({ iv, ix, student, slot }) => (
                <li
                  key={iv.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
                >
                  <div className="w-16 shrink-0">
                    <div className="text-lg font-bold text-ink-900 tabular">
                      {slot?.time || "—"}
                    </div>
                    <div className="text-[11px] text-ink-400">
                      {iv.status === "invited"
                        ? `${iv.offeredSlotIds.length} offered`
                        : iv.mode === "online"
                          ? "Online"
                          : "In person"}
                    </div>
                  </div>
                  <Link
                    to={`/recruiter/candidates/${ix.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <Avatar name={student.name} tint={student.tint} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink-900 hover:text-brand-700">
                        {student.name}
                      </div>
                      <div className="flex items-center gap-1 truncate text-xs text-ink-400">
                        {iv.mode === "online" ? (
                          <Video className="size-3" />
                        ) : (
                          <MapPin className="size-3" />
                        )}
                        {slot?.location || "Slot not picked yet"} ·{" "}
                        {timeAgo(iv.createdAt)}
                      </div>
                      {iv.proposedTime && (
                        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-ai-700">
                          <MessageSquare className="size-3" /> Proposed: “
                          {iv.proposedTime}”
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge tone={TONE[iv.status]}>{LABEL[iv.status]}</Badge>
                    {(iv.status === "invited" || iv.status === "scheduled") && (
                      <>
                        <IconButton
                          size="sm"
                          icon={CalendarPlus}
                          label={
                            iv.status === "scheduled"
                              ? "Reschedule"
                              : "Book a slot"
                          }
                          onClick={() =>
                            setModal({ ix, student, mode: "schedule" })
                          }
                        />
                        <IconButton
                          size="sm"
                          icon={Mic}
                          label="Mark done"
                          onClick={() => setModal({ ix, student, mode: "now" })}
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:self-start">
          <CardHeader
            title="Interview slots"
            description={`${slots.filter((sl) => sl.interviewId).length} of ${slots.length} booked`}
          />
          <div className="grid grid-cols-[1fr_auto] gap-2 px-5 pt-4">
            <Field label="Time">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>
            <div className="flex items-end">
              <Button icon={Plus} onClick={add}>
                Add
              </Button>
            </div>
            <Field label="Location" className="col-span-2">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>
          </div>
          {slots.length === 0 ? (
            <Callout tone="warning" className="m-5">
              No slots yet. Add a few so you can invite candidates.
            </Callout>
          ) : (
            <ul className="mt-3 max-h-[420px] overflow-y-auto border-t border-line p-2">
              {slots.map((sl) => {
                const booked =
                  sl.interviewId &&
                  s.interviews.find((i) => i.id === sl.interviewId)
                const who =
                  booked && s.students.find((st) => st.id === booked.studentId)
                return (
                  <li
                    key={sl.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-muted"
                  >
                    <span className="w-12 text-sm font-semibold text-ink-900 tabular">
                      {sl.time}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink-400">
                      {who ? (
                        <span className="font-medium text-ink-700">
                          {who.name}
                        </span>
                      ) : (
                        sl.location
                      )}
                    </span>
                    {booked ? (
                      <Badge tone="success">Booked</Badge>
                    ) : (
                      <IconButton
                        size="sm"
                        icon={Trash2}
                        label={`Remove ${sl.time}`}
                        onClick={() => actions.removeSlot(sl.id)}
                        className="hover:text-danger-600"
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
      {modal && (
        <ScheduleModal
          open
          onClose={() => setModal(null)}
          ix={modal.ix}
          student={modal.student}
          mode={modal.mode}
        />
      )}
    </div>
  )
}

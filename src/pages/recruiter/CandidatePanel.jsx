import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  X,
  Star,
  SkipForward,
  Send,
  CalendarPlus,
  Mic,
  Maximize2,
  RotateCcw,
  CalendarClock,
  MapPin,
  Video,
  StickyNote,
} from "lucide-react"
import {
  Avatar,
  StatusPill,
  ScoreRing,
  ScoreBreakdown,
  Chip,
  DecisionSupportNote,
  Button,
  IconButton,
  Textarea,
  Timeline,
  Card,
  Badge,
  Callout,
} from "@/components/ui"
import StudentProfileView from "@/components/domain/StudentProfileView"
import { useStore, actions, toast } from "@/store/store"
import { aiSummary } from "@/lib/match"
import { fmtDateTime, statusLabel, timeAgo, cx } from "@/lib/format"
import ScheduleModal from "./ScheduleModal"

/** R09 — candidate detail used inside the live-dashboard drawer and as a full page. */
export default function CandidatePanel({ interactionId, onClose, page }) {
  const s = useStore()
  const navigate = useNavigate()
  const ix = s.interactions.find((i) => i.id === interactionId)
  const [modal, setModal] = useState(null)
  const [note, setNote] = useState("")

  // Opening a new candidate marks it reviewed (never notifies the student).
  useEffect(() => {
    if (ix?.status === "pending")
      actions.setInteractionStatus(ix.id, "reviewed", { silent: true })
  }, [ix?.id, ix?.status])

  if (!ix)
    return (
      <div className="p-8 text-center text-sm text-ink-400">
        This candidate record is not available.
      </div>
    )
  const student = s.students.find((st) => st.id === ix.studentId)
  const job = s.jobs.find((j) => j.id === ix.jobId)
  const fair = s.fairs.find((f) => f.id === ix.fairId)
  const iv = s.interviews.find(
    (i) => i.interactionId === ix.id && i.status !== "declined",
  )
  const declined = s.interviews.find(
    (i) => i.interactionId === ix.id && i.status === "declined",
  )
  const slot = iv?.slotId && s.slots.find((sl) => sl.id === iv.slotId)
  const first = student.name.split(" ")[0]
  const inInterview = ix.status.startsWith("interview")
  const done = ix.status === "interview_completed"

  const setStatus = (status, label) => {
    const prev = actions.setInteractionStatus(ix.id, status)
    if (prev == null) return
    toast({
      title: `${first} ${label}`,
      tone: status === "rejected" ? "default" : "success",
      action: {
        label: "Undo",
        onClick: () =>
          actions.setInteractionStatus(ix.id, prev, { silent: true }),
      },
    })
  }
  const saveNote = () => {
    if (!note.trim()) return
    actions.addNote(ix.id, note.trim())
    setNote("")
  }

  const header = (
    <div
      className={cx(
        "flex items-start gap-3",
        !page && "border-b border-line px-5 py-4",
      )}
    >
      <Avatar
        name={student.name}
        tint={student.tint}
        size={page ? "lg" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={cx(
              "font-semibold",
              page ? "text-2xl font-bold" : "text-lg",
            )}
          >
            {student.name}
          </h2>
          <StatusPill status={ix.status} />
        </div>
        <div className="text-[13px] text-ink-400">
          {student.department} · Visited {timeAgo(ix.createdAt)} · {fair.name}
        </div>
      </div>
      {!page && (
        <div className="-mr-2 flex items-center">
          <IconButton
            icon={Maximize2}
            label="Open full page"
            size="sm"
            onClick={() => navigate(`/recruiter/candidates/${ix.id}`)}
          />
          <IconButton icon={X} label="Close" size="sm" onClick={onClose} />
        </div>
      )}
    </div>
  )

  const actionBar = (
    <div
      className={cx(
        "flex flex-wrap items-center gap-2",
        !page && "border-t border-line bg-white px-5 py-3",
      )}
    >
      {ix.status === "rejected" ? (
        <Button
          variant="secondary"
          icon={RotateCcw}
          onClick={() => setStatus("reviewed", "restored")}
        >
          Restore
        </Button>
      ) : (
        <>
          <Button
            variant="success"
            icon={Star}
            disabled={ix.status === "shortlisted" || inInterview}
            onClick={() => setStatus("shortlisted", "shortlisted")}
          >
            Shortlist
          </Button>
          <Button
            variant="secondary"
            icon={Send}
            disabled={!!iv}
            onClick={() => setModal("invite")}
          >
            Invite
          </Button>
          <Button
            variant="secondary"
            icon={CalendarPlus}
            disabled={done}
            onClick={() => setModal("schedule")}
          >
            {iv?.status === "scheduled" ? "Reschedule" : "Schedule"}
          </Button>
          <Button
            variant="secondary"
            icon={Mic}
            disabled={done}
            onClick={() => setModal("now")}
          >
            Interview now
          </Button>
          <Button
            variant="ghost"
            icon={SkipForward}
            className="ml-auto text-ink-400"
            disabled={done}
            onClick={() => setStatus("rejected", "skipped")}
          >
            Skip
          </Button>
        </>
      )}
    </div>
  )

  const body = (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ScoreRing score={ix.score} size={92} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
              Best-fit role
            </div>
            <div className="mb-3 font-semibold text-ink-900">
              {job?.title || "No active roles at scan time"}
            </div>
            <ScoreBreakdown
              breakdown={ix.breakdown}
              weights={ix.weights || fair.weights}
              cgpaHidden={!student.privacy.showCgpa}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {ix.matchedSkills.map((x) => (
            <Chip key={x} tone="success">
              {x}
            </Chip>
          ))}
          {ix.missingSkills.map((x) => (
            <Chip key={x} tone="missing">
              {x}
            </Chip>
          ))}
        </div>
      </Card>

      {job && (
        <Card className="border-ai-100 bg-ai-50/40 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="ai">AI summary</Badge>
            <span className="text-xs text-ink-400">
              Generated from the shared profile
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink-700">
            {aiSummary(student, job, ix)}
          </p>
          <DecisionSupportNote className="mt-3 bg-white" />
        </Card>
      )}

      {(iv || declined) && (
        <Callout
          tone={iv ? "ai" : "warning"}
          icon={CalendarClock}
          title={
            iv
              ? {
                  invited: "Invite sent — waiting for a slot pick",
                  scheduled: "Interview booked",
                  completed: "Interview completed",
                }[iv.status]
              : `${first} declined the interview`
          }
        >
          {slot && iv.status !== "completed" && (
            <span className="inline-flex items-center gap-1.5">
              {iv.mode === "online" ? (
                <Video className="size-3.5" />
              ) : (
                <MapPin className="size-3.5" />
              )}
              {slot.time} · {iv.mode === "online" ? "Online" : slot.location}
            </span>
          )}
          {iv?.proposedTime && (
            <span className="block">Proposed instead: “{iv.proposedTime}”</span>
          )}
        </Callout>
      )}

      <StudentProfileView
        student={student}
        matched={ix.matchedSkills}
        showGithubCard={page}
      />

      <Card className="p-5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold">
          <StickyNote className="size-4 text-ink-400" strokeWidth={1.75} />{" "}
          Private notes
        </h3>
        <p className="text-[13px] text-ink-400">
          Only your company’s team can see these.
        </p>
        {ix.notes.length > 0 && (
          <ul className="mt-3 space-y-2">
            {ix.notes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl bg-surface-muted px-3 py-2.5"
              >
                <p className="text-sm text-ink-700">{n.text}</p>
                <div className="mt-1 text-xs text-ink-400">
                  {n.by} · {timeAgo(n.at)}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.metaKey || e.ctrlKey) && saveNote()
          }
          placeholder="Add a note…"
          className="mt-3 min-h-20"
          aria-label="New note"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            disabled={!note.trim()}
            onClick={saveNote}
          >
            Save note
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-[15px] font-semibold">History</h3>
        <Timeline
          items={ix.history.map((h, i) => ({
            title:
              h.status === "pending"
                ? "Profile shared at stall"
                : statusLabel(h.status),
            meta: fmtDateTime(h.at),
            done: true,
            active: i === ix.history.length - 1,
          }))}
        />
      </Card>
    </div>
  )

  const modalEl = (
    <ScheduleModal
      key={modal || "none"}
      open={!!modal}
      onClose={() => setModal(null)}
      ix={ix}
      student={student}
      mode={modal || "invite"}
    />
  )

  if (page)
    return (
      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          {header}
          <div className="mt-5 border-t border-line pt-4">{actionBar}</div>
        </Card>
        {body}
        {modalEl}
      </div>
    )
  return (
    <>
      {header}
      <div className="flex-1 overflow-y-auto bg-surface-muted p-4 sm:p-5">
        {body}
      </div>
      {actionBar}
      {modalEl}
    </>
  )
}

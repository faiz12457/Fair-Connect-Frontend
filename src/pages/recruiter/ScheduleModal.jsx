import { useState } from "react"
import { Check, MapPin, Video } from "lucide-react"
import {
  Modal,
  Button,
  Field,
  Textarea,
  SegmentedControl,
  Callout,
} from "@/components/ui"
import { useStore, actions, toast } from "@/store/store"
import { cx } from "@/lib/format"

/**
 * R10 — "invite" offers up to 3 slots for the student to pick,
 * "schedule" books one slot directly, "now" records an on-the-spot interview.
 */
export default function ScheduleModal({ open, onClose, ix, student, mode }) {
  const s = useStore()
  const [picked, setPicked] = useState([])
  const [format, setFormat] = useState("in-person")
  const [message, setMessage] = useState("")
  const [notes, setNotes] = useState("")
  const iv = s.interviews.find(
    (i) => i.interactionId === ix.id && i.status !== "declined",
  )
  const slots = s.slots.filter(
    (sl) => sl.companyId === ix.companyId && sl.fairId === ix.fairId,
  )
  const multi = mode === "invite"
  const first = student.name.split(" ")[0]

  const toggle = (id) =>
    setPicked((p) =>
      multi
        ? p.includes(id)
          ? p.filter((x) => x !== id)
          : p.length < 3
            ? [...p, id]
            : p
        : [id],
    )

  const submit = () => {
    if (mode === "now") {
      actions.completeInterview(ix.id, notes.trim())
      toast({ title: `Interview with ${first} recorded`, tone: "success" })
      return onClose()
    }
    const r =
      mode === "invite"
        ? actions.inviteInterview(ix.id, picked, {
            mode: format,
            message: message.trim(),
          })
        : actions.scheduleInterview(ix.id, picked[0], { mode: format })
    if (!r?.ok)
      return toast({ title: r?.message || "Could not save", tone: "danger" })
    toast({
      title:
        mode === "invite"
          ? `Invite sent to ${first}`
          : `Interview booked with ${first}`,
      description:
        mode === "invite"
          ? "They can pick one of the offered slots."
          : "They have been notified.",
      tone: "success",
    })
    onClose()
  }

  const title = {
    invite: `Invite ${first} to interview`,
    schedule: `Schedule ${first}`,
    now: `Interview ${first} now`,
  }[mode]
  const description = {
    invite: "Offer up to three slots. The student picks one.",
    schedule: "Book a slot directly. The student is notified.",
    now: "Record a walk-in interview at your stall.",
  }[mode]
  const canSubmit = mode === "now" || picked.length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            {
              {
                invite: `Send invite${
                  picked.length ? ` (${picked.length})` : ""
                }`,
                schedule: "Book slot",
                now: "Mark interview done",
              }[mode]
            }
          </Button>
        </>
      }
    >
      {mode === "now" ? (
        <Field
          label="Interview notes"
          hint="Private to your team. Saved on the candidate record."
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Strengths, concerns, next steps…"
            className="min-h-32"
          />
        </Field>
      ) : (
        <div className="space-y-5">
          {iv?.proposedTime && (
            <Callout tone="ai" title={`${first} proposed another time`}>
              “{iv.proposedTime}”
            </Callout>
          )}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-900">
                {multi ? "Offer slots" : "Pick a slot"}
              </span>
              <span className="text-xs text-ink-400">
                {multi ? `${picked.length}/3 selected` : "Fair day"}
              </span>
            </div>
            {slots.length === 0 ? (
              <Callout tone="warning">
                No interview slots yet. Add slots on the Interviews page first.
              </Callout>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((sl) => {
                  const taken = sl.interviewId && sl.interviewId !== iv?.id
                  const on = picked.includes(sl.id)
                  return (
                    <button
                      key={sl.id}
                      type="button"
                      disabled={taken}
                      onClick={() => toggle(sl.id)}
                      aria-pressed={on}
                      className={cx(
                        "relative flex min-h-14 flex-col items-start justify-center rounded-xl border px-3 text-left transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-50",
                        on
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-line hover:border-ink-300",
                      )}
                    >
                      <span className="text-sm font-semibold tabular">
                        {sl.time}
                      </span>
                      <span className="text-[11px] text-ink-400">
                        {taken ? "Taken" : sl.interviewId ? "Current" : "Open"}
                      </span>
                      {on && (
                        <Check
                          className="absolute top-2 right-2 size-3.5"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div>
            <div className="mb-2 text-[13px] font-semibold text-ink-900">
              Format
            </div>
            <SegmentedControl
              value={format}
              onChange={setFormat}
              options={[
                { value: "in-person", label: "At the stall" },
                { value: "online", label: "Online" },
              ]}
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
              {format === "online" ? (
                <Video className="size-3.5" />
              ) : (
                <MapPin className="size-3.5" />
              )}
              {format === "online"
                ? "A meeting link is shared by email after booking."
                : slots[0]?.location || "Your stall interview desk"}
            </p>
          </div>
          {multi && (
            <Field label="Message (optional)">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${first}, we enjoyed meeting you at the stall…`}
              />
            </Field>
          )}
        </div>
      )}
    </Modal>
  )
}

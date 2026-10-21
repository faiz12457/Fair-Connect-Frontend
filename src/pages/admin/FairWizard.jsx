import { useState } from "react"
import { useNavigate } from "react-router"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import {
  PageHeader,
  Card,
  Stepper,
  Button,
  Field,
  Input,
  Textarea,
  Switch,
  Callout,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { DEFAULT_WEIGHTS } from "@/lib/match"
import { fmtDate } from "@/lib/format"
import WeightsEditor, { weightTotal } from "./WeightsEditor"

const STEPS = [
  "Details",
  "Registration",
  "Sharing policy",
  "AI weights",
  "Review",
]
const iso = (d) => (d ? new Date(`${d}T10:00:00`).toISOString() : "")

export default function FairWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [f, setF] = useState({
    name: "",
    date: "",
    startTime: "10:00",
    endTime: "16:00",
    venue: "Main Sports Complex, UOL Main Campus",
    description: "",
    stallCount: 24,
    regOpen: "",
    regClose: "",
    policy: {
      allowCgpaHiding: true,
      shareLinks: true,
      retentionDays: 90,
      requireVerification: true,
    },
    weights: { ...DEFAULT_WEIGHTS },
  })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? e.target.value : e })
  const setPolicy = (k) => (v) =>
    setF({ ...f, policy: { ...f.policy, [k]: v } })

  const validate = (i) => {
    const e = {}
    if (i === 0) {
      if (f.name.trim().length < 4) e.name = "Give the fair a name."
      if (!f.date) e.date = "Pick a date."
      else if (new Date(f.date) < new Date(new Date().toDateString()))
        e.date = "The date must be in the future."
      if (f.endTime <= f.startTime) e.endTime = "End time must be after start."
      if (!f.venue.trim()) e.venue = "Enter a venue."
      const n = Number(f.stallCount)
      if (!(n >= 4 && n <= 60)) e.stallCount = "Between 4 and 60 stalls."
    }
    if (i === 1) {
      if (!f.regOpen) e.regOpen = "Pick an opening date."
      if (!f.regClose) e.regClose = "Pick a closing date."
      if (f.regOpen && f.regClose && f.regClose < f.regOpen)
        e.regClose = "Must be after the opening date."
      if (f.regClose && f.date && f.regClose > f.date)
        e.regClose = "Registration must close on or before the fair date."
    }
    if (i === 3 && weightTotal(f.weights) !== 100)
      e.weights = `Weights must add up to 100 (currently ${weightTotal(f.weights)}).`
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const next = () => validate(step) && setStep(step + 1)
  const create = () => {
    for (let i = 0; i < 4; i++) if (!validate(i)) return setStep(i)
    const id = actions.createFair({
      name: f.name.trim(),
      date: new Date(`${f.date}T${f.startTime}:00`).toISOString(),
      startTime: f.startTime,
      endTime: f.endTime,
      venue: f.venue.trim(),
      description: f.description.trim(),
      stallCount: Number(f.stallCount),
      registrationOpen: iso(f.regOpen),
      registrationClose: iso(f.regClose),
      policy: f.policy,
      weights: f.weights,
    })
    toast({
      title: `${f.name.trim()} created`,
      description: "Assign stalls next.",
      tone: "success",
    })
    navigate(`/admin/fairs/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={{ to: "/admin/fairs", label: "All fairs" }}
        title="New fair"
        description="Set up a career fair in five short steps."
      />
      <Card className="p-5">
        <Stepper steps={STEPS} current={step} onStep={setStep} />
      </Card>
      <Card className="mt-5 p-6">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Fair name"
              error={errors.name}
              required
              className="sm:col-span-2"
            >
              <Input
                value={f.name}
                onChange={set("name")}
                placeholder="UOL Spring Career Fair"
              />
            </Field>
            <Field label="Date" error={errors.date} required>
              <Input type="date" value={f.date} onChange={set("date")} />
            </Field>
            <Field label="Number of stalls" error={errors.stallCount} required>
              <Input
                type="number"
                min={4}
                max={60}
                value={f.stallCount}
                onChange={set("stallCount")}
              />
            </Field>
            <Field label="Starts" required>
              <Input
                type="time"
                value={f.startTime}
                onChange={set("startTime")}
              />
            </Field>
            <Field label="Ends" error={errors.endTime} required>
              <Input type="time" value={f.endTime} onChange={set("endTime")} />
            </Field>
            <Field
              label="Venue"
              error={errors.venue}
              required
              className="sm:col-span-2"
            >
              <Input value={f.venue} onChange={set("venue")} />
            </Field>
            <Field
              label="Description"
              hint="Shown to students and recruiters"
              className="sm:col-span-2"
            >
              <Textarea
                rows={3}
                value={f.description}
                onChange={set("description")}
              />
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Registration opens" error={errors.regOpen} required>
              <Input type="date" value={f.regOpen} onChange={set("regOpen")} />
            </Field>
            <Field label="Registration closes" error={errors.regClose} required>
              <Input
                type="date"
                value={f.regClose}
                onChange={set("regClose")}
              />
            </Field>
            <Callout tone="brand" className="sm:col-span-2">
              Students can register and companies can set up stalls during this
              window. All approved companies are invited automatically.
            </Callout>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <Switch
              checked={f.policy.requireVerification}
              onChange={setPolicy("requireVerification")}
              label="Require verified profiles"
              description="Only registrar-verified students can share at stalls."
            />
            <Switch
              checked={f.policy.allowCgpaHiding}
              onChange={setPolicy("allowCgpaHiding")}
              label="Allow students to hide CGPA"
              description="Hidden CGPA is excluded from scoring and never shown to recruiters."
            />
            <Switch
              checked={f.policy.shareLinks}
              onChange={setPolicy("shareLinks")}
              label="Share GitHub and LinkedIn links"
              description="Students can still turn links off individually."
            />
            <Field
              label="Data retention (days)"
              hint="Recruiter access to shared profiles ends after this period."
            >
              <Input
                type="number"
                min={30}
                max={365}
                value={f.policy.retentionDays}
                onChange={(e) =>
                  setPolicy("retentionDays")(Number(e.target.value))
                }
                className="max-w-[160px]"
              />
            </Field>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <WeightsEditor
              value={f.weights}
              onChange={(w) => setF({ ...f, weights: w })}
            />
            {errors.weights && (
              <p className="text-sm font-medium text-danger-600">
                {errors.weights}
              </p>
            )}
          </div>
        )}
        {step === 4 && (
          <dl className="divide-y divide-line text-sm">
            {[
              ["Name", f.name],
              [
                "Date",
                f.date
                  ? `${fmtDate(f.date, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · ${f.startTime}–${f.endTime}`
                  : "—",
              ],
              ["Venue", f.venue],
              ["Stalls", f.stallCount],
              [
                "Registration",
                f.regOpen && f.regClose
                  ? `${fmtDate(f.regOpen)} – ${fmtDate(f.regClose)}`
                  : "—",
              ],
              [
                "Policy",
                `${
                  f.policy.requireVerification
                    ? "Verified only"
                    : "All students"
                } · ${
                  f.policy.allowCgpaHiding
                    ? "CGPA hiding allowed"
                    : "CGPA always shown"
                } · ${f.policy.retentionDays}-day retention`,
              ],
              [
                "AI weights",
                `Skills ${f.weights.skills} · CGPA ${f.weights.cgpa} · FYP ${f.weights.fyp} · Certs ${f.weights.certs}`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-3">
                <dt className="font-semibold text-ink-400">{k}</dt>
                <dd className="text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-6 flex justify-between border-t border-line pt-5">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() =>
              step ? setStep(step - 1) : navigate("/admin/fairs")
            }
          >
            {step ? "Back" : "Cancel"}
          </Button>
          {step < 4 ? (
            <Button iconRight={ArrowRight} onClick={next}>
              Continue
            </Button>
          ) : (
            <Button variant="success" icon={Check} onClick={create}>
              Create fair
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

import { useParams } from "react-router"
import {
  CalendarClock,
  MapPin,
  Video,
  Backpack,
  MessageSquareText,
  Lightbulb,
  Check,
  Sparkles,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  CompanyLogo,
  Chip,
  Badge,
  Callout,
} from "@/components/ui"
import ErrorPage from "@/pages/public/ErrorPage"
import { useStudent } from "./common"

const BRING = [
  "Two printed copies of your CV",
  "Student ID card",
  "Laptop or phone with your GitHub and FYP demo ready",
  "A short notebook and pen",
]

export default function InterviewPrep() {
  const { id } = useParams()
  const { s, student } = useStudent()
  const iv = s.interviews.find((i) => i.id === id && i.studentId === student.id)
  if (!iv) return <ErrorPage />
  const c = s.companies.find((x) => x.id === iv.companyId)
  const ix = s.interactions.find((x) => x.id === iv.interactionId)
  const job = s.jobs.find((j) => j.id === ix?.jobId)
  const slot = s.slots.find((sl) => sl.id === iv.slotId)
  const matched = ix?.matchedSkills || []
  const missing = ix?.missingSkills || []
  const questions = [
    `Walk me through your final-year project, ${
      student.fyp?.title ? `“${student.fyp.title}”` : "and your role in it"
    }.`,
    matched[0]
      ? `Tell us about a problem you solved using ${matched[0]}.`
      : "Tell us about a technical problem you are proud of solving.",
    job
      ? `Why are you interested in the ${job.title} role at ${c.name}?`
      : `Why ${c.name}?`,
    missing[0]
      ? `How would you get up to speed with ${missing[0]}?`
      : "What are you learning right now?",
    "Describe a time you disagreed with a teammate. What happened?",
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        back={{ to: "/student/interviews", label: "Interviews" }}
        eyebrow="Interview prep"
        title={job?.title || `Interview with ${c.name}`}
      />
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <CompanyLogo company={c} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold text-ink-900">{c.name}</div>
          <div className="text-[13px] text-ink-400">
            {c.industry} · {c.city}
          </div>
        </div>
        {slot && iv.status === "scheduled" ? (
          <div className="space-y-1 text-sm sm:text-right">
            <div className="flex items-center gap-1.5 font-semibold text-ink-900 sm:justify-end">
              <CalendarClock className="size-4 text-brand-600" />
              {slot.time}
            </div>
            <div className="flex items-center gap-1.5 text-ink-600 sm:justify-end">
              {iv.mode === "online" ? (
                <Video className="size-4" />
              ) : (
                <MapPin className="size-4" />
              )}
              {iv.mode === "online" ? "Online" : slot.location}
            </div>
          </div>
        ) : (
          <Badge
            tone={
              iv.status === "invited"
                ? "ai"
                : iv.status === "completed"
                  ? "navy"
                  : "gray"
            }
          >
            {
              {
                invited: "Slot not picked",
                completed: "Completed",
                declined: "Declined",
                scheduled: "Confirmed",
              }[iv.status]
            }
          </Badge>
        )}
      </Card>

      <Card>
        <CardHeader
          title="How you match this role"
          description="From the profile you shared. Only you see this view."
        />
        <div className="space-y-4 p-5">
          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
              Strengths to highlight
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matched.length ? (
                matched.map((k) => (
                  <Chip key={k} tone="success">
                    {k}
                  </Chip>
                ))
              ) : (
                <span className="text-sm text-ink-400">—</span>
              )}
            </div>
          </div>
          {missing.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Worth brushing up on
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((k) => (
                  <Chip key={k} tone="missing">
                    {k}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-ink-400">
                Be honest if asked. Mention related experience and how you would
                learn it.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader title="What to bring" />
          <ul className="space-y-2.5 p-5">
            {BRING.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-ink-700">
                <Backpack className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {b}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="On the day" />
          <ul className="space-y-2.5 p-5">
            {[
              "Arrive 10 minutes early at the stall",
              "Open with a 30-second introduction",
              "Bring one question about the team",
              "Thank the interviewer before leaving",
            ].map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-ink-700">
                <Check className="mt-0.5 size-4 shrink-0 text-success-600" />
                {b}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Questions to expect" />
        <ol className="space-y-3 p-5">
          {questions.map((q, i) => (
            <li key={q} className="flex gap-3 text-sm text-ink-700">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="pt-0.5">{q}</span>
            </li>
          ))}
        </ol>
      </Card>

      {iv.message && (
        <Callout
          tone="ai"
          icon={MessageSquareText}
          title={`Message from ${c.name}`}
        >
          “{iv.message}”
        </Callout>
      )}
      <Callout tone="brand" icon={Lightbulb}>
        These tips are general guidance generated from your shared profile.{" "}
        <Sparkles className="inline size-3.5" /> They are not a prediction of
        the outcome.
      </Callout>
    </div>
  )
}

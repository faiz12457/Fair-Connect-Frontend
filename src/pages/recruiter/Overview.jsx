import { Link } from "react-router"
import {
  Users,
  Gauge,
  Star,
  CalendarClock,
  Radio,
  QrCode,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  CalendarDays,
  MapPin,
} from "lucide-react"
import {
  Card,
  CardHeader,
  StatCard,
  Button,
  ProgressBar,
  Avatar,
  MatchPill,
  StatusPill,
  EmptyState,
  LiveIndicator,
} from "@/components/ui"
import { daysUntil, fmtDate, timeAgo, cx } from "@/lib/format"
import { useRecruiter } from "./common"

export default function Overview() {
  const { s, user, company, fair, stall, jobs, interactions } = useRecruiter()
  const slots = s.slots.filter(
    (sl) => sl.companyId === company.id && sl.fairId === fair.id,
  )
  const checklist = [
    {
      label: "Complete your stall profile",
      hint: "About, perks and website shown to students",
      done: !!company.about && company.perks?.length > 0,
      to: "/recruiter/stall",
    },
    {
      label: "Post at least one job",
      hint: "Matching scores are computed against your active roles",
      done: jobs.some((j) => j.status === "active"),
      to: "/recruiter/jobs",
    },
    {
      label: "Add interview slots",
      hint: "Offer times on fair day",
      done: slots.length > 0,
      to: "/recruiter/interviews",
    },
    {
      label: "Get your stall QR",
      hint: stall
        ? `Stall ${stall.number} is assigned`
        : "Career Services assigns stalls",
      done: stall?.qr.status === "active",
      to: "/recruiter/qr",
    },
  ]
  const doneCount = checklist.filter((c) => c.done).length
  const top = [...interactions].sort((a, b) => b.score - a.score).slice(0, 5)
  const avg = interactions.length
    ? Math.round(
        interactions.reduce((a, i) => a + i.score, 0) / interactions.length,
      )
    : 0
  const ivs = s.interviews.filter(
    (i) =>
      i.companyId === company.id &&
      i.fairId === fair.id &&
      i.status !== "declined",
  )
  const upcoming = ivs
    .filter((i) => i.status === "scheduled")
    .map((i) => ({
      iv: i,
      slot: s.slots.find((sl) => sl.id === i.slotId),
      student: s.students.find((st) => st.id === i.studentId),
    }))
    .sort((a, b) => (a.slot?.time || "").localeCompare(b.slot?.time || ""))
  const days = daysUntil(fair.date)
  const first = user.name.split(" ")[0]

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-1.5">{company.name}</div>
        <h1 className="text-2xl font-bold sm:text-[28px]">
          Good to see you, {first}
        </h1>
      </div>

      <section className="relative overflow-hidden rounded-[20px] bg-navy-950 p-6 text-white sm:p-8">
        <div className="absolute -top-20 -right-16 size-72 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
                {fair.name}
              </span>
              <LiveIndicator status={fair.status} />
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-[28px]">
              {fair.status === "live"
                ? `${interactions.length} student${
                    interactions.length === 1 ? "" : "s"
                  } shared with you so far`
                : fair.status === "upcoming"
                  ? days > 0
                    ? `${days} day${days === 1 ? "" : "s"} until fair day`
                    : "Fair day is today"
                  : "The fair has ended — time to follow up"}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />{" "}
                {fmtDate(fair.date, { weekday: "short" })}, {fair.startTime}–
                {fair.endTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />{" "}
                {stall
                  ? `Stall ${stall.number}, Zone ${stall.zone}`
                  : "Stall not assigned yet"}
              </span>
            </p>
          </div>
          {fair.status === "live" ? (
            <Button to="/recruiter/live" size="lg" variant="white" icon={Radio}>
              Open live dashboard
            </Button>
          ) : fair.status === "ended" ? (
            <Button
              to="/recruiter/pipeline"
              size="lg"
              variant="white"
              icon={Download}
            >
              Review & export
            </Button>
          ) : (
            <Button to="/recruiter/qr" size="lg" variant="white" icon={QrCode}>
              Stall poster
            </Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Visitors"
          value={interactions.length}
          icon={Users}
          hint="Shared their profile"
        />
        <StatCard
          label="Avg match"
          value={`${avg}%`}
          icon={Gauge}
          tone="ai"
          hint="Across your roles"
        />
        <StatCard
          label="Shortlisted"
          value={
            interactions.filter(
              (i) =>
                i.status === "shortlisted" || i.status.startsWith("interview"),
            ).length
          }
          icon={Star}
          tone="success"
        />
        <StatCard
          label="Interviews"
          value={ivs.length}
          icon={CalendarClock}
          tone="warning"
          hint={`${upcoming.length} booked`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title={
              fair.status === "upcoming" ? "Pre-fair preview" : "Top candidates"
            }
            description={
              fair.status === "upcoming"
                ? "Candidates appear once students share at your stall."
                : "Highest AI match among your visitors"
            }
            actions={
              interactions.length > 0 && (
                <Link
                  to="/recruiter/live"
                  className="text-[13px] font-semibold text-brand-600"
                >
                  View all
                </Link>
              )
            }
          />
          {top.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No visitors yet"
              body={
                fair.status === "live"
                  ? "Your first visitor will show up here."
                  : "You’ll only ever see students who visit your stall and choose to share."
              }
              action={
                <Button variant="secondary" to="/recruiter/pool">
                  See pool stats
                </Button>
              }
            />
          ) : (
            <ul className="p-3">
              {top.map((ix) => {
                const st = s.students.find((x) => x.id === ix.studentId)
                const job = s.jobs.find((j) => j.id === ix.jobId)
                return (
                  <li key={ix.id}>
                    <Link
                      to={`/recruiter/live?open=${ix.id}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted"
                    >
                      <Avatar name={st.name} tint={st.tint} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink-900">
                          {st.name}
                        </div>
                        <div className="truncate text-xs text-ink-400">
                          {job?.title} · {timeAgo(ix.createdAt)}
                        </div>
                      </div>
                      <span className="hidden sm:block">
                        <StatusPill status={ix.status} />
                      </span>
                      <MatchPill score={ix.score} size="sm" hideLabel />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Setup checklist"
              description={`${doneCount} of ${checklist.length} complete`}
            />
            <div className="px-5 pt-3">
              <ProgressBar
                value={(doneCount / checklist.length) * 100}
                tone={doneCount === checklist.length ? "success" : "brand"}
                size="sm"
              />
            </div>
            <ul className="p-3">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link
                    to={c.to}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted"
                  >
                    <span
                      className={cx(
                        "grid size-6 shrink-0 place-items-center rounded-full",
                        c.done
                          ? "bg-success-600 text-white"
                          : "ring-2 ring-line",
                      )}
                    >
                      {c.done && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cx(
                          "block text-sm font-semibold",
                          c.done
                            ? "text-ink-400 line-through decoration-ink-300"
                            : "text-ink-900",
                        )}
                      >
                        {c.label}
                      </span>
                      <span className="block truncate text-xs text-ink-400">
                        {c.hint}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-ink-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader
              title="Booked interviews"
              actions={
                <Link
                  to="/recruiter/interviews"
                  className="text-[13px] font-semibold text-brand-600"
                >
                  Agenda
                </Link>
              }
            />
            {upcoming.length === 0 ? (
              <p className="px-5 pt-2 pb-5 text-sm text-ink-400">
                No interviews booked yet.
              </p>
            ) : (
              <ul className="p-3">
                {upcoming.slice(0, 4).map(({ iv, slot, student }) => (
                  <li
                    key={iv.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2"
                  >
                    <span className="w-12 text-sm font-bold text-ink-900 tabular">
                      {slot?.time}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-700">
                      {student.name}
                    </span>
                    <Link
                      to={`/recruiter/candidates/${iv.interactionId}`}
                      className="text-ink-300 hover:text-ink-700"
                      aria-label={`Open ${student.name}`}
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

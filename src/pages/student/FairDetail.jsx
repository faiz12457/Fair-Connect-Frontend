import { useState } from "react"
import { Link, useParams } from "react-router"
import {
  CalendarDays,
  Clock,
  MapPin,
  ScanLine,
  DoorOpen,
  Search,
  ChevronRight,
  Check,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  LiveIndicator,
  CompanyLogo,
  Input,
  Callout,
  Badge,
  EmptyState,
} from "@/components/ui"
import { fmtDate, daysUntil } from "@/lib/format"
import ErrorPage from "@/pages/public/ErrorPage"
import { useStudent } from "./common"

export default function FairDetail() {
  const { fairId } = useParams()
  const { s, student } = useStudent()
  const [q, setQ] = useState("")
  const fair = s.fairs.find((f) => f.id === fairId)
  if (!fair || fair.status === "archived") return <ErrorPage />

  const rows = s.stalls
    .filter((st) => st.fairId === fair.id && st.companyId)
    .map((st) => ({ st, c: s.companies.find((c) => c.id === st.companyId) }))
    .filter(
      ({ c }) =>
        c &&
        c.status === "approved" &&
        (!q ||
          `${c.name} ${c.industry}`.toLowerCase().includes(q.toLowerCase())),
    )
    .sort((a, b) => a.st.number - b.st.number)
  const shared = new Set(
    s.interactions
      .filter((i) => i.studentId === student.id && i.fairId === fair.id)
      .map((i) => i.companyId),
  )
  const checkedIn = s.checkins.some(
    (c) => c.fairId === fair.id && c.studentId === student.id,
  )
  const days = daysUntil(fair.date)

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ to: "/student", label: "Home" }}
        title={fair.name}
        description={fair.description}
        actions={<LiveIndicator status={fair.status} />}
      />

      <Card className="overflow-hidden">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[
            [
              CalendarDays,
              "Date",
              fmtDate(fair.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
              }),
            ],
            [Clock, "Hours", `${fair.startTime} – ${fair.endTime}`],
            [MapPin, "Venue", fair.venue],
          ].map(([I, k, v]) => (
            <div key={k} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                <I className="size-5" />
              </span>
              <div>
                <div className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  {k}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-ink-900">
                  {v}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-surface-muted/60 p-5">
          {fair.status === "live" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-ink-700">
                {checkedIn ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-success-700">
                    <Check className="size-4" />
                    You are checked in.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <DoorOpen className="size-4 text-ink-400" />
                    Scan the gate QR at the entrance to check in.
                  </span>
                )}{" "}
                Then scan a stall QR to share your profile.
              </div>
              <Button icon={ScanLine} to="/student/scan">
                Scan a stall
              </Button>
            </div>
          ) : fair.status === "upcoming" ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-700">
                <span className="font-semibold text-ink-900">
                  {days > 0
                    ? `${days} day${days === 1 ? "" : "s"} to go.`
                    : "Starts today."}
                </span>{" "}
                Check your suggested companies and plan your route by stall
                number.
              </p>
              <Button variant="secondary" to="/student/suggestions">
                See suggestions
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-700">
                This fair has ended. You shared with {shared.size} compan
                {shared.size === 1 ? "y" : "ies"}.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" to="/student/activity">
                  My activity
                </Button>
                <Button variant="ghost" to={`/student/feedback/${fair.id}`}>
                  Give feedback
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {fair.status === "live" && !checkedIn && (
        <Callout tone="brand" icon={DoorOpen}>
          Check-in helps Career Services plan future fairs. It does not share
          your profile with anyone.
        </Callout>
      )}

      <Card>
        <CardHeader
          title="Stall directory"
          description={`${rows.length} participating companies`}
        />
        <div className="px-5 pt-4">
          <Input
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies or industries"
            aria-label="Search companies"
          />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Search} title="No companies match" />
        ) : (
          <ul className="divide-y divide-line p-2">
            {rows.map(({ st, c }) => (
              <li key={st.id}>
                <Link
                  to={`/student/companies/${c.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
                >
                  <span className="w-12 shrink-0 text-center">
                    <span className="block text-[10px] font-semibold text-ink-400 uppercase">
                      Stall
                    </span>
                    <span className="text-lg leading-none font-bold text-ink-900 tabular">
                      {st.number}
                    </span>
                  </span>
                  <CompanyLogo company={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">
                      {c.name}
                    </div>
                    <div className="truncate text-xs text-ink-400">
                      {c.industry} · Zone {st.zone}
                    </div>
                  </div>
                  {shared.has(c.id) && (
                    <Badge tone="success" icon={Check}>
                      Shared
                    </Badge>
                  )}
                  <ChevronRight className="size-4 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

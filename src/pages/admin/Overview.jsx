import { Link } from "react-router"
import {
  Building2,
  GraduationCap,
  LayoutGrid,
  QrCode,
  Users,
  Radio,
  DoorOpen,
  ArrowRight,
  CalendarDays,
  MapPin,
  CircleCheck,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  Button,
  LiveIndicator,
  CompanyLogo,
  EmptyState,
  Badge,
} from "@/components/ui"
import { fmtDate, daysUntil, timeAgo } from "@/lib/format"
import { useAdmin } from "./common"

export default function AdminOverview() {
  const { s, user, fair } = useAdmin()
  const stalls = s.stalls.filter((st) => st.fairId === fair.id)
  const assigned = stalls.filter((st) => st.companyId)
  const qrs = assigned.filter((st) => st.qr.status === "active")
  const pendingCo = s.companies.filter((c) => c.status === "pending")
  const pendingSt = s.students.filter((st) => st.verification !== "verified")
  const ixs = s.interactions.filter((i) => i.fairId === fair.id)
  const checkins = s.checkins.filter((c) => c.fairId === fair.id)
  const approved = s.companies.filter((c) => c.status === "approved")
  const unassigned = approved.filter(
    (c) => !assigned.some((st) => st.companyId === c.id),
  )
  const days = daysUntil(fair.date)

  const todos = [
    pendingCo.length && {
      to: "/admin/companies",
      icon: Building2,
      label: `${pendingCo.length} compan${
        pendingCo.length === 1 ? "y" : "ies"
      } awaiting approval`,
      tone: "warning",
    },
    pendingSt.length && {
      to: "/admin/students",
      icon: GraduationCap,
      label: `${pendingSt.length} student${
        pendingSt.length === 1 ? "" : "s"
      } need verification`,
      tone: "warning",
    },
    unassigned.length && {
      to: `/admin/fairs/${fair.id}/stalls`,
      icon: LayoutGrid,
      label: `${unassigned.length} approved compan${
        unassigned.length === 1 ? "y has" : "ies have"
      } no stall`,
      tone: "brand",
    },
    assigned.length - qrs.length && {
      to: `/admin/fairs/${fair.id}/stalls`,
      icon: QrCode,
      label: `${assigned.length - qrs.length} assigned stall${
        assigned.length - qrs.length === 1 ? "" : "s"
      } without an active QR`,
      tone: "brand",
    },
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={s.university.careerOffice}
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description="Everything you need to run the fair, at a glance."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 bg-navy-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <LiveIndicator status={fair.status} />
              <span className="text-[13px] text-white/60">
                {fair.status === "upcoming"
                  ? days > 0
                    ? `in ${days} day${days === 1 ? "" : "s"}`
                    : "today"
                  : fair.status === "live"
                    ? "Happening now"
                    : "Finished"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{fair.name}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/70">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {fmtDate(fair.date, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {fair.startTime}–{fair.endTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {fair.venue}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fair.status === "live" && (
              <Button
                variant="white"
                icon={Radio}
                to={`/admin/fairs/${fair.id}/live`}
              >
                Live monitor
              </Button>
            )}
            <Button
              variant={fair.status === "live" ? "ghost" : "white"}
              className={
                fair.status === "live" ? "text-white hover:bg-white/10" : ""
              }
              iconRight={ArrowRight}
              to={`/admin/fairs/${fair.id}`}
            >
              {fair.status === "upcoming" ? "Manage & go live" : "Manage fair"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Companies"
          value={approved.length}
          icon={Building2}
          hint={`${pendingCo.length} pending`}
        />
        <StatCard
          label="Stalls assigned"
          value={`${assigned.length}/${stalls.length}`}
          icon={LayoutGrid}
          tone="ai"
          hint={`${qrs.length} QR active`}
        />
        <StatCard
          label="Verified students"
          value={s.students.length - pendingSt.length}
          icon={GraduationCap}
          tone="success"
          hint={`${pendingSt.length} pending`}
        />
        {fair.status === "upcoming" ? (
          <StatCard
            label="Registered"
            value={s.students.length}
            icon={Users}
            tone="warning"
          />
        ) : (
          <StatCard
            label="Profile shares"
            value={ixs.length}
            icon={Users}
            tone="warning"
            hint={`${checkins.length} checked in`}
          />
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader
            title="To do"
            description="Items blocking a smooth fair day"
          />
          {todos.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="All caught up"
              body="No approvals, verifications or stall setup pending."
            />
          ) : (
            <ul className="space-y-1 p-3">
              {todos.map((t) => (
                <li key={t.label}>
                  <Link
                    to={t.to}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
                  >
                    <span
                      className={
                        t.tone === "warning"
                          ? "grid size-9 place-items-center rounded-[10px] bg-warning-50 text-warning-600"
                          : "grid size-9 place-items-center rounded-[10px] bg-brand-50 text-brand-600"
                      }
                    >
                      <t.icon className="size-[18px]" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-ink-900">
                      {t.label}
                    </span>
                    <ArrowRight className="size-4 text-ink-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Pending companies"
            actions={
              <Button size="sm" variant="ghost" to="/admin/companies">
                Review all
              </Button>
            }
          />
          {pendingCo.length === 0 ? (
            <EmptyState icon={Building2} title="No pending registrations" />
          ) : (
            <ul className="divide-y divide-line p-2">
              {pendingCo.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/admin/companies?open=${c.id}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
                  >
                    <CompanyLogo company={c} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">
                        {c.name}
                      </div>
                      <div className="text-xs text-ink-400">
                        {c.industry} · submitted {timeAgo(c.submittedAt)}
                      </div>
                    </div>
                    <Badge tone="warning">Pending</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            to: `/admin/fairs/${fair.id}/stalls`,
            icon: LayoutGrid,
            title: "Stalls & QR",
            body: "Assign stalls and generate posters",
          },
          {
            to: `/admin/fairs/${fair.id}/checkin`,
            icon: DoorOpen,
            title: "Gate check-in",
            body: "Show the entrance QR",
          },
          {
            to: "/admin/settings/ai",
            icon: Radio,
            title: "AI weights",
            body: "Tune how matches are scored",
          },
        ].map((q) => (
          <Link key={q.title} to={q.to} className="group">
            <Card className="flex items-center gap-4 p-4 transition-shadow group-hover:shadow-pop">
              <span className="grid size-10 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                <q.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900">
                  {q.title}
                </div>
                <div className="text-xs text-ink-400">{q.body}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router"
import {
  CalendarDays,
  MapPin,
  Clock,
  LayoutGrid,
  Radio,
  DoorOpen,
  Play,
  Square,
  Archive,
  CalendarClock,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  LiveIndicator,
  ConfirmDialog,
  Tabs,
  CompanyLogo,
  Badge,
  StatCard,
  Callout,
  EmptyState,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { fmtDate, cx } from "@/lib/format"
import ErrorPage from "@/pages/public/ErrorPage"
import { useFairParam, FAIR_LABEL } from "./common"

const STEPS = ["upcoming", "live", "ended", "archived"]
const CONFIRM = {
  upcoming: {
    title: "Move back to Upcoming?",
    body: "Scanning will be closed and recruiters lose their live dashboard until you go live again.",
    icon: CalendarClock,
    tone: "primary",
  },
  live: {
    title: "Go live now?",
    body: "Every student and recruiter is notified. Students can scan stall QRs and recruiters see candidates in real time.",
    icon: Play,
    tone: "success",
  },
  ended: {
    title: "End the fair?",
    body: "Scanning stops immediately. Recruiters keep access to their pipeline and can continue follow-ups.",
    icon: Square,
    tone: "danger",
  },
  archived: {
    title: "Archive this fair?",
    body: "The fair becomes read-only and is hidden from students. Aggregate analytics remain available.",
    icon: Archive,
    tone: "primary",
  },
}

export default function FairDetail() {
  const { s, fair, missing } = useFairParam()
  const [confirm, setConfirm] = useState(null)
  const [tab, setTab] = useState("overview")
  if (missing) return <ErrorPage />

  const stalls = s.stalls.filter((st) => st.fairId === fair.id)
  const assigned = stalls.filter((st) => st.companyId)
  const companies = assigned
    .map((st) => ({ st, c: s.companies.find((c) => c.id === st.companyId) }))
    .sort((a, b) => a.st.number - b.st.number)
  const ixs = s.interactions.filter((i) => i.fairId === fair.id)
  const checkins = s.checkins.filter((c) => c.fairId === fair.id)
  const qrActive = assigned.filter((st) => st.qr.status === "active").length
  const idx = STEPS.indexOf(fair.status)
  const apply = (status) => {
    actions.setFairStatus(fair.id, status)
    toast({
      title: `${fair.name} is now ${FAIR_LABEL[status]}`,
      tone: status === "live" ? "success" : "info",
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ to: "/admin/fairs", label: "All fairs" }}
        title={fair.name}
        description={fair.description}
        actions={<LiveIndicator status={fair.status} />}
      />

      <Card>
        <CardHeader
          title="Fair status"
          description="Controls what students and recruiters can do right now."
        />
        <div className="grid gap-2 p-5 sm:grid-cols-4">
          {STEPS.map((st, i) => {
            const C = CONFIRM[st]
            const current = st === fair.status
            return (
              <button
                key={st}
                type="button"
                disabled={current}
                onClick={() => setConfirm(st)}
                className={cx(
                  "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                  current
                    ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                    : "border-line hover:border-ink-300 hover:bg-surface-muted",
                  i < idx && !current && "opacity-70",
                )}
              >
                <span
                  className={cx(
                    "grid size-9 shrink-0 place-items-center rounded-[10px]",
                    current
                      ? "bg-brand-600 text-white"
                      : "bg-surface-muted text-ink-600",
                  )}
                >
                  <C.icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    {FAIR_LABEL[st]}
                  </span>
                  <span className="block text-xs text-ink-400">
                    {current
                      ? "Current"
                      : i === idx + 1
                        ? "Next step"
                        : `Set ${FAIR_LABEL[st].toLowerCase()}`}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        {fair.status === "upcoming" &&
          (qrActive < assigned.length || assigned.length === 0) && (
            <div className="px-5 pb-5">
              <Callout tone="warning" title="Some stalls are not ready">
                {assigned.length - qrActive} of {assigned.length} assigned
                stalls have no active QR. Students cannot share at those stalls.
              </Callout>
            </div>
          )}
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Stalls assigned"
          value={`${assigned.length}/${stalls.length}`}
          icon={LayoutGrid}
        />
        <StatCard
          label="QR active"
          value={qrActive}
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Check-ins"
          value={fair.totals?.students ?? checkins.length}
          icon={DoorOpen}
          tone="warning"
        />
        <StatCard
          label="Profile shares"
          value={(fair.totals?.interactions ?? ixs.length).toLocaleString()}
          icon={Radio}
          tone="ai"
        />
      </div>

      <Card>
        <Tabs
          className="px-3 pt-2"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: "Details" },
            { id: "companies", label: "Companies", count: companies.length },
          ]}
        />
        {tab === "overview" ? (
          <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  CalendarDays,
                  "Date",
                  fmtDate(fair.date, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                ],
                [Clock, "Hours", `${fair.startTime} – ${fair.endTime}`],
                [MapPin, "Venue", fair.venue],
                [
                  CalendarClock,
                  "Registration",
                  `${fmtDate(fair.registrationOpen)} – ${fmtDate(fair.registrationClose)}`,
                ],
                [
                  ShieldCheck,
                  "Sharing policy",
                  `${
                    fair.policy.allowCgpaHiding
                      ? "CGPA hiding allowed"
                      : "CGPA always shown"
                  } · ${fair.policy.retentionDays}-day retention`,
                ],
                [
                  SlidersHorizontal,
                  "AI weights",
                  `Skills ${fair.weights.skills} · CGPA ${fair.weights.cgpa} · FYP ${fair.weights.fyp} · Certs ${fair.weights.certs}`,
                ],
              ].map(([I, k, v]) => (
                <div key={k} className="flex gap-3">
                  <I className="mt-0.5 size-4 shrink-0 text-ink-400" />
                  <div>
                    <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink-900">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="space-y-2">
              <Button
                variant="secondary"
                icon={LayoutGrid}
                to={`/admin/fairs/${fair.id}/stalls`}
                className="w-full justify-start"
              >
                Stalls & QR
              </Button>
              <Button
                variant="secondary"
                icon={Radio}
                to={`/admin/fairs/${fair.id}/live`}
                className="w-full justify-start"
              >
                Live monitor
              </Button>
              <Button
                variant="secondary"
                icon={DoorOpen}
                to={`/admin/fairs/${fair.id}/checkin`}
                className="w-full justify-start"
              >
                Gate check-in
              </Button>
              <Button
                variant="secondary"
                icon={SlidersHorizontal}
                to="/admin/settings/ai"
                className="w-full justify-start"
              >
                AI weights
              </Button>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No stalls assigned yet"
            action={
              <Button variant="secondary" to={`/admin/fairs/${fair.id}/stalls`}>
                Assign stalls
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line p-2">
            {companies.map(({ st, c }) => {
              const n = ixs.filter((i) => i.companyId === c.id).length
              return (
                <li key={st.id} className="flex items-center gap-3 px-3 py-3">
                  <span className="w-10 text-sm font-bold text-ink-400 tabular">
                    #{st.number}
                  </span>
                  <CompanyLogo company={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/admin/companies?open=${c.id}`}
                      className="truncate text-sm font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {c.name}
                    </Link>
                    <div className="text-xs text-ink-400">{c.industry}</div>
                  </div>
                  <span className="hidden text-xs text-ink-400 sm:inline">
                    {n} shares
                  </span>
                  <Badge
                    tone={
                      st.qr.status === "active"
                        ? "success"
                        : st.qr.status === "revoked"
                          ? "danger"
                          : "gray"
                    }
                    dot
                  >
                    {st.qr.status === "active"
                      ? "QR active"
                      : st.qr.status === "revoked"
                        ? "QR revoked"
                        : "No QR"}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {confirm && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => apply(confirm)}
          title={CONFIRM[confirm].title}
          body={CONFIRM[confirm].body}
          confirmLabel={`Set ${FAIR_LABEL[confirm]}`}
          tone={CONFIRM[confirm].tone}
        />
      )}
    </div>
  )
}

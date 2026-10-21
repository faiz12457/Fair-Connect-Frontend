import { Radio, Users, Star, CalendarCheck, DoorOpen, Play } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  LiveIndicator,
  EmptyState,
  Button,
  Avatar,
  StatusPill,
} from "@/components/ui"
import { timeAgo, cx } from "@/lib/format"
import { useTick } from "@/pages/recruiter/common"
import ErrorPage from "@/pages/public/ErrorPage"
import { useFairParam } from "./common"

export default function LiveMonitor() {
  useTick(15000)
  const { s, fair, missing } = useFairParam()
  if (missing) return <ErrorPage />
  const ixs = s.interactions
    .filter((i) => i.fairId === fair.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const stalls = s.stalls
    .filter((st) => st.fairId === fair.id && st.companyId)
    .sort((a, b) => a.number - b.number)
  const checkins = s.checkins.filter((c) => c.fairId === fair.id)
  const byCo = Object.fromEntries(
    stalls.map((st) => [
      st.companyId,
      ixs.filter((i) => i.companyId === st.companyId).length,
    ]),
  )
  const max = Math.max(1, ...Object.values(byCo))
  const header = (
    <PageHeader
      back={{ to: `/admin/fairs/${fair.id}`, label: fair.name }}
      title="Live monitor"
      description="Real-time activity across every stall."
      actions={<LiveIndicator status={fair.status} />}
    />
  )

  if (fair.status === "upcoming") {
    return (
      <div>
        {header}
        <Card>
          <EmptyState
            icon={Radio}
            title="The fair is not live yet"
            body="Counters and the activity feed start as soon as you set the fair to Live."
            action={
              <Button icon={Play} to={`/admin/fairs/${fair.id}`}>
                Go to fair controls
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {header}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Checked in"
          value={checkins.length}
          icon={DoorOpen}
          tone="warning"
        />
        <StatCard label="Profile shares" value={ixs.length} icon={Users} />
        <StatCard
          label="Shortlisted"
          value={
            ixs.filter((i) =>
              [
                "shortlisted",
                "interview_invited",
                "interview_scheduled",
                "interview_completed",
              ].includes(i.status),
            ).length
          }
          icon={Star}
          tone="success"
        />
        <StatCard
          label="Interviews"
          value={
            s.interviews.filter(
              (iv) => iv.fairId === fair.id && iv.status !== "declined",
            ).length
          }
          icon={CalendarCheck}
          tone="ai"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title="Stall activity"
            description="Darker stalls have more shares"
          />
          <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-3 md:grid-cols-5">
            {stalls.map((st) => {
              const c = s.companies.find((x) => x.id === st.companyId)
              const n = byCo[st.companyId]
              const level = n === 0 ? 0 : Math.ceil((n / max) * 4)
              return (
                <div
                  key={st.id}
                  className={cx(
                    "rounded-xl p-3 transition-colors",
                    [
                      "bg-surface-muted text-ink-600",
                      "bg-brand-50 text-brand-700",
                      "bg-brand-100 text-brand-700",
                      "bg-brand-400 text-white",
                      "bg-brand-600 text-white",
                    ][level],
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold opacity-80">
                    <span>#{st.number}</span>
                    {st.qr.status !== "active" && <span>No QR</span>}
                  </div>
                  <div className="mt-1 truncate text-[13px] font-semibold">
                    {c.name}
                  </div>
                  <div className="text-xl font-bold tabular">{n}</div>
                </div>
              )
            })}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Latest shares"
            description={
              fair.status === "live"
                ? "Updates as students share"
                : "Fair has ended"
            }
          />
          {ixs.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="Waiting for the first scan"
              body="Use the demo panel to simulate a student scan."
            />
          ) : (
            <ul className="max-h-[520px] divide-y divide-line overflow-y-auto p-2">
              {ixs.slice(0, 25).map((ix) => {
                const st = s.students.find((x) => x.id === ix.studentId)
                const c = s.companies.find((x) => x.id === ix.companyId)
                return (
                  <li
                    key={ix.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <Avatar name={st.name} tint={st.tint} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] text-ink-900">
                        <span className="font-semibold">
                          {st.name.split(" ")[0]}
                        </span>{" "}
                        shared with{" "}
                        <span className="font-semibold">{c.name}</span>
                      </div>
                      <div className="text-[11px] text-ink-400">
                        {st.department} · {timeAgo(ix.createdAt)}
                      </div>
                    </div>
                    <StatusPill status={ix.status} />
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

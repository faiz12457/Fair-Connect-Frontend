import { useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Users, Building2, Star, CalendarCheck, Info } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  Select,
  ProgressBar,
  Callout,
} from "@/components/ui"
import { useAdmin, CHART, axisProps, tooltipProps } from "./common"

const DEPTS = ["BSCS", "BSSE", "BSAI", "BSIT", "BSDS"]
const SHORT = [
  "shortlisted",
  "interview_invited",
  "interview_scheduled",
  "interview_completed",
]

export default function AdminAnalytics() {
  const { s } = useAdmin()
  const fairs = s.fairs.filter(
    (f) =>
      f.status !== "upcoming" || s.interactions.some((i) => i.fairId === f.id),
  )
  const [fairId, setFairId] = useState(
    () => (s.fairs.find((f) => f.status === "ended") || s.fairs[0]).id,
  )
  const fair = s.fairs.find((f) => f.id === fairId)
  const ixs = s.interactions.filter((i) => i.fairId === fairId)
  const ivs = s.interviews.filter(
    (i) => i.fairId === fairId && i.status !== "declined",
  )
  const t = fair.totals
  const kpi = {
    students:
      t?.students ?? s.checkins.filter((c) => c.fairId === fairId).length,
    companies:
      t?.companies ??
      s.stalls.filter((st) => st.fairId === fairId && st.companyId).length,
    interactions: t?.interactions ?? ixs.length,
    shortlisted:
      t?.shortlisted ?? ixs.filter((i) => SHORT.includes(i.status)).length,
    interviews: t?.interviews ?? ivs.length,
  }
  const funnel = [
    ["Profile shares", kpi.interactions],
    ["Shortlisted", kpi.shortlisted],
    ["Interviews", kpi.interviews],
    ...(t?.offers ? [["Offers", t.offers]] : []),
  ]
  const studentOf = (ix) => s.students.find((st) => st.id === ix.studentId)
  const dept = DEPTS.map((d) => {
    const list = ixs.filter((ix) => studentOf(ix)?.department === d)
    return {
      name: d,
      Shares: list.length,
      Shortlisted: list.filter((i) => SHORT.includes(i.status)).length,
    }
  })
  const supply = {}
  s.students.forEach((st) =>
    st.skills.forEach((k) => (supply[k] = (supply[k] || 0) + 1)),
  )
  const demand = {}
  s.jobs
    .filter((j) => j.status === "active")
    .forEach((j) =>
      j.skills.forEach((k) => (demand[k] = (demand[k] || 0) + j.capacity)),
    )
  const skills = Object.keys(demand)
    .sort((a, b) => demand[b] - demand[a])
    .slice(0, 10)
    .map((k) => ({ name: k, Demand: demand[k], Supply: supply[k] || 0 }))
  const hours = Array.from({ length: 7 }, (_, i) => 10 + i).map((h) => ({
    name: `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`,
    value: ixs.filter((ix) => new Date(ix.createdAt).getHours() === h).length,
  }))

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Fair-wide outcomes for Career Services and leadership."
        actions={
          <Select
            value={fairId}
            onChange={(e) => setFairId(e.target.value)}
            className="w-auto"
            aria-label="Fair"
          >
            {fairs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        }
      />
      {t && (
        <Callout tone="brand" icon={Info}>
          Headline figures for {fair.name} are illustrative aggregates. Charts
          below use the sample interactions in this demo.
        </Callout>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Students attended"
          value={kpi.students.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="Companies"
          value={kpi.companies}
          icon={Building2}
          tone="ai"
        />
        <StatCard
          label="Shortlist rate"
          value={`${
            kpi.interactions
              ? Math.round((kpi.shortlisted / kpi.interactions) * 100)
              : 0
          }%`}
          icon={Star}
          tone="success"
        />
        <StatCard
          label="Interviews"
          value={kpi.interviews.toLocaleString()}
          icon={CalendarCheck}
          tone="warning"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Outcome funnel" />
          <ul className="space-y-4 p-5">
            {funnel.map(([label, v], i) => (
              <li key={label}>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-medium text-ink-700">{label}</span>
                  <span className="font-semibold text-ink-900 tabular">
                    {v.toLocaleString()}{" "}
                    <span className="font-normal text-ink-400">
                      ·{" "}
                      {kpi.interactions
                        ? Math.round((v / kpi.interactions) * 100)
                        : 0}
                      %
                    </span>
                  </span>
                </div>
                <ProgressBar
                  value={kpi.interactions ? (v / kpi.interactions) * 100 : 0}
                  tone={["brand", "light", "ai", "success"][i]}
                />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Peak times" description="Profile shares by hour" />
          <div className="h-60 p-4">
            <ResponsiveContainer>
              <AreaChart
                data={hours}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="admPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.ai} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART.ai} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Shares"
                  stroke={CHART.ai}
                  strokeWidth={2.5}
                  fill="url(#admPeak)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="By department" />
          <div className="h-72 p-4">
            <ResponsiveContainer>
              <BarChart
                data={dept}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="Shares"
                  fill={CHART.brand}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Shortlisted"
                  fill={CHART.success}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Skills: demand vs supply"
            description="Open positions requiring a skill vs students listing it"
          />
          <div className="h-72 p-4">
            <ResponsiveContainer>
              <BarChart
                data={skills}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke={CHART.grid} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  {...axisProps}
                />
                <Tooltip {...tooltipProps} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="Demand"
                  fill={CHART.warning}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={10}
                />
                <Bar
                  dataKey="Supply"
                  fill={CHART.brand}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

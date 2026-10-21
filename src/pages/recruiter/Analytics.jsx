import { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"
import { Users, Gauge, Star, CalendarCheck, ChartColumn } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  Select,
  EmptyState,
  ProgressBar,
} from "@/components/ui"
import { CHART, axisProps, tooltipProps, useRecruiter } from "./common"

const REACHED = {
  reviewed: [
    "reviewed",
    "shortlisted",
    "interview_invited",
    "interview_scheduled",
    "interview_completed",
  ],
  shortlisted: [
    "shortlisted",
    "interview_invited",
    "interview_scheduled",
    "interview_completed",
  ],
  invited: ["interview_invited", "interview_scheduled", "interview_completed"],
  interviewed: ["interview_completed"],
}

export default function Analytics() {
  const { s, company, fair } = useRecruiter()
  const fairs = s.fairs.filter((f) =>
    s.interactions.some((i) => i.companyId === company.id && i.fairId === f.id),
  )
  const [fairId, setFairId] = useState(() =>
    s.interactions.some(
      (i) => i.companyId === company.id && i.fairId === fair.id,
    )
      ? fair.id
      : fairs[0]?.id || fair.id,
  )
  const list = s.interactions.filter(
    (i) => i.companyId === company.id && i.fairId === fairId,
  )
  const f = s.fairs.find((x) => x.id === fairId)

  const hours = Array.from({ length: 7 }, (_, i) => 10 + i).map((h) => ({
    name: `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`,
    value: list.filter((ix) => new Date(ix.createdAt).getHours() === h).length,
  }))
  const funnel = [
    ["Shared profile", list.length],
    [
      "Reviewed",
      list.filter(
        (i) =>
          REACHED.reviewed.includes(i.status) ||
          (i.status === "rejected" && i.history.length > 1),
      ).length,
    ],
    [
      "Shortlisted",
      list.filter((i) => REACHED.shortlisted.includes(i.status)).length,
    ],
    [
      "Interview invited",
      list.filter((i) => REACHED.invited.includes(i.status)).length,
    ],
    [
      "Interviewed",
      list.filter((i) => REACHED.interviewed.includes(i.status)).length,
    ],
  ]
  const counts = {}
  list.forEach((ix) =>
    s.students
      .find((st) => st.id === ix.studentId)
      .skills.forEach((k) => (counts[k] = (counts[k] || 0) + 1)),
  )
  const skills = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }))
  const buckets = [
    ["<50", 0, 50],
    ["50–59", 50, 60],
    ["60–69", 60, 70],
    ["70–79", 70, 80],
    ["80+", 80, 101],
  ].map(([name, lo, hi]) => ({
    name,
    value: list.filter((i) => i.score >= lo && i.score < hi).length,
    hi,
  }))
  const avg = list.length
    ? Math.round(list.reduce((a, i) => a + i.score, 0) / list.length)
    : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="How your stall performed. All figures are for your company only."
        actions={
          fairs.length > 1 && (
            <Select
              value={fairId}
              onChange={(e) => setFairId(e.target.value)}
              className="w-auto"
              aria-label="Fair"
            >
              {fairs.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </Select>
          )
        }
      />
      {list.length === 0 ? (
        <Card>
          <EmptyState
            icon={ChartColumn}
            title="No data yet"
            body={`Analytics appear once students share at your stall during ${f.name}.`}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Visitors" value={list.length} icon={Users} />
            <StatCard
              label="Avg match"
              value={`${avg}%`}
              icon={Gauge}
              tone="ai"
            />
            <StatCard
              label="Shortlist rate"
              value={`${Math.round((funnel[2][1] / list.length) * 100)}%`}
              icon={Star}
              tone="success"
            />
            <StatCard
              label="Interviewed"
              value={funnel[4][1]}
              icon={CalendarCheck}
              tone="warning"
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader title="Scans over the day" description={f.name} />
              <div className="h-64 p-4">
                <ResponsiveContainer>
                  <AreaChart
                    data={hours}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={CHART.brand}
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="100%"
                          stopColor={CHART.brand}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={CHART.grid} />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis allowDecimals={false} {...axisProps} />
                    <Tooltip
                      {...tooltipProps}
                      cursor={{ stroke: CHART.grid }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Scans"
                      stroke={CHART.brand}
                      strokeWidth={2.5}
                      fill="url(#scanFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader
                title="Funnel"
                description="Candidates reaching each stage"
              />
              <ul className="space-y-3.5 p-5">
                {funnel.map(([label, v], i) => (
                  <li key={label}>
                    <div className="mb-1 flex justify-between text-[13px]">
                      <span className="font-medium text-ink-700">{label}</span>
                      <span className="font-semibold text-ink-900 tabular">
                        {v}{" "}
                        <span className="font-normal text-ink-400">
                          · {Math.round((v / list.length) * 100)}%
                        </span>
                      </span>
                    </div>
                    <ProgressBar
                      value={(v / list.length) * 100}
                      tone={i === 0 ? "brand" : i < 3 ? "light" : "ai"}
                    />
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardHeader title="Top visitor skills" />
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
                      width={110}
                      {...axisProps}
                    />
                    <Tooltip {...tooltipProps} />
                    <Bar
                      dataKey="value"
                      name="Visitors"
                      fill={CHART.brand}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Match score distribution" />
              <div className="h-72 p-4">
                <ResponsiveContainer>
                  <BarChart
                    data={buckets}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke={CHART.grid} />
                    <XAxis dataKey="name" {...axisProps} />
                    <YAxis allowDecimals={false} {...axisProps} />
                    <Tooltip {...tooltipProps} />
                    <Bar
                      dataKey="value"
                      name="Visitors"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                    >
                      {buckets.map((b) => (
                        <Cell
                          key={b.name}
                          fill={
                            b.hi > 80
                              ? CHART.success
                              : b.hi > 60
                                ? CHART.warning
                                : CHART.ink
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

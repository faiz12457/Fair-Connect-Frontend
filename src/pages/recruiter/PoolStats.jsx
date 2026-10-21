import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"
import { Users, BadgeCheck, Target, ShieldCheck } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  Callout,
} from "@/components/ui"
import { bestJobMatch } from "@/lib/match"
import {
  useRecruiter,
  CGPA_BANDS,
  CHART,
  axisProps,
  tooltipProps,
} from "./common"

/** R07 — aggregate view of the registered student pool. Never lists individuals. */
export default function PoolStats() {
  const { s, fair, jobs } = useRecruiter()
  const pool = s.students.filter(
    (st) =>
      st.verification === "verified" &&
      !st.privacy.hiddenFairs.includes(fair.id),
  )
  const active = jobs.filter((j) => j.status === "active")
  const depts = ["BSCS", "BSSE", "BSAI", "BSIT", "BSDS"].map((d) => ({
    name: d,
    value: pool.filter((st) => st.department === d).length,
  }))
  const skillCounts = {}
  pool.forEach((st) =>
    st.skills.forEach((k) => (skillCounts[k] = (skillCounts[k] || 0) + 1)),
  )
  const required = new Set(active.flatMap((j) => j.skills))
  const skills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name, value]) => ({ name, value, mine: required.has(name) }))
  const disclosed = pool.filter((st) => st.privacy.showCgpa)
  const bands = CGPA_BANDS.map(([name, lo, hi]) => ({
    name,
    value: disclosed.filter((st) => st.cgpa >= lo && st.cgpa < hi).length,
  }))
  const fit = active.length
    ? pool.filter((st) => bestJobMatch(st, active, fair.weights).score >= 70)
        .length
    : 0

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pool stats"
        description={`Who is registered for ${fair.name}, in aggregate. Plan which roles and skills to highlight at your stall.`}
      />
      <Callout
        tone="brand"
        icon={ShieldCheck}
        title="Aggregates only — no candidate lists"
      >
        Individual students only become visible to you after they scan your
        stall QR and choose to share their profile.
      </Callout>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Verified students" value={pool.length} icon={Users} />
        <StatCard
          label="Departments"
          value={depts.filter((d) => d.value).length}
          icon={BadgeCheck}
          tone="success"
        />
        <StatCard
          label="Likely fits (70+)"
          value={fit}
          icon={Target}
          tone="ai"
          hint="For your active roles"
        />
        <StatCard
          label="CGPA disclosed"
          value={`${
            pool.length ? Math.round((disclosed.length / pool.length) * 100) : 0
          }%`}
          icon={ShieldCheck}
          tone="warning"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="By department" />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <BarChart
                data={depts}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar
                  dataKey="value"
                  name="Students"
                  fill={CHART.brand}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="CGPA bands"
            description="Only students who chose to show their CGPA are counted."
          />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <BarChart
                data={bands}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipProps} />
                <Bar
                  dataKey="value"
                  name="Students"
                  fill={CHART.ai}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader
            title="Most common skills"
            description="Blue bars are skills your active roles ask for."
          />
          <div className="h-80 p-4">
            <ResponsiveContainer>
              <BarChart
                data={skills}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 24, bottom: 0 }}
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
                  name="Students"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                >
                  {skills.map((d) => (
                    <Cell
                      key={d.name}
                      fill={d.mine ? CHART.brand : CHART.brandLight}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

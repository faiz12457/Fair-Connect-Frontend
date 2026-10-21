import { useState } from "react"
import { Download, FileText, Printer } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Select,
  Table,
  th,
  td,
  Logo,
} from "@/components/ui"
import { toast } from "@/store/store"
import { downloadCSV } from "@/lib/csv"
import { fmtDate, cx } from "@/lib/format"
import { useAdmin } from "./common"

const SHORT = [
  "shortlisted",
  "interview_invited",
  "interview_scheduled",
  "interview_completed",
]

export default function Reports() {
  const { s } = useAdmin()
  const [fairId, setFairId] = useState(
    () => (s.fairs.find((f) => f.status === "ended") || s.fairs[0]).id,
  )
  const fair = s.fairs.find((f) => f.id === fairId)
  const rows = s.stalls
    .filter((st) => st.fairId === fairId && st.companyId)
    .map((st) => {
      const c = s.companies.find((x) => x.id === st.companyId)
      const ixs = s.interactions.filter(
        (i) => i.fairId === fairId && i.companyId === c.id,
      )
      return {
        Company: c.name,
        Industry: c.industry,
        Stall: st.number,
        "Profiles received": ixs.length,
        Shortlisted: ixs.filter((i) => SHORT.includes(i.status)).length,
        Interviews: s.interviews.filter(
          (iv) =>
            iv.fairId === fairId &&
            iv.companyId === c.id &&
            iv.status !== "declined",
        ).length,
      }
    })
    .sort((a, b) => b["Profiles received"] - a["Profiles received"])
  const t = fair.totals
  const summary = [
    [
      "Students attended",
      t?.students ?? s.checkins.filter((c) => c.fairId === fairId).length,
    ],
    ["Participating employers", t?.companies ?? rows.length],
    [
      "Profiles shared",
      t?.interactions ?? rows.reduce((a, r) => a + r["Profiles received"], 0),
    ],
    [
      "Shortlisted",
      t?.shortlisted ?? rows.reduce((a, r) => a + r.Shortlisted, 0),
    ],
    [
      "Interviews conducted",
      t?.interviews ?? rows.reduce((a, r) => a + r.Interviews, 0),
    ],
  ]
  const exportCsv = () => {
    downloadCSV(`${fair.name.replace(/\W+/g, "-")}-employer-report.csv`, rows)
    toast({ title: "Report exported", tone: "success", duration: 2500 })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="An HEC-style employability summary, ready to share with leadership. Contains aggregates only."
        actions={
          <>
            <Select
              value={fairId}
              onChange={(e) => setFairId(e.target.value)}
              className="w-auto"
              aria-label="Fair"
            >
              {s.fairs.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button icon={Download} onClick={exportCsv}>
              Export CSV
            </Button>
          </>
        }
      />
      <Card className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <div className="eyebrow mb-1">{s.university.careerOffice}</div>
            <h2 className="text-xl font-bold">
              {fair.name} — Industry Engagement Report
            </h2>
            <p className="mt-1 text-[13px] text-ink-400">
              {s.university.name} · {fair.venue} ·{" "}
              {fmtDate(fair.date, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Logo size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
          {summary.map(([k, v]) => (
            <div key={k} className="bg-white p-4">
              <div className="text-[11px] font-semibold tracking-wide text-ink-400 uppercase">
                {k}
              </div>
              <div className="mt-1 text-2xl font-bold text-ink-900 tabular">
                {Number(v).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <CardHeader
          title="Employer participation"
          description={
            t
              ? "Per-employer rows use the sample data in this demo."
              : undefined
          }
          className="pb-3"
        />
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-ink-400">
            <FileText className="size-6" />
            No employer activity recorded for this fair yet.
          </div>
        ) : (
          <Table>
            <thead className="border-y border-line bg-surface-muted/60">
              <tr>
                {[
                  "Company",
                  "Stall",
                  "Profiles",
                  "Shortlisted",
                  "Interviews",
                ].map((h, i) => (
                  <th key={h} className={cx(th, i > 0 && "text-right")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.Company}>
                  <td className={td}>
                    <div className="font-semibold text-ink-900">
                      {r.Company}
                    </div>
                    <div className="text-xs text-ink-400">{r.Industry}</div>
                  </td>
                  <td className={cx(td, "text-right tabular")}>{r.Stall}</td>
                  <td className={cx(td, "text-right tabular")}>
                    {r["Profiles received"]}
                  </td>
                  <td className={cx(td, "text-right tabular")}>
                    {r.Shortlisted}
                  </td>
                  <td className={cx(td, "text-right tabular")}>
                    {r.Interviews}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <p className="border-t border-line px-6 py-4 text-xs text-ink-400">
          Prepared by FairConnect for {s.university.short}. No student personal
          data is included in this report.
        </p>
      </Card>
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Download,
  Star,
  SkipForward,
  Search,
  Inbox,
  EyeOff,
} from "lucide-react"
import {
  PageHeader,
  Card,
  Tabs,
  Table,
  th,
  td,
  Avatar,
  MatchPill,
  StatusPill,
  Button,
  Input,
  Select,
  EmptyState,
  Checkbox,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { downloadCSV } from "@/lib/csv"
import { STATUS, statusLabel, fmtDateTime, cx } from "@/lib/format"
import { useRecruiter } from "./common"

export default function Pipeline() {
  const { s, company, fair } = useRecruiter()
  const navigate = useNavigate()
  const fairs = s.fairs.filter(
    (f) =>
      s.interactions.some(
        (i) => i.companyId === company.id && i.fairId === f.id,
      ) || f.id === fair.id,
  )
  const [fairId, setFairId] = useState(fair.id)
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")
  const [sel, setSel] = useState([])

  const all = s.interactions
    .filter((i) => i.companyId === company.id && i.fairId === fairId)
    .map((ix) => ({
      ix,
      student: s.students.find((st) => st.id === ix.studentId),
      job: s.jobs.find((j) => j.id === ix.jobId),
    }))
    .sort((a, b) => b.ix.score - a.ix.score)
  const rows = all.filter(
    (r) =>
      (tab === "all" || r.ix.status === tab) &&
      (!q || r.student.name.toLowerCase().includes(q.toLowerCase())),
  )
  const tabs = [
    { id: "all", label: "All", count: all.length },
    ...Object.keys(STATUS).map((k) => ({
      id: k,
      label: statusLabel(k),
      count: all.filter((r) => r.ix.status === k).length,
    })),
  ]
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r.ix.id))

  const bulk = (status, label) => {
    const ids = sel.filter((id) =>
      all.find((r) => r.ix.id === id && !r.ix.status.startsWith("interview")),
    )
    actions.bulkStatus(ids, status)
    toast({
      title: `${ids.length} candidate${ids.length === 1 ? "" : "s"} ${label}`,
      description:
        ids.length < sel.length
          ? "Candidates already in interviews were left unchanged."
          : undefined,
      tone: "success",
    })
    setSel([])
  }
  const exportCsv = () => {
    if (!rows.length)
      return toast({ title: "Nothing to export", tone: "warning" })
    downloadCSV(
      `${company.name.replace(/\W+/g, "-")}-${fairId}-pipeline.csv`,
      rows.map(({ ix, student, job }) => ({
        Name: student.name,
        Department: student.department,
        Batch: student.batch,
        CGPA: student.privacy.showCgpa ? student.cgpa.toFixed(2) : "Hidden",
        Role: job?.title || "",
        "Match %": ix.score,
        "Matched skills": ix.matchedSkills.join("; "),
        Status: statusLabel(ix.status),
        "Shared at": fmtDateTime(ix.createdAt),
        Notes: ix.notes.map((n) => n.text).join(" | "),
      })),
    )
    toast({
      title: `Exported ${rows.length} rows`,
      tone: "success",
      duration: 2500,
    })
  }

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Every student who shared with your stall, by status."
        actions={
          <Button variant="secondary" icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center gap-2 p-4 pb-0">
          <div className="min-w-[200px] flex-1">
            <Input
              icon={Search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name"
              aria-label="Search"
            />
          </div>
          {fairs.length > 1 && (
            <Select
              value={fairId}
              onChange={(e) => (setFairId(e.target.value), setSel([]))}
              className="w-auto"
              aria-label="Fair"
            >
              {fairs.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <Tabs
          tabs={tabs}
          value={tab}
          onChange={(t) => (setTab(t), setSel([]))}
          className="mt-3 px-3"
        />
        {sel.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-50/60 px-4 py-2.5">
            <span className="mr-2 text-[13px] font-semibold text-brand-700">
              {sel.length} selected
            </span>
            <Button
              size="sm"
              variant="success"
              icon={Star}
              onClick={() => bulk("shortlisted", "shortlisted")}
            >
              Shortlist
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={SkipForward}
              onClick={() => bulk("rejected", "skipped")}
            >
              Skip
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSel([])}>
              Clear
            </Button>
          </div>
        )}
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              all.length ? "No candidates in this view" : "No candidates yet"
            }
            body={
              all.length
                ? "Try another status tab or clear the search."
                : "Students appear here after they scan your stall QR and share."
            }
          />
        ) : (
          <Table>
            <thead className="border-b border-line">
              <tr>
                <th className={cx(th, "w-10")}>
                  <Checkbox
                    checked={allSel}
                    onChange={(v) => setSel(v ? rows.map((r) => r.ix.id) : [])}
                  />
                </th>
                <th className={th}>Candidate</th>
                <th className={cx(th, "hidden md:table-cell")}>
                  Best-fit role
                </th>
                <th className={th}>Match</th>
                <th className={th}>Status</th>
                <th className={cx(th, "hidden lg:table-cell")}>Shared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ ix, student, job }) => (
                <tr
                  key={ix.id}
                  onClick={() => navigate(`/recruiter/candidates/${ix.id}`)}
                  className={cx(
                    "cursor-pointer hover:bg-surface-muted",
                    sel.includes(ix.id) && "bg-brand-50/40",
                  )}
                >
                  <td className={td} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={sel.includes(ix.id)}
                      onChange={(v) =>
                        setSel(
                          v ? [...sel, ix.id] : sel.filter((x) => x !== ix.id),
                        )
                      }
                    />
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={student.name}
                        tint={student.tint}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink-900">
                          {student.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-ink-400">
                          {student.department} ·{" "}
                          {student.privacy.showCgpa ? (
                            student.cgpa.toFixed(2)
                          ) : (
                            <>
                              <EyeOff className="size-3" /> hidden
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={cx(td, "hidden text-ink-700 md:table-cell")}>
                    {job?.title || "—"}
                  </td>
                  <td className={td}>
                    <MatchPill score={ix.score} size="sm" hideLabel />
                  </td>
                  <td className={td}>
                    <StatusPill status={ix.status} />
                  </td>
                  <td
                    className={cx(
                      td,
                      "hidden whitespace-nowrap text-ink-400 lg:table-cell",
                    )}
                  >
                    {fmtDateTime(ix.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}

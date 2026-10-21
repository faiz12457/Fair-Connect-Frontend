import { useState } from "react"
import {
  Upload,
  ShieldCheck,
  Flag,
  Search,
  FileSpreadsheet,
  CircleCheck,
  Users,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Tabs,
  Table,
  th,
  td,
  Avatar,
  Badge,
  Button,
  Input,
  EmptyState,
  Modal,
  Field,
  Textarea,
  Callout,
  StatCard,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { cx } from "@/lib/format"
import { useAdmin } from "./common"

const TONE = { verified: "success", pending: "warning", flagged: "danger" }

export default function Students() {
  const { s } = useAdmin()
  const [tab, setTab] = useState("queue")
  const [q, setQ] = useState("")
  const [uploaded, setUploaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [flagging, setFlagging] = useState(null)
  const [note, setNote] = useState("")
  const reg = (st) => s.registrar.find((r) => r.rollNo === st.rollNo)
  const queue = s.students.filter((st) => st.verification !== "verified")
  const base =
    tab === "queue"
      ? queue
      : tab === "all"
        ? s.students
        : s.students.filter((st) => st.verification === tab)
  const rows = base.filter(
    (st) =>
      !q || `${st.name} ${st.rollNo}`.toLowerCase().includes(q.toLowerCase()),
  )
  const pending = s.students.filter(
    (st) => st.verification === "pending",
  ).length

  const upload = () => {
    setBusy(true)
    setTimeout(
      () => (
        setBusy(false),
        setUploaded(true),
        toast({
          title: `Registrar file loaded`,
          description: `${s.registrar.length} academic records ready to match.`,
          tone: "success",
        })
      ),
      700,
    )
  }
  const match = () => {
    const res = actions.runRegistrarMatch()
    toast({
      title: "Matching complete",
      description: `${res.verified} verified, ${res.flagged} flagged for review.`,
      tone: res.flagged ? "warning" : "success",
    })
  }
  const flag = () => {
    if (note.trim().length < 5)
      return toast({ title: "Add a note for the student", tone: "warning" })
    actions.flagStudent(flagging.id, note.trim())
    toast({ title: `${flagging.name} flagged`, tone: "info" })
    setFlagging(null)
    setNote("")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Student verification"
        description="Match student profiles against registrar records so recruiters can trust verified CGPA and department."
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Verified"
          value={
            s.students.filter((st) => st.verification === "verified").length
          }
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard label="Pending" value={pending} icon={Users} tone="warning" />
        <StatCard
          label="Flagged"
          value={
            s.students.filter((st) => st.verification === "flagged").length
          }
          icon={Flag}
          tone="danger"
        />
      </div>

      <Card>
        <CardHeader
          title="Registrar records"
          description="Upload the latest export from the Registrar, then auto-match pending students."
        />
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div
            className={cx(
              "flex flex-1 items-center gap-3 rounded-xl border border-dashed p-4",
              uploaded
                ? "border-success-600/40 bg-success-50"
                : "border-ink-300",
            )}
          >
            <FileSpreadsheet
              className={cx(
                "size-8",
                uploaded ? "text-success-600" : "text-ink-400",
              )}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-900">
                {uploaded ? "registrar_export_fall.csv" : "No file uploaded"}
              </div>
              <div className="text-xs text-ink-400">
                {uploaded
                  ? `${s.registrar.length} records · roll no, name, department, CGPA`
                  : "CSV with roll no, name, department and CGPA"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={Upload}
              loading={busy}
              onClick={upload}
            >
              {uploaded ? "Replace" : "Upload CSV"}
            </Button>
            <Button
              icon={CircleCheck}
              disabled={!uploaded || !pending}
              onClick={match}
            >
              Run match ({pending})
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 pb-0">
          <Input
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or roll number"
            aria-label="Search students"
          />
        </div>
        <Tabs
          className="mt-3 px-3"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "queue", label: "Needs review", count: queue.length },
            {
              id: "flagged",
              label: "Flagged",
              count: s.students.filter((st) => st.verification === "flagged")
                .length,
            },
            { id: "verified", label: "Verified" },
            { id: "all", label: "All", count: s.students.length },
          ]}
        />
        {rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={
              tab === "queue" ? "Everyone is verified" : "No students here"
            }
          />
        ) : (
          <Table>
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Student</th>
                <th className={cx(th, "hidden md:table-cell")}>Profile</th>
                <th className={cx(th, "hidden md:table-cell")}>Registrar</th>
                <th className={th}>Status</th>
                <th className={cx(th, "text-right")}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.slice(0, 60).map((st) => {
                const r = reg(st)
                const mismatch =
                  r &&
                  (Math.abs(r.cgpa - st.cgpa) >= 0.02 ||
                    r.department !== st.department)
                return (
                  <tr key={st.id} className="align-top">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Avatar name={st.name} tint={st.tint} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">
                            {st.name}
                          </div>
                          <div className="text-xs text-ink-400">
                            {st.rollNo}
                          </div>
                        </div>
                      </div>
                      {st.verificationNote && (
                        <div className="mt-1.5 text-xs text-danger-600">
                          {st.verificationNote}
                        </div>
                      )}
                    </td>
                    <td
                      className={cx(
                        td,
                        "hidden text-ink-700 tabular md:table-cell",
                      )}
                    >
                      {st.department} · {st.cgpa.toFixed(2)}
                    </td>
                    <td
                      className={cx(
                        td,
                        "hidden tabular md:table-cell",
                        mismatch
                          ? "font-semibold text-danger-600"
                          : "text-ink-700",
                      )}
                    >
                      {r ? `${r.department} · ${r.cgpa.toFixed(2)}` : "—"}
                    </td>
                    <td className={td}>
                      <Badge tone={TONE[st.verification]} dot>
                        {st.verification[0].toUpperCase() +
                          st.verification.slice(1)}
                      </Badge>
                    </td>
                    <td className={cx(td, "text-right")}>
                      {st.verification !== "verified" ? (
                        <div className="flex justify-end gap-1.5">
                          {st.verification !== "flagged" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={Flag}
                              onClick={() => setFlagging(st)}
                            >
                              Flag
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="success"
                            icon={ShieldCheck}
                            onClick={() => (
                              actions.verifyStudent(st.id),
                              toast({
                                title: `${st.name} verified`,
                                tone: "success",
                                duration: 2000,
                              })
                            )}
                          >
                            Verify
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Flag}
                          onClick={() => setFlagging(st)}
                        >
                          Flag
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
        {rows.length > 60 && (
          <div className="border-t border-line px-5 py-3 text-center text-xs text-ink-400">
            Showing 60 of {rows.length}. Search to narrow down.
          </div>
        )}
      </Card>

      <Modal
        open={!!flagging}
        onClose={() => setFlagging(null)}
        title={`Flag ${flagging?.name || ""}`}
        description="The student sees this note and can correct their profile."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFlagging(null)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Flag} onClick={flag}>
              Flag student
            </Button>
          </>
        }
      >
        <Field label="Note to student" required>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. CGPA on profile differs from registrar record."
          />
        </Field>
        <Callout tone="brand" className="mt-4">
          Flagged students stay visible to recruiters but are not marked as
          verified.
        </Callout>
      </Modal>
    </div>
  )
}

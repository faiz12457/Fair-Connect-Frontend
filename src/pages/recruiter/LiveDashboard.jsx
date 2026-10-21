import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { motion, AnimatePresence } from "motion/react"
import {
  Search,
  Users,
  Gauge,
  Star,
  CalendarClock,
  Lock,
  QrCode,
  Radio,
  BadgeCheck,
  EyeOff,
  Flag,
  Briefcase,
  ChevronRight,
  ScanLine,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  StatCard,
  Input,
  Select,
  Avatar,
  MatchPill,
  StatusPill,
  EmptyState,
  Drawer,
  Button,
  LiveIndicator,
  Callout,
  DecisionSupportNote,
  Checkbox,
  IconTile,
} from "@/components/ui"
import { onStoreEvent, toast } from "@/store/store"
import { timeAgo, fmtDate, daysUntil, cx } from "@/lib/format"
import { norm } from "@/lib/match"
import { useRecruiter, useTick } from "./common"
import CandidatePanel from "./CandidatePanel"

function Locked({ fair, stall, jobs }) {
  const days = daysUntil(fair.date)
  const ready = [
    [
      "Post at least one job",
      jobs.some((j) => j.status === "active"),
      "/recruiter/jobs",
    ],
    ["Stall assigned", !!stall, "/recruiter/qr"],
    ["Stall QR printed", stall?.qr.status === "active", "/recruiter/qr"],
  ]
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Live dashboard"
        title="Opens when the fair goes live"
        description="Students who scan your stall QR and confirm “Share My Profile” will appear here in real time, ranked by AI match score."
      />
      <section className="relative overflow-hidden rounded-[20px] bg-navy-950 p-6 text-white sm:p-8">
        <div className="absolute -top-20 -right-10 size-64 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-navy-800">
            <Lock className="size-7" strokeWidth={1.75} />
          </span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
              {fair.name}
            </div>
            <div className="mt-1 text-2xl font-bold">
              {days > 0
                ? `Starts in ${days} day${days === 1 ? "" : "s"}`
                : "Starts today"}
            </div>
            <div className="mt-1 text-sm text-white/70">
              {fmtDate(fair.date, { weekday: "long" })} · {fair.startTime}–
              {fair.endTime} ·{" "}
              {stall ? `Your stall: ${stall.number}` : "Stall not assigned yet"}
            </div>
          </div>
          <LiveIndicator status={fair.status} />
        </div>
      </section>
      <Card>
        <CardHeader title="Be ready for the first scan" />
        <ul className="p-3">
          {ready.map(([label, ok, to]) => (
            <li key={label}>
              <Button
                variant="ghost"
                to={to}
                className="h-auto w-full justify-start gap-3 px-3 py-3 text-left font-medium"
              >
                <span
                  className={cx(
                    "size-2.5 rounded-full",
                    ok ? "bg-success-600" : "bg-ink-300",
                  )}
                />
                <span className="flex-1 text-ink-900">{label}</span>
                <span
                  className={cx(
                    "text-xs font-semibold",
                    ok ? "text-success-700" : "text-ink-400",
                  )}
                >
                  {ok ? "Done" : "To do"}
                </span>
                <ChevronRight className="size-4 text-ink-300" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Heatmap({ rows, jobs }) {
  const required = [
    ...new Set(
      jobs.filter((j) => j.status === "active").flatMap((j) => j.skills),
    ),
  ].slice(0, 15)
  if (!required.length) return null
  return (
    <Card>
      <CardHeader
        title="Skills coverage"
        description="Share of your visitors who list each skill your roles require."
      />
      <div className="grid grid-cols-3 gap-1.5 p-5 sm:grid-cols-5">
        {required.map((sk) => {
          const have = rows.filter((r) =>
            r.student.skills.some((x) => norm(x) === norm(sk)),
          ).length
          const pct = rows.length ? Math.round((have / rows.length) * 100) : 0
          return (
            <div
              key={sk}
              className="rounded-lg px-2.5 py-2"
              style={{
                background: `rgb(37 99 235 / ${0.06 + (pct / 100) * 0.85})`,
              }}
              title={`${have} of ${rows.length} visitors`}
            >
              <div
                className={cx(
                  "truncate text-xs font-semibold",
                  pct > 55 ? "text-white" : "text-ink-900",
                )}
              >
                {sk}
              </div>
              <div
                className={cx(
                  "text-[11px] tabular",
                  pct > 55 ? "text-white/80" : "text-ink-600",
                )}
              >
                {pct}%
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function LiveDashboard() {
  useTick()
  const { s, company, fair, stall, jobs, interactions } = useRecruiter()
  const [params, setParams] = useSearchParams()
  const openId = params.get("open")
  const [q, setQ] = useState("")
  const [role, setRole] = useState("all")
  const [dept, setDept] = useState("all")
  const [minCgpa, setMinCgpa] = useState("0")
  const [skill, setSkill] = useState("all")
  const [hideSkipped, setHideSkipped] = useState(false)

  // Highlight rows that arrive while the dashboard is open.
  const seen = useRef(null)
  if (seen.current === null)
    seen.current = new Set(interactions.map((i) => i.id))
  const [flash, setFlash] = useState(() => new Set())
  const idKey = interactions.map((i) => i.id).join()
  useEffect(() => {
    const fresh = interactions
      .filter((i) => !seen.current.has(i.id))
      .map((i) => i.id)
    if (!fresh.length) return
    fresh.forEach((id) => seen.current.add(id))
    setFlash(new Set(fresh))
    const t = setTimeout(() => setFlash(new Set()), 2400)
    return () => clearTimeout(t)
  }, [idKey])

  useEffect(
    () =>
      onStoreEvent((e, local) => {
        if (!local && e.type === "interaction" && e.companyId === company.id) {
          const st = s.students.find((x) => x.id === e.studentId)
          toast({
            title: `New visitor${st ? `: ${st.name}` : ""}`,
            description: `Stall ${stall?.number}`,
            tone: "success",
            duration: 3500,
          })
        }
      }),
    [company.id, stall?.number, s.students],
  )

  const rows = useMemo(
    () =>
      interactions
        .map((ix) => ({
          ix,
          student: s.students.find((st) => st.id === ix.studentId),
          job: s.jobs.find((j) => j.id === ix.jobId),
        }))
        .sort(
          (a, b) =>
            b.ix.score - a.ix.score ||
            a.ix.createdAt.localeCompare(b.ix.createdAt),
        ),
    [interactions, s.students, s.jobs],
  )
  const ranks = new Map(rows.map((r, i) => [r.ix.id, i + 1]))
  const visitorSkills = [
    ...new Set(rows.flatMap((r) => r.student.skills)),
  ].sort()
  const filtered = rows.filter(({ ix, student }) => {
    if (hideSkipped && ix.status === "rejected") return false
    if (role !== "all" && ix.jobId !== role) return false
    if (dept !== "all" && student.department !== dept) return false
    if (
      minCgpa !== "0" &&
      (!student.privacy.showCgpa || student.cgpa < Number(minCgpa))
    )
      return false
    if (skill !== "all" && !student.skills.includes(skill)) return false
    if (q && !student.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const feed = [...rows]
    .sort((a, b) => b.ix.createdAt.localeCompare(a.ix.createdAt))
    .slice(0, 8)
  const avg = rows.length
    ? Math.round(rows.reduce((a, r) => a + r.ix.score, 0) / rows.length)
    : 0
  const strong = rows.filter((r) => r.ix.score >= 80).length
  const shortlisted = rows.filter((r) =>
    [
      "shortlisted",
      "interview_invited",
      "interview_scheduled",
      "interview_completed",
    ].includes(r.ix.status),
  ).length
  const interviews = s.interviews.filter(
    (i) =>
      i.companyId === company.id &&
      i.fairId === fair.id &&
      i.status !== "declined",
  ).length
  const openIx =
    openId &&
    s.interactions.find((i) => i.id === openId && i.companyId === company.id)
  const close = () => {
    const p = new URLSearchParams(params)
    p.delete("open")
    setParams(p, { replace: true })
  }
  const open = (id) => setParams({ open: id })

  if (fair.status === "upcoming")
    return <Locked fair={fair} stall={stall} jobs={jobs} />

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`Stall ${stall?.number ?? "—"} · ${fair.name}`}
        title="Live candidate dashboard"
        description="Only students who scanned your stall QR and chose to share their profile appear here."
        actions={<LiveIndicator status={fair.status} />}
      />
      {fair.status === "ended" && (
        <Callout tone="brand" icon={Flag} title="The fair has ended">
          The leaderboard is frozen. You can still shortlist, invite and add
          notes — or export from the Pipeline.
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Visitors" value={rows.length} icon={Users} />
        <StatCard label="Avg match" value={`${avg}%`} icon={Gauge} tone="ai" />
        <StatCard
          label="Strong (80+)"
          value={strong}
          icon={BadgeCheck}
          tone="success"
        />
        <StatCard
          label="Shortlisted"
          value={shortlisted}
          icon={Star}
          tone="warning"
        />
        <StatCard
          label="Interviews"
          value={interviews}
          icon={CalendarClock}
          tone="navy"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {rows.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            icon={ScanLine}
            title="Waiting for your first visitor"
            body={
              stall?.qr.status === "active"
                ? `Make sure your poster is visible at Stall ${stall.number}. New visitors appear here instantly.`
                : "Your stall QR is not active yet, so students cannot share their profile."
            }
            action={
              <Button variant="secondary" icon={QrCode} to="/recruiter/qr">
                View stall QR
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-5">
            <Card>
              <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
                <div className="min-w-[200px] flex-1">
                  <Input
                    icon={Search}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search visitors"
                    aria-label="Search visitors"
                  />
                </div>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-auto"
                  aria-label="Role"
                >
                  <option value="all">All roles</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </Select>
                <Select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-auto"
                  aria-label="Department"
                >
                  <option value="all">All depts</option>
                  {["BSCS", "BSSE", "BSAI", "BSIT", "BSDS"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
                <Select
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-auto"
                  aria-label="Minimum CGPA"
                >
                  <option value="0">Any CGPA</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3.0+</option>
                  <option value="3.5">3.5+</option>
                </Select>
                <Select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-auto"
                  aria-label="Skill"
                >
                  <option value="all">Any skill</option>
                  {visitorSkills.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <span className="text-ink-400">
                  {filtered.length} of {rows.length} visitors · ranked by match
                </span>
                <Checkbox
                  checked={hideSkipped}
                  onChange={setHideSkipped}
                  label="Hide skipped"
                />
              </div>
              {minCgpa !== "0" && (
                <p className="px-4 pb-2 text-xs text-ink-400">
                  Students who hid their CGPA are excluded by a CGPA filter.
                </p>
              )}
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No visitors match these filters"
                  body="Try widening the role, department or CGPA filter."
                />
              ) : (
                <ul className="divide-y divide-line border-t border-line">
                  <AnimatePresence initial={false}>
                    {filtered.map(({ ix, student, job }) => (
                      <motion.li
                        key={ix.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <button
                          onClick={() => open(ix.id)}
                          className={cx(
                            "grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted sm:grid-cols-[32px_minmax(0,1.4fr)_minmax(0,1fr)_76px_auto]",
                            flash.has(ix.id) && "animate-highlight",
                            ix.status === "rejected" && "opacity-55",
                            openIx?.id === ix.id && "bg-brand-50/60",
                          )}
                        >
                          <span
                            className={cx(
                              "grid size-8 place-items-center rounded-lg text-xs font-bold tabular",
                              ranks.get(ix.id) <= 3
                                ? "bg-navy-950 text-white"
                                : "bg-surface-muted text-ink-600",
                            )}
                          >
                            {ranks.get(ix.id)}
                          </span>
                          <span className="flex min-w-0 items-center gap-3">
                            <Avatar
                              name={student.name}
                              tint={student.tint}
                              size="sm"
                            />
                            <span className="min-w-0">
                              <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink-900">
                                {student.name}
                                {student.verification === "verified" && (
                                  <BadgeCheck
                                    className="size-3.5 shrink-0 text-success-600"
                                    aria-label="Verified"
                                  />
                                )}
                                {ix.status === "pending" && (
                                  <span className="rounded bg-brand-600 px-1 text-[10px] font-bold text-white">
                                    NEW
                                  </span>
                                )}
                              </span>
                              <span className="block truncate text-xs text-ink-400">
                                {student.department} ·{" "}
                                {student.privacy.showCgpa ? (
                                  `CGPA ${student.cgpa.toFixed(2)}`
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <EyeOff className="size-3" />
                                    CGPA hidden
                                  </span>
                                )}{" "}
                                · {timeAgo(ix.createdAt)}
                              </span>
                            </span>
                          </span>
                          <span className="hidden min-w-0 sm:block">
                            <span className="flex items-center gap-1 truncate text-[13px] font-medium text-ink-700">
                              <Briefcase className="size-3.5 shrink-0 text-ink-400" />
                              {job?.title || "—"}
                            </span>
                            <span className="mt-1 flex gap-1 overflow-hidden">
                              {ix.matchedSkills.slice(0, 3).map((m) => (
                                <span
                                  key={m}
                                  className="shrink-0 rounded bg-success-50 px-1.5 text-[11px] font-medium text-success-700"
                                >
                                  {m}
                                </span>
                              ))}
                              {ix.matchedSkills.length > 3 && (
                                <span className="text-[11px] text-ink-400">
                                  +{ix.matchedSkills.length - 3}
                                </span>
                              )}
                            </span>
                          </span>
                          <span className="hidden sm:block">
                            <MatchPill score={ix.score} size="sm" hideLabel />
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="sm:hidden">
                              <MatchPill score={ix.score} size="sm" hideLabel />
                            </span>
                            <span className="hidden md:block">
                              <StatusPill status={ix.status} />
                            </span>
                            <ChevronRight className="size-4 text-ink-300" />
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
              <div className="border-t border-line p-4">
                <DecisionSupportNote compact />
              </div>
            </Card>
            <Heatmap rows={rows} jobs={jobs} />
          </div>

          <aside className="space-y-5">
            <Card>
              <CardHeader
                title="Live feed"
                description="Most recent scans"
                actions={
                  fair.status === "live" && (
                    <IconTile tone="success" size="sm">
                      <Radio className="size-4" strokeWidth={1.75} />
                    </IconTile>
                  )
                }
              />
              <ol
                className="p-3"
                aria-live="polite"
                aria-label="Recent visitors"
              >
                <AnimatePresence initial={false}>
                  {feed.map(({ ix, student }) => (
                    <motion.li
                      key={ix.id}
                      layout
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cx(
                        "rounded-xl",
                        flash.has(ix.id) && "animate-highlight",
                      )}
                    >
                      <button
                        onClick={() => open(ix.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-muted"
                      >
                        <Avatar
                          name={student.name}
                          tint={student.tint}
                          size="xs"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink-900">
                            {student.name}
                          </span>
                          <span className="block text-xs text-ink-400">
                            Shared {timeAgo(ix.createdAt)}
                          </span>
                        </span>
                        <MatchPill score={ix.score} size="sm" hideLabel />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            </Card>
            <Card className="p-5">
              <div className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Your stall
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-navy-950 text-lg font-bold text-white tabular">
                  {stall?.number ?? "—"}
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-ink-900">
                    Zone {stall?.zone ?? "—"}
                  </div>
                  <div className="text-ink-400">
                    QR{" "}
                    {stall?.qr.status === "active"
                      ? "active"
                      : stall?.qr.status === "revoked"
                        ? "revoked"
                        : "not generated"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  to="/recruiter/qr"
                  className="ml-auto"
                >
                  Poster
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      )}

      <Drawer
        open={!!openIx}
        onClose={close}
        label="Candidate details"
        width={560}
      >
        {openIx && (
          <CandidatePanel
            key={openIx.id}
            interactionId={openIx.id}
            onClose={close}
          />
        )}
      </Drawer>
    </div>
  )
}

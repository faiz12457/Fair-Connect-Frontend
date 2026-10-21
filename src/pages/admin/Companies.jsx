import { useState } from "react"
import { useSearchParams } from "react-router"
import {
  Building2,
  Check,
  X,
  Globe,
  MapPin,
  Users,
  Search,
  CalendarDays,
} from "lucide-react"
import {
  PageHeader,
  Card,
  Tabs,
  CompanyLogo,
  Badge,
  Button,
  Drawer,
  Field,
  Textarea,
  Input,
  EmptyState,
  Callout,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { fmtDate, timeAgo } from "@/lib/format"
import { useAdmin } from "./common"

const TONE = { pending: "warning", approved: "success", rejected: "danger" }
const REASONS = [
  "Could not verify company registration",
  "Not a hiring organisation",
  "Duplicate registration",
  "Work email domain does not match company",
]

export default function Companies() {
  const { s, fair } = useAdmin()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState("pending")
  const [q, setQ] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const openId = params.get("open")
  const open = s.companies.find((c) => c.id === openId)
  const list = s.companies.filter(
    (c) =>
      (tab === "all" || c.status === tab) &&
      (!q || c.name.toLowerCase().includes(q.toLowerCase())),
  )
  const count = (st) => s.companies.filter((c) => c.status === st).length
  const close = () => (setParams({}), setRejecting(false), setReason(""))

  const approve = (c) => {
    actions.approveCompany(c.id)
    toast({
      title: `${c.name} approved`,
      description: "Their recruiters can now set up the stall.",
      tone: "success",
    })
    close()
  }
  const reject = (c) => {
    if (reason.trim().length < 5)
      return toast({ title: "Add a short reason", tone: "warning" })
    actions.rejectCompany(c.id, reason.trim())
    toast({ title: `${c.name} rejected`, tone: "info" })
    close()
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Approve employers before they can build a stall or see any students."
      />
      <Card>
        <div className="p-4 pb-0">
          <Input
            icon={Search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies"
            aria-label="Search companies"
          />
        </div>
        <Tabs
          className="mt-3 px-3"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "pending", label: "Pending", count: count("pending") },
            { id: "approved", label: "Approved", count: count("approved") },
            { id: "rejected", label: "Rejected", count: count("rejected") },
            { id: "all", label: "All", count: s.companies.length },
          ]}
        />
        {list.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={
              tab === "pending" ? "No companies waiting" : "No companies here"
            }
            body={
              tab === "pending"
                ? "New employer registrations will appear here for review."
                : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-line p-2">
            {list.map((c) => {
              const recruiters = s.users.filter((u) => u.companyId === c.id)
              const stall = s.stalls.find(
                (st) => st.fairId === fair.id && st.companyId === c.id,
              )
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setParams({ open: c.id })}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface-muted"
                  >
                    <CompanyLogo company={c} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink-900">
                        {c.name}
                      </div>
                      <div className="truncate text-xs text-ink-400">
                        {c.industry} · {c.city} · {recruiters.length} recruiter
                        {recruiters.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    {stall && (
                      <span className="hidden text-xs text-ink-400 sm:inline">
                        Stall {stall.number}
                      </span>
                    )}
                    <span className="hidden text-xs text-ink-400 md:inline">
                      {timeAgo(c.submittedAt)}
                    </span>
                    <Badge tone={TONE[c.status]} dot>
                      {c.status[0].toUpperCase() + c.status.slice(1)}
                    </Badge>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Drawer open={!!open} onClose={close} label="Company details">
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="flex items-center gap-4">
                <CompanyLogo company={open} size="lg" />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold">{open.name}</h2>
                  <Badge tone={TONE[open.status]} dot>
                    {open.status[0].toUpperCase() + open.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  [Building2, "Industry", open.industry],
                  [MapPin, "City", open.city],
                  [Users, "Size", open.size],
                  [Globe, "Website", open.website],
                  [CalendarDays, "Submitted", fmtDate(open.submittedAt)],
                ].map(([I, k, v]) => (
                  <div key={k}>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                      <I className="size-3.5" />
                      {k}
                    </dt>
                    <dd className="mt-1 text-ink-900">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  About
                </h3>
                <p className="text-sm text-ink-700">
                  {open.about || "No description provided."}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  Registered recruiters
                </h3>
                <ul className="space-y-2">
                  {s.users
                    .filter((u) => u.companyId === open.id)
                    .map((u) => {
                      const domainOk = u.email
                        .toLowerCase()
                        .endsWith(`@${open.website}`)
                      return (
                        <li
                          key={u.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2.5 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-ink-900">
                              {u.name}
                            </div>
                            <div className="truncate text-xs text-ink-400">
                              {u.email}
                            </div>
                          </div>
                          <Badge tone={domainOk ? "success" : "warning"}>
                            {domainOk ? "Domain matches" : "Check domain"}
                          </Badge>
                        </li>
                      )
                    })}
                </ul>
              </div>
              {open.status === "rejected" && open.rejectReason && (
                <Callout tone="danger" title="Rejection reason">
                  {open.rejectReason}
                </Callout>
              )}
              {rejecting && (
                <div className="space-y-3 rounded-xl border border-line p-4">
                  <Field label="Reason (shared with the company)" required>
                    <Textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain what is missing or why this registration was declined."
                    />
                  </Field>
                  <div className="flex flex-wrap gap-1.5">
                    {REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-line"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {open.status !== "approved" && (
              <div className="flex justify-end gap-2 border-t border-line p-4">
                {rejecting ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setRejecting(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      icon={X}
                      onClick={() => reject(open)}
                    >
                      Reject company
                    </Button>
                  </>
                ) : (
                  <>
                    {open.status === "pending" && (
                      <Button
                        variant="danger-outline"
                        icon={X}
                        onClick={() => setRejecting(true)}
                      >
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="success"
                      icon={Check}
                      onClick={() => approve(open)}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

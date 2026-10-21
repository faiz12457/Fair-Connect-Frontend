import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { LayoutGrid, QrCode, Ban, RefreshCw, X } from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  Select,
  Field,
  Badge,
  CompanyLogo,
  ConfirmDialog,
  Callout,
  EmptyState,
  Drawer,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { stallUrl } from "@/lib/qr"
import { fmtDateTime, cx } from "@/lib/format"
import ErrorPage from "@/pages/public/ErrorPage"
import { useFairParam } from "./common"

const ZONES = {
  A: "Zone A · Entrance",
  B: "Zone B · Centre",
  C: "Zone C · Back wall",
}

export default function Stalls() {
  const { s, fair, missing } = useFairParam()
  const [selId, setSelId] = useState(null)
  const [pick, setPick] = useState("")
  const [confirm, setConfirm] = useState(null)
  if (missing) return <ErrorPage />

  const stalls = s.stalls
    .filter((st) => st.fairId === fair.id)
    .sort((a, b) => a.number - b.number)
  const sel = stalls.find((st) => st.id === selId)
  const company = (id) => s.companies.find((c) => c.id === id)
  const approved = s.companies.filter((c) => c.status === "approved")
  const unassigned = approved.filter(
    (c) => !stalls.some((st) => st.companyId === c.id),
  )
  const readOnly = fair.status === "archived"
  const requests = s.notifications.filter(
    (n) =>
      n.to === "admin" &&
      n.link === `/admin/fairs/${fair.id}/stalls` &&
      !n.read,
  )

  const open = (st) => (setSelId(st.id), setPick(st.companyId || ""))
  const doAssign = () => {
    const res = actions.assignStall(fair.id, sel.number, pick || null)
    toast({
      title: pick
        ? `${company(pick).name} → Stall ${sel.number}`
        : `Stall ${sel.number} cleared`,
      description: res?.movedFrom
        ? `Moved from stall ${res.movedFrom}; its QR was cleared.`
        : pick
          ? "Generate a QR when ready."
          : undefined,
      tone: "success",
    })
  }
  const assign = () => {
    if (pick === (sel.companyId || "")) return
    const elsewhere =
      pick && stalls.find((st) => st.companyId === pick && st.id !== sel.id)
    if (elsewhere || (sel.companyId && sel.qr.status === "active"))
      setConfirm({ kind: "assign", elsewhere })
    else doAssign()
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ to: `/admin/fairs/${fair.id}`, label: fair.name }}
        title="Stalls & QR"
        description="Assign each approved company to a stall, then generate its unique QR poster."
      />
      {requests.length > 0 && (
        <Callout
          tone="warning"
          title={`${requests.length} QR request${
            requests.length === 1 ? "" : "s"
          }`}
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                requests.forEach((n) => actions.markRead("admin", n.id))
              }
            >
              Dismiss
            </Button>
          }
        >
          {requests.map((n) => n.title).join(" · ")}
        </Callout>
      )}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            title="Floor plan"
            description={`${stalls.filter((st) => st.companyId).length} of ${stalls.length} assigned · ${stalls.filter((st) => st.qr.status === "active").length} QR active`}
            actions={
              <div className="hidden gap-3 text-xs text-ink-400 sm:flex">
                <Legend cls="bg-success-600" label="QR active" />
                <Legend cls="bg-warning-600" label="Needs QR" />
                <Legend cls="bg-danger-600" label="Revoked" />
              </div>
            }
          />
          <div className="space-y-5 p-5">
            {Object.entries(ZONES).map(([z, label]) => (
              <div key={z}>
                <div className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  {label}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                  {stalls
                    .filter((st) => st.zone === z)
                    .map((st) => {
                      const c = company(st.companyId)
                      const dot = !c
                        ? null
                        : st.qr.status === "active"
                          ? "bg-success-600"
                          : st.qr.status === "revoked"
                            ? "bg-danger-600"
                            : "bg-warning-600"
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => open(st)}
                          className={cx(
                            "relative flex aspect-[4/3] flex-col items-start justify-between rounded-xl border p-2.5 text-left transition-all",
                            selId === st.id
                              ? "border-brand-600 ring-2 ring-brand-600/30"
                              : c
                                ? "border-line bg-white hover:border-ink-300"
                                : "border-dashed border-ink-300 bg-surface-muted/60 hover:bg-surface-muted",
                          )}
                        >
                          <span className="flex w-full items-center justify-between">
                            <span className="text-xs font-bold text-ink-400 tabular">
                              {st.number}
                            </span>
                            {dot && (
                              <span
                                className={cx("size-2 rounded-full", dot)}
                              />
                            )}
                          </span>
                          {c ? (
                            <span className="line-clamp-2 text-[12px] leading-tight font-semibold text-ink-900">
                              {c.name}
                            </span>
                          ) : (
                            <span className="text-[12px] text-ink-400">
                              Empty
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="xl:self-start">
          <CardHeader
            title="Waiting for a stall"
            description="Approved companies without a stall"
          />
          {unassigned.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="Every approved company has a stall"
            />
          ) : (
            <ul className="space-y-1 p-3">
              {unassigned.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2"
                >
                  <CompanyLogo company={c} size="sm" />
                  <span className="flex-1 truncate text-sm font-semibold text-ink-900">
                    {c.name}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={readOnly}
                    onClick={() => {
                      const st = stalls.find((x) => !x.companyId)
                      if (!st)
                        return toast({
                          title: "No empty stalls left",
                          tone: "warning",
                        })
                      open(st)
                      setPick(c.id)
                    }}
                  >
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Drawer
        open={!!sel}
        onClose={() => setSelId(null)}
        width={440}
        label={`Stall ${sel?.number}`}
      >
        {sel && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <div className="text-xs font-semibold text-ink-400 uppercase">
                  {ZONES[sel.zone]}
                </div>
                <h2 className="text-lg font-bold">Stall {sel.number}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelId(null)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <Field label="Company">
                <div className="flex gap-2">
                  <Select
                    value={pick}
                    onChange={(e) => setPick(e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="">— Empty —</option>
                    {approved.map((c) => {
                      const at = stalls.find((st) => st.companyId === c.id)
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {at && at.id !== sel.id
                            ? ` (stall ${at.number})`
                            : ""}
                        </option>
                      )
                    })}
                  </Select>
                  <Button
                    onClick={assign}
                    disabled={readOnly || pick === (sel.companyId || "")}
                  >
                    Save
                  </Button>
                </div>
              </Field>
              {sel.companyId && (
                <div className="space-y-4 rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-ink-900">
                      Stall QR
                    </h3>
                    <Badge
                      tone={
                        sel.qr.status === "active"
                          ? "success"
                          : sel.qr.status === "revoked"
                            ? "danger"
                            : "gray"
                      }
                      dot
                    >
                      {sel.qr.status === "active"
                        ? "Active"
                        : sel.qr.status === "revoked"
                          ? "Revoked"
                          : "Not generated"}
                    </Badge>
                  </div>
                  {sel.qr.status === "active" ? (
                    <>
                      <div className="mx-auto w-44 rounded-xl bg-white p-3 ring-1 ring-line">
                        <QRCodeSVG
                          value={stallUrl(sel.companyId, fair.id, sel.qr.code)}
                          size={160}
                          level="M"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </div>
                      <div className="text-center text-xs text-ink-400">
                        <span className="font-mono font-semibold text-ink-700">
                          {sel.qr.code}
                        </span>{" "}
                        · generated {fmtDateTime(sel.qr.generatedAt)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          icon={RefreshCw}
                          className="flex-1"
                          disabled={readOnly}
                          onClick={() => setConfirm({ kind: "regen" })}
                        >
                          Regenerate
                        </Button>
                        <Button
                          variant="danger-outline"
                          icon={Ban}
                          className="flex-1"
                          disabled={readOnly}
                          onClick={() => setConfirm({ kind: "revoke" })}
                        >
                          Revoke
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] text-ink-600">
                        {sel.qr.status === "revoked"
                          ? "Scans of the old poster are rejected. Generate a new QR and ask the company to reprint."
                          : "Generate a unique QR so students can share at this stall."}
                      </p>
                      <Button
                        icon={QrCode}
                        className="w-full"
                        disabled={readOnly}
                        onClick={() => (
                          actions.generateQR(sel.id),
                          toast({
                            title: `QR ready for Stall ${sel.number}`,
                            description: "The company has been notified.",
                            tone: "success",
                          })
                        )}
                      >
                        Generate QR
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {confirm?.kind === "assign" && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={doAssign}
          title="Reassign stall?"
          body={
            confirm.elsewhere
              ? `${company(pick).name} is currently at stall ${confirm.elsewhere.number}. Moving them clears that stall and its QR.`
              : "This stall has an active QR. Reassigning clears it, and the old poster stops working."
          }
          confirmLabel="Reassign"
          tone="danger"
        />
      )}
      {confirm?.kind === "revoke" && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => (
            actions.revokeQR(sel.id),
            toast({ title: "QR revoked", tone: "info" })
          )}
          title={`Revoke QR for stall ${sel.number}?`}
          body="Students scanning the current poster will see a revoked message. The company is notified."
          confirmLabel="Revoke QR"
          tone="danger"
        />
      )}
      {confirm?.kind === "regen" && (
        <ConfirmDialog
          open
          onClose={() => setConfirm(null)}
          onConfirm={() => (
            actions.generateQR(sel.id),
            toast({
              title: "New QR generated",
              description: "The old poster no longer works.",
              tone: "success",
            })
          )}
          title="Regenerate QR?"
          body="A new code is issued and the old poster stops working. The company must reprint."
          confirmLabel="Regenerate"
        />
      )}
    </div>
  )
}

function Legend({ cls, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx("size-2 rounded-full", cls)} />
      {label}
    </span>
  )
}

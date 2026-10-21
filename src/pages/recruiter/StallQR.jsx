import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import {
  Download,
  Printer,
  QrCode,
  ShieldAlert,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  EmptyState,
  Callout,
  CompanyLogo,
  Badge,
} from "@/components/ui"
import { actions, toast } from "@/store/store"
import { stallUrl, stallPath } from "@/lib/qr"
import { fmtDateTime } from "@/lib/format"
import { useRecruiter } from "./common"

function Poster({ company, fair, stall, url, qrRef }) {
  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[20px] bg-navy-950 text-white shadow-raised">
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="inline-flex items-center gap-2 text-sm font-bold">
          <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-[10px]">
            FC
          </span>
          FairConnect
        </span>
        <span className="text-[11px] font-semibold tracking-[0.12em] text-white/60 uppercase">
          Stall {stall.number}
        </span>
      </div>
      <div className="px-6 pt-6 text-center">
        <CompanyLogo
          company={company}
          size="lg"
          className="mx-auto ring-4 ring-white/10"
        />
        <div className="mt-3 text-xl font-bold">{company.name}</div>
        <div className="text-[13px] text-white/60">{fair.name}</div>
      </div>
      <div className="mx-6 mt-5 rounded-2xl bg-white p-4">
        <QRCodeCanvas
          ref={qrRef}
          value={url}
          size={640}
          level="M"
          marginSize={1}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div className="px-6 pt-4 pb-6 text-center">
        <div className="text-lg font-semibold">Scan to share your profile</div>
        <div className="mt-1 text-[13px] text-white/60">
          Open FairConnect, tap Scan, then confirm “Share My Profile”. Nothing
          is shared until you confirm.
        </div>
        <div className="mt-4 font-mono text-[11px] text-white/40">
          {stall.qr.code}
        </div>
      </div>
    </div>
  )
}

export default function StallQR() {
  const { company, fair, stall } = useRecruiter()
  const qrRef = useRef(null)

  if (!stall)
    return (
      <div>
        <PageHeader title="Stall & QR" />
        <Card>
          <EmptyState
            icon={Clock}
            title="No stall assigned yet"
            body={`Career Services assigns stall numbers for ${fair.name}. You'll be notified as soon as yours is ready.`}
          />
        </Card>
      </div>
    )

  const url = stallUrl(company.id, fair.id, stall.qr.code)
  const download = () => {
    const a = document.createElement("a")
    a.href = qrRef.current.toDataURL("image/png")
    a.download = `${company.name.replace(/\W+/g, "-")}-stall-${stall.number}-qr.png`
    a.click()
  }
  const print = () => {
    const img = qrRef.current.toDataURL("image/png")
    const w = window.open("", "_blank", "width=720,height=960")
    if (!w)
      return toast({
        title: "Allow pop-ups to print the poster",
        tone: "warning",
      })
    w.document.write(
      `<html><head><title>Stall ${stall.number} — ${company.name}</title><style>body{font-family:Inter,system-ui,sans-serif;text-align:center;padding:48px;color:#0a1630}h1{font-size:40px;margin:8px 0}h2{font-size:28px;margin:24px 0 4px}p{color:#475569;font-size:16px}img{width:420px;margin:24px auto;display:block}.n{font-size:20px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#2563eb}.c{font-family:monospace;color:#94a3b8}</style></head><body><div class="n">Stall ${stall.number}</div><h1>${company.name}</h1><p>${fair.name}</p><img src="${img}" alt="Stall QR"/><h2>Scan to share your profile</h2><p>Open FairConnect, tap Scan, then confirm “Share My Profile”.</p><p class="c">${stall.qr.code}</p></body></html>`,
    )
    w.document.close()
    setTimeout(() => w.print(), 400)
  }
  const copy = () =>
    navigator.clipboard
      ?.writeText(url)
      .then(() =>
        toast({ title: "Link copied", tone: "success", duration: 2000 }),
      )

  return (
    <div>
      <PageHeader
        title="Stall & QR"
        description="Print this poster for your stall. Students scan it to share their profile with you."
        actions={
          stall.qr.status === "active" && (
            <>
              <Button variant="secondary" icon={Download} onClick={download}>
                Download PNG
              </Button>
              <Button icon={Printer} onClick={print}>
                Print poster
              </Button>
            </>
          )
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          {stall.qr.status === "revoked" && (
            <Callout
              tone="danger"
              icon={ShieldAlert}
              title="This QR has been revoked"
              action={
                <Button
                  size="sm"
                  variant="danger-outline"
                  icon={RefreshCw}
                  onClick={() => (
                    actions.requestQrRegeneration(fair.id),
                    toast({
                      title: "Request sent to Career Services",
                      tone: "success",
                    })
                  )}
                >
                  Request new QR
                </Button>
              }
            >
              Scans of the old poster are rejected. Remove it from your stall
              and print the new one when it’s issued.
            </Callout>
          )}
          {stall.qr.status === "none" && (
            <Callout tone="warning" icon={Clock} title="QR not generated yet">
              Career Services generates stall QRs after assignment. You’ll get a
              notification when it’s ready.
            </Callout>
          )}
          <Card>
            <CardHeader title="Stall details" />
            <dl className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  Stall
                </dt>
                <dd className="mt-1 text-2xl font-bold text-ink-900 tabular">
                  {stall.number}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  Zone
                </dt>
                <dd className="mt-1 text-2xl font-bold text-ink-900">
                  {stall.zone}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                  QR status
                </dt>
                <dd className="mt-2">
                  <Badge
                    tone={
                      { active: "success", revoked: "danger", none: "gray" }[
                        stall.qr.status
                      ]
                    }
                    dot
                  >
                    {
                      {
                        active: "Active",
                        revoked: "Revoked",
                        none: "Not generated",
                      }[stall.qr.status]
                    }
                  </Badge>
                </dd>
              </div>
              {stall.qr.generatedAt && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                    Generated
                  </dt>
                  <dd className="mt-1 text-ink-700">
                    {fmtDateTime(stall.qr.generatedAt)} ·{" "}
                    <span className="font-mono text-xs">{stall.qr.code}</span>
                  </dd>
                </div>
              )}
            </dl>
          </Card>
          {stall.qr.status === "active" && (
            <Card>
              <CardHeader
                title="Stall link"
                description="The QR encodes this link. Students must be signed in to share."
              />
              <div className="flex flex-wrap items-center gap-2 p-5">
                <code className="min-w-0 flex-1 truncate rounded-[10px] bg-surface-muted px-3 py-2.5 text-[13px] text-ink-700">
                  {url}
                </code>
                <Button variant="secondary" icon={Copy} onClick={copy}>
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  icon={ExternalLink}
                  href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}${stallPath(company.id, fair.id, stall.qr.code)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Test
                </Button>
              </div>
            </Card>
          )}
          <Card className="p-5">
            <h3 className="text-[15px] font-semibold">Poster tips</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600">
              <li>
                Print at A4 or larger and mount at eye level near the front of
                your stall.
              </li>
              <li>
                Keep a second copy at the interview desk for students waiting in
                line.
              </li>
              <li>
                The QR only works while the fair is Live — scans before or after
                are politely declined.
              </li>
            </ul>
          </Card>
        </div>
        <div>
          {stall.qr.status === "active" ? (
            <Poster
              company={company}
              fair={fair}
              stall={stall}
              url={url}
              qrRef={qrRef}
            />
          ) : (
            <Card className="grid aspect-[3/4] place-items-center bg-surface-muted">
              <EmptyState
                icon={QrCode}
                title={
                  stall.qr.status === "revoked"
                    ? "Poster disabled"
                    : "Poster not ready"
                }
                body="Your printable poster appears here once an active QR is issued."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

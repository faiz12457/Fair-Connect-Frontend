import { useNavigate } from "react-router"
import { Hourglass, CircleX, LogOut, Mail, Check } from "lucide-react"
import {
  Logo,
  Button,
  Card,
  IconTile,
  CompanyLogo,
  Badge,
  Callout,
} from "@/components/ui"
import { useSession, useStore, actions } from "@/store/store"
import { fmtDate, cx } from "@/lib/format"

/** R01 — shown for every recruiter route until Career Services approves the company. */
export default function Pending() {
  const { user, company } = useSession()
  const s = useStore()
  const navigate = useNavigate()
  const rejected = company?.status === "rejected"
  const steps = [
    ["Account created", true],
    ["Email verified", user.emailVerified !== false],
    ["Career Services review", false],
    ["Stall assignment & QR", false],
  ]
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted px-5 py-6">
      <div className="flex items-center justify-between">
        <Logo to="/recruiter" />
        <Button
          variant="ghost"
          size="sm"
          icon={LogOut}
          onClick={() => (actions.logout(), navigate("/login"))}
        >
          Sign out
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <div className="flex items-center gap-3">
            {company && <CompanyLogo company={company} />}
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink-900">
                {company?.name || "Your company"}
              </div>
              <div className="text-[13px] text-ink-400">
                {company?.industry} · {company?.city}
              </div>
            </div>
            <Badge tone={rejected ? "danger" : "warning"} className="ml-auto">
              {rejected ? "Not approved" : "Pending review"}
            </Badge>
          </div>
          <div className="mt-7">
            <IconTile tone={rejected ? "danger" : "warning"} size="lg">
              {rejected ? (
                <CircleX className="size-6" strokeWidth={1.75} />
              ) : (
                <Hourglass className="size-6" strokeWidth={1.75} />
              )}
            </IconTile>
            <h1 className="mt-4 text-2xl font-bold">
              {rejected
                ? "Your registration was not approved"
                : "Your company is under review"}
            </h1>
            <p className="mt-2 text-[15px] text-ink-600">
              {rejected
                ? `${s.university.careerOffice} reviewed your request and couldn't approve it for this fair.`
                : `${s.university.careerOffice} verifies every employer before the fair. You'll get a notification as soon as you're approved — usually within two working days.`}
            </p>
          </div>
          {rejected ? (
            <Callout tone="danger" title="Reason given" className="mt-5">
              {company.rejectReason || "No reason provided."}
            </Callout>
          ) : (
            <ol className="mt-6 space-y-3">
              {steps.map(([label, done], i) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cx(
                      "grid size-6 place-items-center rounded-full text-xs font-bold",
                      done
                        ? "bg-success-600 text-white"
                        : i === 2
                          ? "bg-white text-warning-700 ring-2 ring-warning-600"
                          : "bg-white text-ink-400 ring-1 ring-line",
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={
                      done || i === 2
                        ? "font-semibold text-ink-900"
                        : "text-ink-400"
                    }
                  >
                    {label}
                  </span>
                  {i === 2 && (
                    <span className="text-xs text-warning-700">
                      In progress
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[13px] text-ink-400">
            <span>
              Submitted{" "}
              {company?.submittedAt ? fmtDate(company.submittedAt) : "recently"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={Mail}
              href={`mailto:${s.university.contactEmail}`}
            >
              Contact Career Services
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

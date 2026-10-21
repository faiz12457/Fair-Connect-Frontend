import { Link } from "react-router"
import { Plus, CalendarDays, MapPin, ChevronRight } from "lucide-react"
import { PageHeader, Card, Badge, Button, LiveIndicator } from "@/components/ui"
import { fmtDate } from "@/lib/format"
import { useAdmin } from "./common"

export default function Fairs() {
  const { s } = useAdmin()
  const fairs = [...s.fairs].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div>
      <PageHeader
        title="Fairs"
        description="Create and manage each career fair."
        actions={
          <Button icon={Plus} to="/admin/fairs/new">
            New fair
          </Button>
        }
      />
      <div className="space-y-3">
        {fairs.map((f) => {
          const companies = s.stalls.filter(
            (st) => st.fairId === f.id && st.companyId,
          ).length
          const shares =
            f.totals?.interactions ??
            s.interactions.filter((i) => i.fairId === f.id).length
          return (
            <Link
              key={f.id}
              to={`/admin/fairs/${f.id}`}
              className="group block"
            >
              <Card className="flex flex-col gap-4 p-5 transition-shadow group-hover:shadow-pop sm:flex-row sm:items-center">
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-center text-brand-700">
                  <div>
                    <div className="text-[11px] font-semibold uppercase">
                      {fmtDate(f.date, { month: "short" })}
                    </div>
                    <div className="text-lg leading-none font-bold">
                      {fmtDate(f.date, { day: "numeric" })}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink-900 group-hover:text-brand-700">
                      {f.name}
                    </h3>
                    <LiveIndicator status={f.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {fmtDate(f.date, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {f.venue}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">
                    {f.totals?.companies ?? companies} companies
                  </Badge>
                  <Badge tone="brand">{shares.toLocaleString()} shares</Badge>
                  <ChevronRight className="size-5 text-ink-300" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

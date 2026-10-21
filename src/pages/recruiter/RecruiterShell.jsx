import {
  LayoutDashboard,
  Radio,
  Kanban,
  CalendarClock,
  Briefcase,
  QrCode,
  Users,
  ChartColumn,
  UserPlus,
  Settings,
  Store,
} from "lucide-react"
import DashboardShell from "@/components/shared/DashboardShell"
import RequireRole from "@/components/shared/Guards"
import { useRecruiter } from "./common"
import Pending from "./Pending"

function Inner() {
  const { user, company, fair, interactions } = useRecruiter()
  if (!company || company.status !== "approved") return <Pending />
  const fresh = interactions.filter((i) => i.status === "pending").length
  const nav = [
    { to: "/recruiter", label: "Overview", icon: LayoutDashboard, end: true },
    {
      to: "/recruiter/live",
      label: "Live dashboard",
      icon: Radio,
      live: fair.status === "live",
      badge: fresh || null,
    },
    { to: "/recruiter/pipeline", label: "Pipeline", icon: Kanban },
    { to: "/recruiter/interviews", label: "Interviews", icon: CalendarClock },
    { section: "Stall setup" },
    { to: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
    { to: "/recruiter/stall", label: "Stall profile", icon: Store },
    { to: "/recruiter/qr", label: "Stall & QR", icon: QrCode },
    { section: "Insights" },
    { to: "/recruiter/pool", label: "Pool stats", icon: Users },
    { to: "/recruiter/analytics", label: "Analytics", icon: ChartColumn },
    { section: "Company" },
    { to: "/recruiter/team", label: "Team", icon: UserPlus },
    { to: "/recruiter/settings", label: "Settings", icon: Settings },
  ]
  return (
    <DashboardShell
      nav={nav}
      user={user}
      subtitle={`${user.title || "Recruiter"} · ${company.name}`}
      notifTo={`company:${company.id}`}
      notifHref="/recruiter/notifications"
      fair={fair}
      homeTo="/recruiter"
    />
  )
}

export default function RecruiterShell() {
  return (
    <RequireRole role="recruiter">
      <Inner />
    </RequireRole>
  )
}

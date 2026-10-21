import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  GraduationCap,
  LayoutGrid,
  Radio,
  DoorOpen,
  ChartColumn,
  FileText,
  SlidersHorizontal,
  Users,
  Settings,
  ScrollText,
} from "lucide-react"
import DashboardShell from "@/components/shared/DashboardShell"
import RequireRole from "@/components/shared/Guards"
import { useAdmin } from "./common"

function Inner() {
  const { s, user, fair } = useAdmin()
  const pendingCo = s.companies.filter((c) => c.status === "pending").length
  const pendingSt = s.students.filter(
    (st) => st.verification !== "verified",
  ).length
  const nav = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/fairs", label: "Fairs", icon: CalendarDays },
    {
      to: "/admin/companies",
      label: "Companies",
      icon: Building2,
      badge: pendingCo || null,
    },
    {
      to: "/admin/students",
      label: "Students",
      icon: GraduationCap,
      badge: pendingSt || null,
    },
    { section: fair.name },
    {
      to: `/admin/fairs/${fair.id}/stalls`,
      label: "Stalls & QR",
      icon: LayoutGrid,
    },
    {
      to: `/admin/fairs/${fair.id}/live`,
      label: "Live monitor",
      icon: Radio,
      live: fair.status === "live",
    },
    {
      to: `/admin/fairs/${fair.id}/checkin`,
      label: "Check-in",
      icon: DoorOpen,
    },
    { section: "Insights" },
    { to: "/admin/analytics", label: "Analytics", icon: ChartColumn },
    { to: "/admin/reports", label: "Reports", icon: FileText },
    { section: "Configuration" },
    { to: "/admin/settings/ai", label: "AI settings", icon: SlidersHorizontal },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings, end: true },
    { to: "/admin/audit", label: "Audit log", icon: ScrollText },
  ]
  return (
    <DashboardShell
      nav={nav}
      user={user}
      subtitle={`${user.title || "Admin"} · ${s.university.short}`}
      notifTo="admin"
      notifHref="/admin/notifications"
      fair={fair}
      homeTo="/admin"
    />
  )
}

export default function AdminShell() {
  return (
    <RequireRole role="admin">
      <Inner />
    </RequireRole>
  )
}

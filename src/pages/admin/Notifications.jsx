import { PageHeader } from "@/components/ui"
import NotificationsList from "@/components/shared/NotificationsList"

export default function AdminNotifications() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Requests and updates for Career Services."
      />
      <NotificationsList to="admin" />
    </div>
  )
}

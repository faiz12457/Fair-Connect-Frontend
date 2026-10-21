import { PageHeader } from "@/components/ui"
import NotificationsList from "@/components/shared/NotificationsList"
import { useRecruiter } from "./common"

export default function Notifications() {
  const { company } = useRecruiter()
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Visitors, stall and interview updates for your company."
      />
      <NotificationsList to={`company:${company.id}`} />
    </div>
  )
}

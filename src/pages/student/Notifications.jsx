import { PageHeader } from '@/components/ui'
import NotificationsList from '@/components/shared/NotificationsList'
import { useStudent } from './common'

export default function Notifications() {
  const { student } = useStudent()
  return (
    <div>
      <PageHeader title="Notifications" />
      <NotificationsList to={`student:${student.id}`} />
    </div>
  )
}

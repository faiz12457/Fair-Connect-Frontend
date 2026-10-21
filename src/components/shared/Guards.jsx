import { Navigate, useLocation } from 'react-router'
import { useSession } from '@/store/store'

export default function RequireRole({ role, children }) {
  const { user } = useSession()
  const loc = useLocation()
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (user.role !== role) return <Navigate to="/403" replace />
  return children
}

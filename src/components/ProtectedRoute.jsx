import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ requireType, requireRoles }) {
  const { isAuthenticated, principalType, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireType && principalType !== requireType) {
    return <Navigate to="/login" replace />
  }

  if (requireRoles && !requireRoles.includes(role)) {
    return <Navigate to="/manager/dashboard" replace />
  }

  return <Outlet />
}

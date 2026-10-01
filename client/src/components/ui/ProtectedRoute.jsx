import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute() {
  const { token, isInitialised } = useAuthStore()
  if (!isInitialised) return <div className="auth-page"><span className="spinner" /></div>
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

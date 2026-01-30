/**
 * Protected Route component.
 * Redirects to login if user is not authenticated.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<'PATIENT' | 'DOCTOR' | 'ADMIN'>
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const requireDoctorVerification = import.meta.env.VITE_REQUIRE_DOCTOR_VERIFICATION === 'true'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (
    requireDoctorVerification &&
    user?.role === 'DOCTOR' &&
    user.is_verified === false &&
    location.pathname.startsWith('/doctor') &&
    location.pathname !== '/doctor/pending'
  ) {
    return <Navigate to="/doctor/pending" replace />
  }
  
  return <>{children}</>
}

import { Suspense, lazy, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DoctorLayout from './components/layout/DoctorLayout'
import { PageLoading } from './components/ui/LoadingSpinner'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuthStore } from './stores/authStore'
import useInactivityLogout from './hooks/useInactivityLogout'
import toast from 'react-hot-toast'

// Lazy-loaded pages — only downloaded when visited
const Home = lazy(() => import('./pages/Home'))
const Doctors = lazy(() => import('./pages/Doctors'))
const DoctorDetail = lazy(() => import('./pages/DoctorDetail'))
const Chat = lazy(() => import('./pages/Chat'))
const Appointments = lazy(() => import('./pages/Appointments'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const NotFound = lazy(() => import('./pages/NotFound'))
const DoctorPending = lazy(() => import('./pages/doctor/DoctorPending'))

// Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'))
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'))
const DoctorSchedule = lazy(() => import('./pages/doctor/DoctorSchedule'))
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'))

// Smart redirect based on user role
function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role === 'DOCTOR') {
    return <Navigate to="/doctor" replace />
  }
  
  return <Navigate to="/dashboard" replace />
}

function App() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuthStore()

  const handleAutoLogout = useCallback(() => {
    logout()
    toast.error('Session ended due to inactivity. Please login again.')
    navigate('/login', { replace: true, state: { reason: 'inactive' } })
  }, [logout, navigate])

  useInactivityLogout({
    enabled: isAuthenticated,
    timeoutMs: 20 * 60 * 1000,
    onTimeout: handleAutoLogout,
  })

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/doctor/pending" element={<DoctorPending />} />
        {/* Public Routes with main layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="chat" element={<Chat />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          
          {/* Patient Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="appointments" element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          {/* Profile/Settings */}
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Role-based redirect */}
          <Route path="my-account" element={<RoleBasedRedirect />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Doctor Routes with Doctor Layout */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

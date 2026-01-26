import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DoctorLayout from './components/layout/DoctorLayout'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import DoctorDetail from './pages/DoctorDetail'
import Chat from './pages/Chat'
import Appointments from './pages/Appointments'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import DoctorProfile from './pages/doctor/DoctorProfile'

import { useAuthStore } from './stores/authStore'

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
  return (
    <Routes>
      {/* Public Routes with main layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />
        <Route path="chat" element={<Chat />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
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
      </Route>
    </Routes>
  )
}

export default App

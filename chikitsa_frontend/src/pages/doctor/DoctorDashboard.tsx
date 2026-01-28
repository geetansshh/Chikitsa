/**
 * Doctor Dashboard - Main view for doctors after login.
 */

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { analyticsAPI, appointmentsAPI } from '@/lib/api'
import Card from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface DashboardStats {
  total_appointments: number
  appointments_today: number
  appointments_this_week: number
  total_patients: number
  total_earnings: number
  average_rating: number
  total_reviews: number
  upcoming_appointments: Array<{
    id: string
    patient_name: string
    appointment_date: string
    time_slot: string
    status: string
    appointment_type: string
  }>
}

export default function DoctorDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['doctor-dashboard'],
    queryFn: async () => {
      const response = await analyticsAPI.getDoctorDashboard()
      return response.data
    },
  })

  const { data: todayAppointments } = useQuery({
    queryKey: ['doctor-appointments-today'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await appointmentsAPI.getAppointments({ date: today })
      return response.data.results
    },
  })

  if (isLoading) return <PageLoading />

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats?.appointments_today || 0,
      icon: CalendarDaysIcon,
      color: 'bg-blue-500',
      change: '+2 from yesterday',
    },
    {
      label: 'Total Patients',
      value: stats?.total_patients || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      change: '+12 this month',
    },
    {
      label: 'Total Earnings',
      value: `₹${(stats?.total_earnings || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-purple-500',
      change: '+8% from last month',
    },
    {
      label: 'Average Rating',
      value: stats?.average_rating?.toFixed(1) || '0.0',
      icon: StarIcon,
      color: 'bg-yellow-500',
      change: `${stats?.total_reviews || 0} reviews`,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your practice overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Schedule
              </h2>
              <Link
                to="/doctor/appointments"
                className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-700"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {todayAppointments && todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((apt: {
                  id: string
                  patient: { full_name: string }
                  time_slot: string
                  status: string
                  appointment_type: string
                }) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {apt.patient?.full_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {apt.patient?.full_name || 'Patient'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4" />
                          <span>{apt.time_slot}</span>
                          <span className="text-gray-300">•</span>
                          <span className="capitalize">{apt.appointment_type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : apt.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/doctor/appointments"
                className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  View All Appointments
                </span>
              </Link>
              <Link
                to="/doctor/schedule"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <ClockIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Manage Schedule
                </span>
              </Link>
              <Link
                to="/doctor/profile"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Edit Profile
                </span>
              </Link>
            </div>
          </Card>

          {/* Pending Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Actions
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Appointments to confirm
                  </span>
                </div>
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  3
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Complete consultations
                  </span>
                </div>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  2
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

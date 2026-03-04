/**
 * Patient Dashboard page.
 */

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { analyticsAPI, appointmentsAPI, notificationsAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  CalendarDaysIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const { user } = useAuthStore()
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['patientDashboard'],
    queryFn: () => analyticsAPI.getPatientDashboard(),
  })
  
  // Fetch upcoming appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useQuery(
    {
      queryKey: ['upcomingAppointments'],
      queryFn: () => appointmentsAPI.getUpcoming(),
    }
  )
  
  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications(),
  })
  
  if (isDashboardLoading || isAppointmentsLoading) return <PageLoading />
  
  const dashboard = dashboardData?.data?.stats || {}
  const appointments = appointmentsData?.data?.results?.slice(0, 3) || []
  const notifications =
    notificationsData?.data?.results?.slice(0, 5) || []
  
  const stats = [
    {
      label: 'Total Appointments',
      value: dashboard.total_appointments || 0,
      icon: CalendarDaysIcon,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Upcoming',
      value: dashboard.upcoming_appointments || 0,
      icon: ClockIcon,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Completed',
      value: dashboard.completed_appointments || 0,
      icon: CalendarDaysIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Cancelled',
      value: dashboard.cancelled_appointments || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-100 text-purple-600',
    },
  ]
  
  return (
    <div className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's an overview of your health journey
          </p>
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Appointments
                </h2>
                <Link to="/appointments">
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                  >
                    View All
                  </Button>
                </Link>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No upcoming appointments
                  </p>
                  <Link to="/doctors">
                    <Button size="sm">Book Appointment</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(
                    (apt: {
                      id: string
                      doctor_name: string
                      doctor_specialty: string
                      appointment_date: string
                      time_slot: string
                      status: string
                    }) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm sm:text-base">
                            {apt.doctor_name?.charAt(0) || 'D'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            Dr. {apt.doctor_name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {apt.doctor_specialty}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {format(parseISO(apt.appointment_date), 'MMM d')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {apt.time_slot}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </Card>
          </motion.div>
          
          {/* Recent Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BellIcon className="w-5 h-5" />
                  Notifications
                </h2>
                <Link
                  to="/notifications"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(
                    (notif: {
                      id: number
                      title: string
                      message: string
                      created_at: string
                      is_read: boolean
                    }) => (
                      <Link
                        key={notif.id}
                        to="/notifications"
                        className={`block p-3 rounded-lg transition-colors hover:shadow-md ${
                          notif.is_read ? 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700' : 'bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {format(parseISO(notif.created_at), 'MMM d, h:mm a')}
                        </p>
                      </Link>
                    )
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Link to="/doctors">
                <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-center hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
                  <CalendarDaysIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
                    Book Appointment
                  </p>
                </div>
              </Link>
              <Link to="/chat">
                <div className="p-4 bg-secondary-50 dark:bg-secondary-500/10 rounded-xl text-center hover:bg-secondary-100 dark:hover:bg-secondary-500/20 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-secondary-600 dark:text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-400">
                    AI Health Chat
                  </p>
                </div>
              </Link>
              <Link to="/appointments">
                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                  <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    View Appointments
                  </p>
                </div>
              </Link>
              <Link to="/profile">
                <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-center hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
                  <UserCircleIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                    Edit Profile
                  </p>
                </div>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

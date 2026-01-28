/**
 * Doctor Appointments - View and manage patient appointments.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, addDays } from 'date-fns'
import toast from 'react-hot-toast'
import api, { appointmentsAPI } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import {
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  patient: {
    id: string
    full_name: string
    email: string
    phone_number?: string
  }
  appointment_date: string
  time_slot: string
  status: string
  appointment_type: string
  patient_symptoms?: string
  created_at: string
}

const statusFilters = [
  { value: 'all', label: 'All Appointments' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const dateFilters = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'all', label: 'All Time' },
]

export default function DoctorAppointments() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Build query params
  const getQueryParams = () => {
    const params: Record<string, string> = {}
    
    if (statusFilter !== 'all') {
      params.status = statusFilter
    }
    
    const today = new Date()
    if (dateFilter === 'today') {
      params.date = format(today, 'yyyy-MM-dd')
    } else if (dateFilter === 'tomorrow') {
      params.date = format(addDays(today, 1), 'yyyy-MM-dd')
    } else if (dateFilter === 'week') {
      params.date_from = format(today, 'yyyy-MM-dd')
      params.date_to = format(addDays(today, 7), 'yyyy-MM-dd')
    }
    
    return params
  }

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', statusFilter, dateFilter],
    queryFn: async () => {
      const response = await appointmentsAPI.getAppointments(getQueryParams())
      return response.data.results as Appointment[]
    },
  })

  // Confirm appointment mutation
  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/appointments/${id}/confirm/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      toast.success('Appointment confirmed!')
    },
    onError: (error: any) => {
      console.error('Confirm error:', error)
      const message = error?.response?.data?.error || 'Failed to confirm appointment'
      toast.error(message)
    },
  })

  // Complete appointment mutation
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/appointments/${id}/complete/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      toast.success('Appointment marked as completed!')
    },
    onError: (error: any) => {
      console.error('Complete error:', error)
      const message = error?.response?.data?.error || 'Failed to complete appointment'
      toast.error(message)
    },
  })

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      return appointmentsAPI.cancelAppointment(id, 'Cancelled by doctor')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] })
      toast.success('Appointment cancelled')
    },
    onError: (error: any) => {
      console.error('Cancel error:', error)
      const message = error?.response?.data?.error || 'Failed to cancel appointment'
      toast.error(message)
    },
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
      COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
      NO_SHOW: 'bg-gray-100 text-gray-700 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      no_show: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return styles[status] || styles.PENDING
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {dateFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {appointment.patient?.full_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.patient?.full_name || 'Patient'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {appointment.time_slot}
                          </span>
                          <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                            {appointment.appointment_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setIsDetailModalOpen(true)
                          }}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>

                        {(appointment.status === 'PENDING' || appointment.status === 'pending') && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => confirmMutation.mutate(appointment.id)}
                              isLoading={confirmMutation.isPending}
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelMutation.mutate(appointment.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <XCircleIcon className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {(appointment.status === 'CONFIRMED' || appointment.status === 'confirmed') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => completeMutation.mutate(appointment.id)}
                            isLoading={completeMutation.isPending}
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Symptoms preview */}
                  {appointment.patient_symptoms && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Symptoms:</span>{' '}
                        {appointment.patient_symptoms.slice(0, 150)}
                        {appointment.patient_symptoms.length > 150 && '...'}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="text-center py-12">
          <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500">
            {dateFilter === 'today'
              ? "You don't have any appointments scheduled for today."
              : 'No appointments match your current filters.'}
          </p>
        </Card>
      )}

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {selectedAppointment.patient?.full_name?.charAt(0) || 'P'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedAppointment.patient?.full_name}
                </h3>
                <p className="text-gray-500">{selectedAppointment.patient?.email}</p>
                {selectedAppointment.patient?.phone_number && (
                  <p className="text-gray-500 flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {selectedAppointment.patient.phone_number}
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {format(parseISO(selectedAppointment.appointment_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{selectedAppointment.time_slot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{selectedAppointment.appointment_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            {/* Symptoms */}
            {selectedAppointment.patient_symptoms && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Patient's Symptoms</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedAppointment.patient_symptoms}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedAppointment.status === 'PENDING' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    confirmMutation.mutate(selectedAppointment.id)
                    setIsDetailModalOpen(false)
                  }}
                >
                  Confirm Appointment
                </Button>
              )}
              {selectedAppointment.status === 'CONFIRMED' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    completeMutation.mutate(selectedAppointment.id)
                    setIsDetailModalOpen(false)
                  }}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

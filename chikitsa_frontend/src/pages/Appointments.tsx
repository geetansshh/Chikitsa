/**
 * Appointments page - list and manage appointments.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { appointmentsAPI, doctorsAPI } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  CalendarDaysIcon,
  ClockIcon,
  ExclamationCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

type TabType = 'upcoming' | 'past' | 'cancelled'

interface Appointment {
  id: string
  doctor_id?: string
  doctor?: {
    id: string
    user: {
      full_name: string
    }
  }
  doctor_name: string
  doctor_specialty: string
  appointment_date: string
  time_slot: string
  status: string
  appointment_type: string
  patient_symptoms?: string
  cancellation_reason?: string
  consultation_fee?: number
  payment_status?: string
  is_upcoming?: boolean
  is_cancellable?: boolean
  is_reviewed?: boolean
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-700',
}

export default function Appointments() {
  usePageTitle('My Appointments')
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  
  const queryClient = useQueryClient()
  
  // Fetch appointments based on active tab
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', activeTab],
    queryFn: () => {
      if (activeTab === 'upcoming') {
        return appointmentsAPI.getUpcoming()
      } else if (activeTab === 'past') {
        return appointmentsAPI.getPast()
      } else {
        // Cancelled tab
        return appointmentsAPI.getAppointments({ status: 'cancelled' })
      }
    },
  })
  
  // Cancel mutation
  const cancelAppointment = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      appointmentsAPI.cancelAppointment(id, reason),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setShowCancelModal(false)
      setSelectedAppointment(null)
      setCancelReason('')
    },
    onError: () => {
      toast.error('Failed to cancel appointment')
    },
  })

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: string; data: any }) =>
      doctorsAPI.createReview(doctorId, data),
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setShowReviewModal(false)
      setSelectedAppointment(null)
      setReviewRating(0)
      setReviewComment('')
      setReviewTitle('')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 
                      error?.response?.data?.non_field_errors?.[0] ||
                      'Failed to submit review'
      toast.error(message)
    },
  })
  
  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  const handleReviewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowReviewModal(true)
  }

  const submitReview = () => {
    if (!selectedAppointment) return
    
    if (reviewRating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a comment')
      return
    }

    // Extract doctor ID from appointment
    const doctorId = selectedAppointment.doctor?.id || selectedAppointment.doctor_id
    
    if (doctorId) {
      reviewMutation.mutate({
        doctorId,
        data: {
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          appointment_id: selectedAppointment.id,
        },
      })
    } else {
      toast.error('Could not find doctor information')
    }
  }
  
  const confirmCancel = () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }
    
    cancelAppointment.mutate({
      id: selectedAppointment.id,
      reason: cancelReason,
    })
  }
  
  if (isLoading) return <PageLoading />
  
  const appointments = appointmentsData?.data?.results || []
  
  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ]
  
  return (
    <div className="py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and track your appointments</p>
        </motion.div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-5 sm:px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Appointments List */}
        {appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No {activeTab} appointments found
            </p>
            {activeTab === 'upcoming' && (
              <Button onClick={() => (window.location.href = '/doctors')}>
                Book an Appointment
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {appointments.map((appointment: Appointment, index: number) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Doctor Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl gradient-bg flex items-center justify-center">
                          <span className="text-white text-lg sm:text-xl font-bold">
                            {appointment.doctor_name?.charAt(0) || 'D'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Dr. {appointment.doctor_name}
                            </h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400">
                              {appointment.doctor_specialty}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusColors[appointment.status]
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                        
                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                            {format(
                              parseISO(appointment.appointment_date),
                              'EEE, MMM d, yyyy'
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            {appointment.time_slot}
                          </div>
                        </div>
                        
                        {/* Symptoms */}
                        {appointment.patient_symptoms && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <span className="font-medium">Symptoms: </span>
                            {appointment.patient_symptoms}
                          </div>
                        )}
                        
                        {/* Cancellation Reason */}
                        {(appointment.status === 'cancelled' ||
                          appointment.status === 'CANCELLED') &&
                          appointment.cancellation_reason && (
                            <div className="text-sm text-red-500 mb-4">
                              <span className="font-medium">
                                Cancellation reason:{' '}
                              </span>
                              {appointment.cancellation_reason}
                            </div>
                          )}
                        
                        {/* Actions */}
                        {activeTab === 'upcoming' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              Cancel
                            </Button>
                            {appointment.doctor && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const doctorId = appointment.doctor?.id;
                                  if (doctorId) {
                                    window.location.href = `/doctors/${doctorId}`;
                                  }
                                }}
                              >
                                Reschedule
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {activeTab === 'past' &&
                          (appointment.status === 'completed' ||
                            appointment.status === 'COMPLETED') &&
                          !appointment.is_reviewed && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReviewClick(appointment)}
                              leftIcon={<StarIcon className="w-4 h-4" />}
                            >
                              Leave a Review
                            </Button>
                          )}
                        {activeTab === 'past' &&
                          (appointment.status === 'completed' ||
                            appointment.status === 'COMPLETED') &&
                          appointment.is_reviewed && (
                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                              <StarIconSolid className="w-4 h-4" />
                              Reviewed
                            </span>
                          )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setSelectedAppointment(null)
          setCancelReason('')
        }}
        title="Cancel Appointment"
        size="md"
      >
        <div className="space-y-4">
          {selectedAppointment && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-6 h-6 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Are you sure you want to cancel this appointment?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Dr. {selectedAppointment.doctor_name} •{' '}
                    {format(
                      parseISO(selectedAppointment.appointment_date),
                      'MMM d, yyyy'
                    )}{' '}
                    at {selectedAppointment.time_slot}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Reason for cancellation *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700 dark:text-white"
              placeholder="Please provide a reason..."
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false)
                setSelectedAppointment(null)
                setCancelReason('')
              }}
              className="flex-1"
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={confirmCancel}
              isLoading={cancelAppointment.isPending}
              className="flex-1"
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false)
          setSelectedAppointment(null)
          setReviewRating(0)
          setReviewComment('')
          setReviewTitle('')
        }}
        title="Leave a Review"
        size="md"
      >
        <div className="space-y-6">
          {selectedAppointment && (
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                Dr. {selectedAppointment.doctor_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedAppointment.doctor_specialty}
              </p>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  {star <= reviewRating ? (
                    <StarIconSolid className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {reviewRating > 0 && (
                <>
                  {reviewRating === 1 && 'Poor'}
                  {reviewRating === 2 && 'Fair'}
                  {reviewRating === 3 && 'Good'}
                  {reviewRating === 4 && 'Very Good'}
                  {reviewRating === 5 && 'Excellent'}
                </>
              )}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Review Title (Optional)
            </label>
            <input
              type="text"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Great experience!"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Your Review *
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700 dark:text-white"
              placeholder="Share your experience with this doctor..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowReviewModal(false)
                setSelectedAppointment(null)
                setReviewRating(0)
                setReviewComment('')
                setReviewTitle('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitReview}
              isLoading={reviewMutation.isPending}
              className="flex-1"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

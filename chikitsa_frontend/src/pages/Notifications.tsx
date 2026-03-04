/**
 * Notifications page - view and manage all notifications.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { notificationsAPI, doctorsAPI, appointmentsAPI } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  BellIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Notification {
  id: number
  notification_type: string
  title: string
  message: string
  is_read: boolean
  read_at: string | null
  created_at: string
  related_object_type: string
  related_object_id: string
}

interface SelectedNotificationData {
  notification: Notification
  doctorId: string
  appointmentId: string
}

export default function Notifications() {
  usePageTitle('Notifications')
  const queryClient = useQueryClient()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<SelectedNotificationData | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications(),
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: { doctorId: string; data: { rating: number; title: string; comment: string; appointment_id: string } }) => {
      return doctorsAPI.createReview(data.doctorId, data.data)
    },
    onSuccess: () => {
      toast.success('Thank you for your review!')
      setShowReviewModal(false)
      setReviewRating(0)
      setReviewTitle('')
      setReviewComment('')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to submit review'
      toast.error(message)
    },
  })

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }

    // If it's a review request, open the review modal
    if (notification.notification_type === 'appointment_completed') {
      // Extract doctor ID from the appointment
      if (notification.related_object_id) {
        try {
          const response = await appointmentsAPI.getAppointment(notification.related_object_id)
          const appointment = response.data
          
          console.log('Appointment data:', appointment)
          
          // Extract doctor ID from nested doctor object
          const extractedDoctorId = appointment.doctor?.id || appointment.doctor_id
          console.log('Extracted Doctor ID:', extractedDoctorId)
          
          if (extractedDoctorId) {
            setSelectedNotification({
              notification,
              doctorId: extractedDoctorId,
              appointmentId: notification.related_object_id
            })
            setShowReviewModal(true)
          } else {
            console.error('Doctor ID not found in appointment:', appointment)
            toast.error('Could not find doctor information')
          }
        } catch (error) {
          console.error('Failed to load appointment:', error)
          toast.error('Failed to load appointment details')
        }
      }
    }
  }

  const submitReview = () => {
    const doctorId = selectedNotification?.doctorId
    console.log('Submitting review for doctor ID:', doctorId)
    
    if (!doctorId) {
      toast.error('Doctor information is missing')
      return
    }
    if (!reviewRating) {
      toast.error('Please select a rating')
      return
    }
    if (!reviewTitle.trim()) {
      toast.error('Please enter a review title')
      return
    }

    reviewMutation.mutate({
      doctorId: doctorId,
      data: {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        appointment_id: selectedNotification?.appointmentId || '',
      },
    })
  }

  if (isLoading) return <PageLoading />

  const notifications = notificationsData?.data?.results || []

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <BellIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Stay updated with your appointments and activities</p>
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <BellIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification: Notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => handleNotificationClick(notification)}
                  className="cursor-pointer"
                >
                  <Card
                    className={`hover:shadow-lg transition-all backdrop-blur-xl border border-white/40 dark:border-slate-700 ${
                      !notification.is_read
                        ? 'bg-primary-50/70 dark:bg-primary-500/10'
                        : 'bg-white/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.notification_type === 'appointment_completed'
                            ? 'bg-yellow-100'
                            : notification.notification_type === 'appointment_confirmed'
                            ? 'bg-green-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        {notification.notification_type === 'appointment_completed' ? (
                          <StarIcon className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <BellIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {format(parseISO(notification.created_at), 'MMM d, yyyy • h:mm a')}
                        </p>
                        {notification.notification_type === 'appointment_completed' && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-primary-600">
                              Click to leave a review →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Review Modal */}
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setReviewRating(0)
            setReviewTitle('')
            setReviewComment('')
          }}
          title="How was your consultation?"
        >
          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= reviewRating ? (
                      <StarIconSolid className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {reviewRating === 0
                  ? 'Select a rating'
                  : reviewRating === 1
                  ? 'Poor'
                  : reviewRating === 2
                  ? 'Fair'
                  : reviewRating === 3
                  ? 'Good'
                  : reviewRating === 4
                  ? 'Very Good'
                  : 'Excellent'}
              </p>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                maxLength={100}
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share details about your experience..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewComment.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={submitReview}
                disabled={reviewMutation.isPending}
                className="flex-1"
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false)
                  setReviewRating(0)
                  setReviewTitle('')
                  setReviewComment('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

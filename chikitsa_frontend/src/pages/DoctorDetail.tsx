/**
 * Doctor detail page with booking functionality.
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, addDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { doctorsAPI, appointmentsAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface TimeSlot {
  time: string
  display: string
  available: boolean
}

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  
  // Fetch doctor details
  const { data: doctorData, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorsAPI.getDoctor(id!),
    enabled: !!id,
  })

  const doctor = doctorData?.data
  usePageTitle(doctor ? `Dr. ${doctor.user?.full_name}` : 'Doctor Profile')
  
  // Fetch availability for selected date
  const { data: availabilityData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      doctorsAPI.getAvailability(id!, format(selectedDate, 'yyyy-MM-dd')),
    enabled: !!id,
  })
  
  // Fetch reviews
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => doctorsAPI.getReviews(id!),
    enabled: !!id,
  })
  
  // Book appointment mutation
  const bookAppointment = useMutation({
    mutationFn: (data: {
      doctor_id: string
      appointment_date: string
      time_slot: string
      patient_symptoms?: string
    }) => appointmentsAPI.createAppointment(data),
    onSuccess: async (response: any) => {
      // The response.data contains the appointment object directly
      const appointmentId = response.data?.id || response?.id || (response as any)?.id
      
      if (!appointmentId) {
        console.error('No appointment ID in response:', response)
        toast.error('Booking created but could not process payment.')
        setShowBookingModal(false)
        navigate('/appointments')
        return
      }
      
      // Automatically process payment after booking
      try {
        await appointmentsAPI.payForAppointment(appointmentId, 'card')
        toast.success('Appointment booked and payment successful!')
        setShowBookingModal(false)
        navigate('/appointments')
      } catch (error) {
        toast.error('Booking created but payment failed. Please complete payment from My Appointments.')
        setShowBookingModal(false)
        navigate('/appointments')
      }
    },
    onError: () => {
      toast.error('Failed to book appointment')
    },
  })
  
  if (isLoading) return <PageLoading />
  
  // Transform backend string array to TimeSlot objects
  const rawSlots = availabilityData?.data?.available_slots || []
  const slots: TimeSlot[] = rawSlots.map((slot: string) => ({
    time: slot,
    display: slot,
    available: true,
  }))
  const reviews = reviewsData?.data?.results || []
  
  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Doctor not found</p>
      </div>
    )
  }
  
  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment')
      navigate('/login', { state: { from: `/doctors/${id}` } })
      return
    }
    
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }
    
    setShowBookingModal(true)
  }
  
  const confirmBooking = () => {
    bookAppointment.mutate({
      doctor_id: id!,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedSlot!,
      patient_symptoms: symptoms,
    })
  }
  
  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))
  
  return (
    <div className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Doctor Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="mb-6 sm:mb-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  {doctor.user?.avatar ? (
                    <img
                      src={doctor.user.avatar}
                      alt={doctor.user.full_name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl gradient-bg flex items-center justify-center">
                      <span className="text-white text-3xl sm:text-4xl font-bold">
                        {doctor.user.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Dr. {doctor.user.full_name}
                  </h1>
                  <p className="text-primary-600 font-medium mb-2">
                    {doctor.specialty?.name}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarSolidIcon
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(doctor.average_rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {doctor.average_rating} ({doctor.total_reviews} reviews)
                    </span>
                  </div>
                  
                  {/* Quick Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {doctor.education}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {doctor.years_of_experience} years exp
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BuildingOffice2Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {doctor.clinic_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyRupeeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        ₹{doctor.consultation_fee} fee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* About */}
              {doctor.bio && (
                <div className="mt-6 pt-6 border-t dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                  <p className="text-gray-600 dark:text-gray-300">{doctor.bio}</p>
                </div>
              )}
              
              {/* Clinic Info */}
              <div className="mt-6 pt-6 border-t dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Clinic Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {doctor.full_address || `${doctor.clinic_address}, ${doctor.clinic_city}`}
                    </span>
                  </div>
                  {doctor.clinic_phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {doctor.clinic_phone}
                      </span>
                    </div>
                  )}
                  {doctor.user.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">{doctor.user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Reviews */}
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Patient Reviews ({reviews.length})
              </h3>
              
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: {
                    id: number
                    patient_name: string
                    rating: number
                    title: string
                    comment: string
                    created_at: string
                  }) => (
                    <div
                      key={review.id}
                      className="border-b dark:border-slate-700 pb-4 last:border-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 text-sm font-medium">
                              {review.patient_name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {review.patient_name}
                          </span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarSolidIcon
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          {review.title}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {format(parseISO(review.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
          
          {/* Booking Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="lg:sticky lg:top-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                Book Appointment
              </h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedSlot(null)
                      }}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        format(date, 'yyyy-MM-dd') ===
                        format(selectedDate, 'yyyy-MM-dd')
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-xs font-medium">
                        {format(date, 'EEE')}
                      </p>
                      <p className="text-lg font-bold">{format(date, 'd')}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Available Time Slots
                </label>
                
                {isLoadingSlots ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No slots available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                    {slots.map((slot: TimeSlot) => (
                      <button
                        key={slot.time}
                        onClick={() =>
                          slot.available && setSelectedSlot(slot.time)
                        }
                        disabled={!slot.available}
                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                          !slot.available
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                            : selectedSlot === slot.time
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Fee Info */}
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Consultation Fee</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{doctor.consultation_fee}
                  </span>
                </div>
              </div>
              
              {/* Book Button */}
              <Button
                onClick={handleBookAppointment}
                className="w-full"
                size="lg"
                disabled={!selectedSlot}
              >
                {selectedSlot ? 'Book Appointment' : 'Select a time slot'}
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Appointment"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-primary-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dr. {doctor.user.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedSlot}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Describe your symptoms (optional)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700 dark:text-white"
              placeholder="Enter your symptoms or reason for visit..."
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowBookingModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBooking}
              isLoading={bookAppointment.isPending}
              className="flex-1"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

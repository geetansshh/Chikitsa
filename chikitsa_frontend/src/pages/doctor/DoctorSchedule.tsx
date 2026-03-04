/**
 * Doctor Schedule - Manage availability and working hours.
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format, addDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface Schedule {
  id: number
  day_of_week: number
  day_name: string
  start_time: string
  end_time: string
  slot_duration: number
  is_available: boolean
}

interface Leave {
  id: number
  start_date: string
  end_date: string
  reason: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
]

export default function DoctorSchedule() {
  usePageTitle('Manage Schedule')
  const queryClient = useQueryClient()
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  
  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration: 30,
  })
  
  // Leave form state
  const [leaveForm, setLeaveForm] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    reason: '',
  })

  // Fetch schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ['doctor-schedules'],
    queryFn: async () => {
      const response = await api.get('/doctors/me/schedules/')
      return response.data
    },
  })

  // Fetch leaves
  const { data: leaves, isLoading: leavesLoading } = useQuery<Leave[]>({
    queryKey: ['doctor-leaves'],
    queryFn: async () => {
      const response = await api.get('/doctors/me/leaves/')
      return response.data
    },
  })

  // Create/Update schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: typeof scheduleForm) => {
      if (editingSchedule) {
        return api.patch(`/doctors/me/schedules/${editingSchedule.id}/`, data)
      }
      return api.post('/doctors/me/schedules/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] })
      toast.success(editingSchedule ? 'Schedule updated!' : 'Schedule added!')
      setIsScheduleModalOpen(false)
      setEditingSchedule(null)
      resetScheduleForm()
    },
    onError: () => {
      toast.error('Failed to save schedule')
    },
  })

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/doctors/me/schedules/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedules'] })
      toast.success('Schedule removed')
    },
  })

  // Create leave mutation
  const leaveMutation = useMutation({
    mutationFn: async (data: typeof leaveForm) => {
      return api.post('/doctors/me/leaves/', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-leaves'] })
      toast.success('Leave added!')
      setIsLeaveModalOpen(false)
      resetLeaveForm()
    },
    onError: () => {
      toast.error('Failed to add leave')
    },
  })

  // Delete leave mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/doctors/me/leaves/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-leaves'] })
      toast.success('Leave cancelled')
    },
  })

  const resetScheduleForm = () => {
    setScheduleForm({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration: 30,
    })
  }

  const resetLeaveForm = () => {
    setLeaveForm({
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      reason: '',
    })
  }

  const openEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setScheduleForm({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
      slot_duration: schedule.slot_duration,
    })
    setIsScheduleModalOpen(true)
  }

  if (schedulesLoading || leavesLoading) return <PageLoading />

  // Group schedules by day
  const schedulesByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    schedule: schedules?.find((s) => s.day_of_week === day.value),
  }))

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Schedule Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Set your availability and manage leaves</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary-500" />
                Weekly Schedule
              </h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSchedule(null)
                  resetScheduleForm()
                  setIsScheduleModalOpen(true)
                }}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Slot
              </Button>
            </div>

            <div className="space-y-3">
              {schedulesByDay.map((day, index) => (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg ${
                    day.schedule ? 'bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20' : 'bg-gray-50 dark:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        day.schedule ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {day.label.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{day.label}</p>
                      {day.schedule ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {day.schedule.start_time.slice(0, 5)} -{' '}
                          {day.schedule.end_time.slice(0, 5)} ({day.schedule.slot_duration} min slots)
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Not available</p>
                      )}
                    </div>
                  </div>

                  {day.schedule && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSchedule(day.schedule!)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteScheduleMutation.mutate(day.schedule!.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Leaves */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-orange-500" />
                Upcoming Leaves
              </h2>
              <Button size="sm" variant="secondary" onClick={() => setIsLeaveModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {leaves && leaves.length > 0 ? (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(parseISO(leave.start_date), 'MMM d')} -{' '}
                          {format(parseISO(leave.end_date), 'MMM d, yyyy')}
                        </p>
                        {leave.reason && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{leave.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteLeaveMutation.mutate(leave.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <CalendarDaysIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm">No upcoming leaves</p>
              </div>
            )}
          </Card>

          {/* Note */}
          <Card className="mt-6 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Note</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                  Adding leave will automatically block new bookings for those dates.
                  Existing appointments won't be affected.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setEditingSchedule(null)
        }}
        title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            scheduleMutation.mutate(scheduleForm)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Day of Week
            </label>
            <select
              value={scheduleForm.day_of_week}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, day_of_week: parseInt(e.target.value) })
              }
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slot Duration (minutes)
            </label>
            <select
              value={scheduleForm.slot_duration}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, slot_duration: parseInt(e.target.value) })
              }
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={scheduleMutation.isPending}>
              {editingSchedule ? 'Update' : 'Add'} Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Add Leave"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            leaveMutation.mutate(leaveForm)
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={leaveForm.start_date}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, start_date: e.target.value })
                }
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={leaveForm.end_date}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, end_date: e.target.value })
                }
                min={leaveForm.start_date}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="e.g., Medical conference, Vacation"
              rows={3}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 resize-none dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsLeaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={leaveMutation.isPending}>
              Add Leave
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

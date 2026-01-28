/**
 * API client for the Chikitsa backend.
 * Centralized API configuration and request handling.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          
          const { access } = response.data
          useAuthStore.getState().setTokens(access, refreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      }
    }
    
    // Handle other errors
    const message = (error.response?.data as { error?: { message?: string } })?.error?.message 
      || 'An error occurred'
    
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default api

// API endpoints grouped by resource
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login/', { email, password }),
  
  register: (data: {
    email: string
    password1: string
    password2: string
    first_name: string
    last_name: string
    role?: string
    phone?: string
    // Doctor-specific fields
    specialty_id?: number
    license_number?: string
    years_of_experience?: number
    education?: string
    bio?: string
    clinic_name?: string
    clinic_address?: string
    clinic_city?: string
    clinic_state?: string
    clinic_zip?: string
    clinic_phone?: string
    consultation_fee?: number
  }) => api.post('/auth/registration/', data),
  
  logout: () => api.post('/auth/logout/'),
  
  getProfile: () => api.get('/auth/profile/'),
  
  updateProfile: (data: Record<string, unknown>) => 
    api.patch('/auth/profile/', data),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/profile/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
}

export const doctorsAPI = {
  getSpecialties: () => api.get('/doctors/specialties/'),
  
  getDoctors: (params?: Record<string, string | number>) => 
    api.get('/doctors/', { params }),
  
  getDoctor: (id: string) => api.get(`/doctors/${id}/`),
  
  getAvailability: (doctorId: string, date: string) =>
    api.get(`/doctors/${doctorId}/availability/`, { params: { date } }),
  
  getReviews: (doctorId: string) => api.get(`/doctors/${doctorId}/reviews/`),
  
  createReview: (doctorId: string, data: {
    rating: number
    title?: string
    comment: string
  }) => api.post(`/doctors/${doctorId}/reviews/create/`, data),
  
  // Doctor self-management APIs
  getMyProfile: () => api.get('/doctors/me/'),
  
  updateMyProfile: (data: Record<string, unknown>) =>
    api.patch('/doctors/me/', data),
  
  getMySchedules: () => api.get('/doctors/me/schedules/'),
  
  createSchedule: (data: {
    day_of_week: number
    start_time: string
    end_time: string
    slot_duration: number
  }) => api.post('/doctors/me/schedules/', data),
  
  updateSchedule: (id: number, data: Record<string, unknown>) =>
    api.patch(`/doctors/me/schedules/${id}/`, data),
  
  deleteSchedule: (id: number) => api.delete(`/doctors/me/schedules/${id}/`),
  
  getMyLeaves: () => api.get('/doctors/me/leaves/'),
  
  createLeave: (data: {
    start_date: string
    end_date: string
    reason?: string
  }) => api.post('/doctors/me/leaves/', data),
  
  deleteLeave: (id: number) => api.delete(`/doctors/me/leaves/${id}/`),
}

export const appointmentsAPI = {
  getAppointments: (params?: Record<string, string>) => 
    api.get('/appointments/', { params }),
  
  getAppointment: (id: string) => api.get(`/appointments/${id}/`),
  
  createAppointment: (data: {
    doctor_id: string
    appointment_date: string
    time_slot: string
    appointment_type?: string
    patient_symptoms?: string
  }) => api.post('/appointments/', data),
  
  cancelAppointment: (id: string, reason: string) =>
    api.post(`/appointments/${id}/cancel/`, { reason }),
  
  rescheduleAppointment: (id: string, newDate: string, newTimeSlot: string) =>
    api.post(`/appointments/${id}/reschedule/`, {
      new_date: newDate,
      new_time_slot: newTimeSlot,
    }),
  
  // Doctor-specific actions
  confirmAppointment: (id: string) =>
    api.post(`/appointments/${id}/confirm/`),
  
  completeAppointment: (id: string, data?: {
    doctor_notes?: string
    prescription?: string
    diagnosis?: string
  }) => api.post(`/appointments/${id}/complete/`, data),
  
  // Patient payment
  payForAppointment: (id: string, paymentMethod: string = 'card') =>
    api.post(`/appointments/${id}/payment/`, { payment_method: paymentMethod }),
  
  getUpcoming: (params?: Record<string, string>) => api.get('/appointments/upcoming/', { params }),
  
  getPast: (params?: Record<string, string>) => api.get('/appointments/past/', { params }),
}

export const chatbotAPI = {
  sendMessage: (message: string, conversationId?: string) =>
    api.post('/chatbot/chat/', { message, conversation_id: conversationId }),
  
  getConversations: () => api.get('/chatbot/conversations/'),
  
  getConversation: (id: string) => api.get(`/chatbot/conversations/${id}/`),
  
  deleteConversation: (id: string) => api.delete(`/chatbot/conversations/${id}/`),
  
  analyzeSymptoms: (data: {
    symptoms: string[]
    duration: string
    severity: string
    additional_info?: string
  }) => api.post('/chatbot/symptoms/analyze/', data),
  
  getHealthTip: (category?: string) =>
    api.get('/chatbot/health-tips/', { params: { category } }),
  
  getQuickReplies: () => api.get('/chatbot/quick-replies/'),
  
  submitFeedback: (messageId: number, data: {
    rating: number
    feedback_type: string
    comment?: string
  }) => api.post('/chatbot/feedback/', { message: messageId, ...data }),
}

export const analyticsAPI = {
  getPatientDashboard: () => api.get('/analytics/dashboard/patient/'),
  getDoctorDashboard: () => api.get('/analytics/dashboard/doctor/'),
  getAdminDashboard: () => api.get('/analytics/dashboard/admin/'),
}

export const notificationsAPI = {
  getNotifications: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
  getPreferences: () => api.get('/notifications/preferences/'),
  updatePreferences: (data: Record<string, boolean>) =>
    api.patch('/notifications/preferences/', data),
}

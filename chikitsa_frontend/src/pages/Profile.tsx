/**
 * Patient Profile - Edit user profile information.
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone: string
  role: string
  date_of_birth: string | null
  gender: string
  address: string
  avatar: string | null
  is_verified: boolean
  created_at: string
}

export default function Profile() {
  usePageTitle('My Profile')
  const queryClient = useQueryClient()
  const { user: authUser, login } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Fetch profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await authAPI.getProfile()
      return response.data
    },
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || '',
      })
    }
  }, [profile])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      
      // Update auth store with new user data
      if (authUser) {
        login(
          { ...authUser, ...response.data },
          useAuthStore.getState().accessToken || '',
          useAuthStore.getState().refreshToken || ''
        )
      }
      
      toast.success('Profile updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => authAPI.changePassword(passwordData.old_password, passwordData.new_password),
    onSuccess: () => {
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      toast.success('Password changed successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to change password'
      toast.error(message)
    },
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    changePasswordMutation.mutate()
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gray-50 dark:bg-slate-900 py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your personal information and security</p>
        </motion.div>

        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {profile?.first_name?.charAt(0)}
                  {profile?.last_name?.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {profile?.full_name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base truncate">{profile?.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                    {profile?.role}
                  </span>
                  {profile?.is_verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <UserCircleIcon className="w-5 h-5 inline-block mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <LockClosedIcon className="w-5 h-5 inline-block mr-2" />
                Security
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      leftIcon={<UserCircleIcon className="w-5 h-5" />}
                      required
                    />
                    
                    <Input
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      leftIcon={<UserCircleIcon className="w-5 h-5" />}
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Input
                      label="Email Address"
                      value={profile?.email || ''}
                      leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      leftIcon={<PhoneIcon className="w-5 h-5" />}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="border-t dark:border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      leftIcon={<CalendarIcon className="w-5 h-5" />}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={updateProfileMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                  
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.old_password}
                      onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                      leftIcon={<LockClosedIcon className="w-5 h-5" />}
                      required
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      leftIcon={<LockClosedIcon className="w-5 h-5" />}
                      helperText="Minimum 8 characters"
                      required
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      leftIcon={<LockClosedIcon className="w-5 h-5" />}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={changePasswordMutation.isPending}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

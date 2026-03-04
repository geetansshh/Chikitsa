/**
 * Doctor Profile - Edit profile information.
 */

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import usePageTitle from '@/hooks/usePageTitle'
import {
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  StarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'

interface DoctorProfile {
  id: string
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string
  }
  specialty: {
    id: number
    name: string
  }
  license_number: string
  years_of_experience: number
  education: string
  bio: string
  clinic_name: string
  clinic_address: string
  clinic_city: string
  clinic_state: string
  clinic_zip: string
  clinic_phone: string
  consultation_fee: number
  video_consultation_fee: number
  average_rating: number
  total_reviews: number
  is_verified: boolean
  is_accepting_patients: boolean
  languages: string
}

export default function DoctorProfile() {
  usePageTitle('Doctor Profile')
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    years_of_experience: 0,
    education: '',
    clinic_name: '',
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_zip: '',
    clinic_phone: '',
    consultation_fee: 0,
    video_consultation_fee: 0,
    languages: '',
    is_accepting_patients: true,
  })

  // Fetch profile
  const { data: profile, isLoading } = useQuery<DoctorProfile>({
    queryKey: ['doctor-profile'],
    queryFn: async () => {
      const response = await api.get('/doctors/me/')
      return response.data
    },
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.user.first_name,
        last_name: profile.user.last_name,
        phone: profile.user.phone || '',
        bio: profile.bio || '',
        years_of_experience: profile.years_of_experience,
        education: profile.education || '',
        clinic_name: profile.clinic_name || '',
        clinic_address: profile.clinic_address || '',
        clinic_city: profile.clinic_city || '',
        clinic_state: profile.clinic_state || '',
        clinic_zip: profile.clinic_zip || '',
        clinic_phone: profile.clinic_phone || '',
        consultation_fee: profile.consultation_fee,
        video_consultation_fee: profile.video_consultation_fee || 0,
        languages: profile.languages || 'English',
        is_accepting_patients: profile.is_accepting_patients,
      })
    }
  }, [profile])

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Update user info
      await api.patch('/auth/profile/', {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      })
      // Update doctor profile
      return api.patch('/doctors/me/', {
        bio: data.bio,
        clinic_name: data.clinic_name,
        clinic_address: data.clinic_address,
        clinic_city: data.clinic_city,
        clinic_state: data.clinic_state,
        clinic_zip: data.clinic_zip,
        clinic_phone: data.clinic_phone,
        consultation_fee: data.consultation_fee,
        video_consultation_fee: data.video_consultation_fee,
        languages: data.languages,
        is_accepting_patients: data.is_accepting_patients,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] })
      toast.success('Profile updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (isLoading) return <PageLoading />

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your professional profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Overview Card */}
        <div>
          <Card className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">
                {profile?.user.first_name?.charAt(0)}
                {profile?.user.last_name?.charAt(0)}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dr. {profile?.user.first_name} {profile?.user.last_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{profile?.specialty?.name}</p>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              {profile?.is_verified && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckBadgeIcon className="w-5 h-5" />
                  Verified
                </span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <StarIcon className="w-5 h-5" />
                  Rating
                </span>
                <span className="font-semibold dark:text-white">
                  {Number(profile?.average_rating || 0).toFixed(1)} ({profile?.total_reviews || 0} reviews)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5" />
                  Experience
                </span>
                <span className="font-semibold dark:text-white">{profile?.years_of_experience} years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CurrencyRupeeIcon className="w-5 h-5" />
                  Consultation Fee
                </span>
                <span className="font-semibold dark:text-white">₹{profile?.consultation_fee}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-primary-500" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="Email"
                  value={profile?.user.email || ''}
                  disabled
                />
              </div>
            </Card>

            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-primary-500" />
                Professional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="MBBS, MD - Harvard Medical School"
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.years_of_experience.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  disabled
                />
                <Input
                  label="Consultation Fee ($)"
                  type="number"
                  value={formData.consultation_fee.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Video Consultation Fee ($)"
                  type="number"
                  value={formData.video_consultation_fee.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, video_consultation_fee: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio / About
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell patients about yourself, your expertise, and approach to care..."
                  rows={4}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white"
                />
              </div>
            </Card>

            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                Clinic Information
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Clinic Name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  placeholder="Your Clinic Name"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Clinic Address
                  </label>
                  <textarea
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                    placeholder="Full clinic address"
                    rows={2}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.clinic_city}
                    onChange={(e) => setFormData({ ...formData, clinic_city: e.target.value })}
                    placeholder="New York"
                  />
                  <Input
                    label="State"
                    value={formData.clinic_state}
                    onChange={(e) => setFormData({ ...formData, clinic_state: e.target.value })}
                    placeholder="NY"
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.clinic_zip}
                    onChange={(e) => setFormData({ ...formData, clinic_zip: e.target.value })}
                    placeholder="10001"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Clinic Phone"
                    value={formData.clinic_phone}
                    onChange={(e) => setFormData({ ...formData, clinic_phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Input
                    label="Languages Spoken"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="English, Spanish"
                  />
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_accepting_patients}
                    onChange={(e) => setFormData({ ...formData, is_accepting_patients: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Currently accepting new patients
                  </label>
                </div>
              </div>
            </Card>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

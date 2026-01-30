/**
 * Registration page.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI, doctorsAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  SparklesIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  role: 'PATIENT' | 'DOCTOR'
  // Doctor fields
  specialtyId: string
  licenseNumber: string
  yearsOfExperience: string
  education: string
  bio: string
  clinicName: string
  clinicAddress: string
  clinicCity: string
  clinicState: string
  clinicZip: string
  clinicPhone: string
  consultationFee: string
}

interface Specialty {
  id: number
  name: string
  slug: string
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const requireDoctorVerification = import.meta.env.VITE_REQUIRE_DOCTOR_VERIFICATION === 'true'
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'PATIENT',
    // Doctor fields
    specialtyId: '',
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    bio: '',
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicZip: '',
    clinicPhone: '',
    consultationFee: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  // Fetch specialties for doctor registration
  const { data: specialtiesResponse } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => doctorsAPI.getSpecialties(),
  })
  
  const specialties = (specialtiesResponse?.data || []) as Specialty[]
  
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  const registerMutation = useMutation({
    mutationFn: () => {
      const baseData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
      }
      
      // Add doctor-specific fields if role is DOCTOR
      if (formData.role === 'DOCTOR') {
        return authAPI.register({
          ...baseData,
          specialty_id: parseInt(formData.specialtyId),
          license_number: formData.licenseNumber,
          years_of_experience: parseInt(formData.yearsOfExperience),
          education: formData.education,
          bio: formData.bio,
          clinic_name: formData.clinicName,
          clinic_address: formData.clinicAddress,
          clinic_city: formData.clinicCity,
          clinic_state: formData.clinicState,
          clinic_zip: formData.clinicZip,
          clinic_phone: formData.clinicPhone,
          consultation_fee: parseFloat(formData.consultationFee),
        })
      }
      
      return authAPI.register(baseData)
    },
    onSuccess: async (response) => {
      const verificationRequired = formData.role === 'DOCTOR' && requireDoctorVerification

      if (verificationRequired) {
        toast.success('Doctor account created! Please wait for admin verification.')
        navigate('/doctor/pending')
        return
      }

      const { access, refresh, user } = response.data
      login(user, access, refresh)

      if (formData.role === 'DOCTOR') {
        toast.success('Doctor account created successfully!')
      } else {
        toast.success('Account created successfully!')
      }

      navigate('/my-account')
    },
    onError: (error: {
      response?: {
        data?: Record<string, string[]>
      }
    }) => {
      const responseErrors = error.response?.data
      if (responseErrors) {
        const newErrors: Record<string, string> = {}
        Object.entries(responseErrors).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            if (key === 'password1') newErrors.password = messages[0]
            else if (key === 'password2') newErrors.confirmPassword = messages[0]
            else if (key === 'first_name') newErrors.firstName = messages[0]
            else if (key === 'last_name') newErrors.lastName = messages[0]
            else newErrors[key] = messages[0]
          }
        })
        setErrors(newErrors)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (!acceptTerms)
      newErrors.terms = 'You must accept the terms and conditions'
    
    // Doctor-specific validation
    if (formData.role === 'DOCTOR') {
      if (!formData.specialtyId) newErrors.specialtyId = 'Specialty is required'
      if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required'
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required'
      if (!formData.clinicName) newErrors.clinicName = 'Clinic name is required'
      if (!formData.clinicAddress) newErrors.clinicAddress = 'Clinic address is required'
      if (!formData.clinicCity) newErrors.clinicCity = 'City is required'
      if (!formData.clinicPhone) newErrors.clinicPhone = 'Clinic phone is required'
      if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    registerMutation.mutate()
  }
  
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${formData.role === 'DOCTOR' ? 'max-w-2xl' : 'max-w-md'} transition-all duration-300`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 mt-2">
            Start your health journey with Chikitsa
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('role', 'PATIENT')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'PATIENT'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className={`w-6 h-6 mx-auto mb-2 ${
                    formData.role === 'PATIENT' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'PATIENT' ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('role', 'DOCTOR')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'DOCTOR'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BriefcaseIcon className={`w-6 h-6 mx-auto mb-2 ${
                    formData.role === 'DOCTOR' ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.role === 'DOCTOR' ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    Doctor
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                error={errors.firstName}
                placeholder="John"
                leftIcon={<UserIcon className="w-5 h-5" />}
                autoComplete="given-name"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </div>
            
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1 (555) 000-0000"
              leftIcon={<PhoneIcon className="w-5 h-5" />}
              autoComplete="tel"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              placeholder="At least 8 characters"
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              autoComplete="new-password"
            />
            
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              autoComplete="new-password"
            />
            
            {/* Doctor-specific fields */}
            {formData.role === 'DOCTOR' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t"
              >
                <h3 className="text-sm font-semibold text-gray-900">Professional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.specialtyId}
                      onChange={(e) => updateField('specialtyId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.specialtyId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select specialty</option>
                      {specialties.map((specialty) => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                    {errors.specialtyId && (
                      <p className="mt-1 text-sm text-red-500">{errors.specialtyId}</p>
                    )}
                  </div>
                  
                  <Input
                    label="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => updateField('licenseNumber', e.target.value)}
                    error={errors.licenseNumber}
                    placeholder="ABC12345"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateField('yearsOfExperience', e.target.value)}
                    error={errors.yearsOfExperience}
                    placeholder="5"
                    min="0"
                    required
                  />
                  
                  <Input
                    label="Consultation Fee ($)"
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => updateField('consultationFee', e.target.value)}
                    error={errors.consultationFee}
                    placeholder="100"
                    min="0"
                    step="0.01"
                    leftIcon={<CurrencyDollarIcon className="w-5 h-5" />}
                    required
                  />
                </div>
                
                <Input
                  label="Education & Certifications"
                  value={formData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                  error={errors.education}
                  placeholder="MD, Harvard Medical School"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Brief description of your practice and expertise..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <h3 className="text-sm font-semibold text-gray-900 pt-2">Clinic Information</h3>
                
                <Input
                  label="Clinic Name"
                  value={formData.clinicName}
                  onChange={(e) => updateField('clinicName', e.target.value)}
                  error={errors.clinicName}
                  placeholder="Main Street Medical Center"
                  leftIcon={<BuildingOfficeIcon className="w-5 h-5" />}
                  required
                />
                
                <Input
                  label="Clinic Address"
                  value={formData.clinicAddress}
                  onChange={(e) => updateField('clinicAddress', e.target.value)}
                  error={errors.clinicAddress}
                  placeholder="123 Main St, Suite 100"
                  required
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.clinicCity}
                    onChange={(e) => updateField('clinicCity', e.target.value)}
                    error={errors.clinicCity}
                    placeholder="New York"
                    required
                  />
                  
                  <Input
                    label="State"
                    value={formData.clinicState}
                    onChange={(e) => updateField('clinicState', e.target.value)}
                    error={errors.clinicState}
                    placeholder="NY"
                  />
                  
                  <Input
                    label="ZIP Code"
                    value={formData.clinicZip}
                    onChange={(e) => updateField('clinicZip', e.target.value)}
                    error={errors.clinicZip}
                    placeholder="10001"
                  />
                </div>
                
                <Input
                  label="Clinic Phone"
                  type="tel"
                  value={formData.clinicPhone}
                  onChange={(e) => updateField('clinicPhone', e.target.value)}
                  error={errors.clinicPhone}
                  placeholder="+1 (555) 000-0000"
                  leftIcon={<PhoneIcon className="w-5 h-5" />}
                  required
                />
              </motion.div>
            )}
            
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={registerMutation.isPending}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

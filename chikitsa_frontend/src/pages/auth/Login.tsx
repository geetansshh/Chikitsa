/**
 * Login page.
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import {
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const fromLocation = (location.state as { from?: string })?.from
  
  const getRedirectPath = (userRole: string) => {
    // If there's a specific location to return to, use it
    if (fromLocation) return fromLocation
    // Otherwise redirect based on role
    return userRole === 'DOCTOR' ? '/doctor' : '/dashboard'
  }
  
  const loginMutation = useMutation({
    mutationFn: () => authAPI.login(email, password),
    onSuccess: async (response) => {
      const { access, refresh, user } = response.data
      login(user, access, refresh)
      toast.success('Welcome back!')
      navigate(getRedirectPath(user.role))
    },
    onError: (error: { response?: { data?: { non_field_errors?: string[] } } }) => {
      const message =
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid email or password'
      toast.error(message)
      setErrors({ general: message })
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    loginMutation.mutate()
  }
  
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">
            Sign in to your Chikitsa account
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter your password"
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              autoComplete="current-password"
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>
            
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loginMutation.isPending}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-gray-700 mb-1">👤 Patient</p>
              <p className="text-gray-600">patient@demo.com</p>
              <p className="text-gray-500">demo123456</p>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <p className="font-medium text-gray-700 mb-1">🩺 Doctor</p>
              <p className="text-gray-600">doctor@demo.com</p>
              <p className="text-gray-500">demo123456</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

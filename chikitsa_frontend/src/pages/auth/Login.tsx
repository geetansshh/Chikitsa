/**
 * Login page.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import usePageTitle from '@/hooks/usePageTitle'
import {
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function Login() {
  usePageTitle('Sign In')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const locationState = location.state as { from?: string; reason?: string } | null
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const fromLocation = locationState?.from

  useEffect(() => {
    if (locationState?.reason !== 'inactive') return
    toast.error('You were logged out due to inactivity.')
    navigate('/login', { replace: true, state: {} })
  }, [locationState?.reason, navigate])
  
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-8 sm:py-12 px-4">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Sign in to your Chikitsa account
          </p>
        </div>
        
        <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl border border-white/40 dark:border-slate-700 shadow-xl">
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
                <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>
            
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
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
            <p className="text-gray-500 dark:text-gray-400">
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
        <div className="mt-6 p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg rounded-lg border border-white/40 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
            Demo Credentials
          </p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <button
              type="button"
              onClick={() => { setEmail('patient@demo.com'); setPassword('demo123456') }}
              className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-left cursor-pointer"
            >
              <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">👤 Patient</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">patient@demo.com</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">demo123456</p>
            </button>
            <button
              type="button"
              onClick={() => { setEmail('doctor@demo.com'); setPassword('demo123456') }}
              className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-left cursor-pointer"
            >
              <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">🩺 Doctor</p>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm truncate">doctor@demo.com</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">demo123456</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Forgot Password page — request a password reset email.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import usePageTitle from '@/hooks/usePageTitle'
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'

export default function ForgotPassword() {
  usePageTitle('Forgot Password')

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const resetMutation = useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Reset link sent! Check your email.')
    },
    onError: () => {
      // Don't reveal whether the email exists for security
      setSubmitted(true)
      toast.success('If an account exists, a reset link was sent.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    resetMutation.mutate(email)
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-8 sm:py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {submitted ? 'Check your email' : 'Forgot your password?'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {submitted
              ? 'We sent a password reset link to your email address.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </p>
        </div>

        <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl border border-white/40 dark:border-slate-700 shadow-xl">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive
                a password reset email shortly.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="w-full"
                >
                  Try another email
                </Button>
                <Link to="/login" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                placeholder="you@example.com"
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={resetMutation.isPending}
                rightIcon={<PaperAirplaneIcon className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

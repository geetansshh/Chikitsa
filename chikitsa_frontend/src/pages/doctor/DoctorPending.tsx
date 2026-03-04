/**
 * Doctor Pending Verification page.
 */

import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import usePageTitle from '@/hooks/usePageTitle'

export default function DoctorPending() {
  usePageTitle('Verification Pending')
  const { user } = useAuthStore()

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gray-50 dark:bg-slate-900 py-8 sm:py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center text-2xl">
            ⏳
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Your doctor account is under review
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Thanks{user?.first_name ? `, ${user.first_name}` : ''}! Our team is verifying your
            details. This usually takes a short time.
          </p>
          <div className="mt-6 space-y-3">
            <Link to="/" className="inline-block">
              <Button>Back to Home</Button>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We’ll notify you once you’re verified.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

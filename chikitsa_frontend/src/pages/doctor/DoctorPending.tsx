/**
 * Doctor Pending Verification page.
 */

import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function DoctorPending() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">
            ⏳
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Your doctor account is under review
          </h1>
          <p className="text-gray-600 mt-2">
            Thanks{user?.first_name ? `, ${user.first_name}` : ''}! Our team is verifying your
            details. This usually takes a short time.
          </p>
          <div className="mt-6 space-y-3">
            <Link to="/" className="inline-block">
              <Button>Back to Home</Button>
            </Link>
            <p className="text-sm text-gray-500">
              We’ll notify you once you’re verified.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

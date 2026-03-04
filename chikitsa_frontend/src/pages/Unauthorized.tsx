/**
 * Unauthorized access page.
 */

import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import usePageTitle from '@/hooks/usePageTitle'

export default function Unauthorized() {
  usePageTitle('Access Denied')
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gray-50 dark:bg-slate-900 py-8 sm:py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-2xl">
            ⛔
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Access denied</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You don’t have permission to view this page.
          </p>
          <div className="mt-6">
            <Link to="/" className="inline-block">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

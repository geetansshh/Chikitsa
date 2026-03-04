/**
 * Loading spinner component.
 */

import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className={clsx('flex items-center justify-center', className)} role="status" aria-label="Loading">
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-gray-200 dark:border-slate-600 border-t-primary-500',
          sizes[size]
        )}
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

// Full page loading component
export function PageLoading() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Loading...</p>
      </div>
    </div>
  )
}

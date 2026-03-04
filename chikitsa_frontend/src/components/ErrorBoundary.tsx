/**
 * Error Boundary — catches uncaught React render errors
 * and shows a user-friendly fallback instead of a white screen.
 */

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-white to-primary-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're sorry — an unexpected error occurred. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-gray-100 dark:bg-slate-800 rounded-lg p-4 mb-6 overflow-auto max-h-40 text-red-700 dark:text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors shadow-md"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

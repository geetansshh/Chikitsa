/**
 * 404 Not Found page.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import usePageTitle from '@/hooks/usePageTitle'
import {
  HomeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function NotFound() {
  usePageTitle('Page Not Found')

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-8xl sm:text-9xl font-black text-primary-500/20 select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Page not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. 
            Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/">
            <Button
              size="lg"
              leftIcon={<HomeIcon className="w-5 h-5" />}
            >
              Back to Home
            </Button>
          </Link>
          <Link to="/doctors">
            <Button
              variant="outline"
              size="lg"
            >
              Find Doctors
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

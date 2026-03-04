/**
 * Theme toggle button — sun/moon icon with smooth transition.
 */

import { motion } from 'framer-motion'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '@/stores/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative p-2.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-200"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isDark ? (
          <SunIcon className="w-5 h-5 text-yellow-400" />
        ) : (
          <MoonIcon className="w-5 h-5 text-gray-600" />
        )}
      </motion.div>
    </button>
  )
}

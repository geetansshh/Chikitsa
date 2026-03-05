/**
 * Header component — pill-shaped nav, green active dot, warm healthcare design.
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { notificationsAPI } from '@/lib/api'
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Find Doctors', path: '/doctors' },
  { name: 'AI Assistant', path: '/chat' },
  { name: 'Appointments', path: '/appointments' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  
  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => notificationsAPI.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
  
  const unreadCount = unreadData?.data?.unread_count || 0
  
  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const profileRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen])
  
  return (
    <header className="sticky top-0 z-50 bg-cream-50/60 dark:bg-black/80 backdrop-blur-2xl border-b border-white/40 dark:border-slate-700/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">Chikitsa</span>
          </Link>
          
          {/* Desktop Navigation — iOS-style pill nav with translucent hover */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center border border-white/40 dark:border-white/10 rounded-full px-1.5 py-1 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-sm"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              const isHovered = hoveredNav === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={() => setHoveredNav(link.path)}
                  className={`relative flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 z-10 ${
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {/* iOS-style translucent pill background — slides to hovered or active item */}
                  {(isHovered || (!hoveredNav && isActive)) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-sm border border-white/60 dark:border-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="w-1.5 h-1.5 rounded-full bg-primary-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                {user?.role !== 'DOCTOR' && (
                  <Link
                    to="/notifications"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    className="relative p-2.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200"
                  >
                    <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-secondary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold" aria-hidden="true">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <ThemeToggle />
                
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                    className="flex items-center gap-2.5 py-2 px-3 rounded-full hover:bg-white/60 dark:hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {user?.first_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.first_name}
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-2 w-52 bg-white/80 dark:bg-slate-800/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 py-2 overflow-hidden"
                        role="menu"
                      >
                        {/* Doctor-specific links */}
                        {user?.role === 'DOCTOR' ? (
                          <>
                            <Link
                              to="/doctor"
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              Doctor Dashboard
                            </Link>
                            <Link
                              to="/doctor/appointments"
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              My Appointments
                            </Link>
                            <Link
                              to="/doctor/schedule"
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              Manage Schedule
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              Dashboard
                            </Link>
                            <Link
                              to="/appointments"
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              My Appointments
                            </Link>
                          </>
                        )}
                        <hr className="my-1.5 border-gray-100 dark:border-slate-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-secondary-500 text-white px-6 py-2.5 rounded-full hover:bg-secondary-600 transition-colors shadow-sm"
                >
                  Login / Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700"
          >
            <nav aria-label="Mobile navigation" className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                    {link.name}
                  </Link>
                )
              })}
              
              <hr className="my-2 border-gray-100 dark:border-slate-700" />
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'DOCTOR' ? (
                    <Link
                      to="/doctor"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 px-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      Doctor Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 px-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 px-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        Notifications
                        {unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="py-2.5 px-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="py-2.5 px-4 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-sm font-semibold text-center bg-secondary-500 text-white hover:bg-secondary-600"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

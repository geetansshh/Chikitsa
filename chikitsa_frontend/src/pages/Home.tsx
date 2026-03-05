/**
 * Home page — Healium-inspired organic healthcare design.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import usePageTitle from '@/hooks/usePageTitle'

const features = [
  {
    icon: UserGroupIcon,
    title: 'Expert Doctors',
    description:
      'Connect with verified healthcare professionals across various specialties.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'AI Health Assistant',
    description:
      'Get instant health insights powered by advanced AI technology.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Easy Booking',
    description:
      'Book appointments with your preferred doctors in just a few clicks.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure & Private',
    description:
      'Your health data is protected with enterprise-grade security.',
  },
  {
    icon: ClockIcon,
    title: '24/7 Available',
    description:
      'Access healthcare support and AI assistance anytime, anywhere.',
  },
  {
    icon: HeartIcon,
    title: 'Personalized Care',
    description:
      'Receive tailored health recommendations based on your profile.',
  },
]

export default function Home() {
  usePageTitle()

  return (
    <div className="overflow-hidden">
      {/* ───── Hero Section ───── */}
      <section className="relative pt-8 pb-16 lg:pt-12 lg:pb-24 bg-cream-50 dark:bg-black">
        <div className="container mx-auto px-4">
          {/* Heading area */}
          <div className="text-center max-w-5xl mx-auto mb-10 lg:mb-14">
            {/* Subtext + avatar cluster */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-6"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[220px] text-left leading-snug">
                Affordable Healthcare and Medical Services Delivered to Your
                Doorstep
              </p>
              <div className="flex -space-x-2">
                {['A', 'D', 'M'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{
                      backgroundColor: ['#22c55e', '#16a34a', '#15803d'][i],
                    }}
                  >
                    {letter}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center shadow-sm">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight px-2 sm:px-0"
            >
              YOUR HEALTH, OUR PRIORITY —{' '}
              <span className="text-primary-600">HEALTHCARE</span> MADE SIMPLE
            </motion.h1>
          </div>

          {/* ───── Hero Image + floating badges ───── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative max-w-4xl mx-auto mb-10"
          >
            {/* badge: top-left */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[12%] left-0 lg:left-2 z-20 hidden sm:flex items-center gap-2"
            >
              <span className="glass text-sm font-medium text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-full">
                Online Consultations
              </span>
              <span className="w-8 h-8 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <PlusIcon className="w-4 h-4 text-white" />
              </span>
            </motion.div>

            {/* badge: top-right */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-[12%] right-0 lg:right-2 z-20 hidden sm:flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <PlusIcon className="w-4 h-4 text-white" />
              </span>
              <span className="glass text-sm font-medium text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-full">
                AI Health Assistant
              </span>
            </motion.div>

            {/* badge: bottom-left */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[22%] left-0 lg:left-4 z-20 hidden sm:flex items-center gap-2"
            >
              <span className="glass text-sm font-medium text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-full">
                Expert Doctors
              </span>
              <span className="w-8 h-8 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <PlusIcon className="w-4 h-4 text-white" />
              </span>
            </motion.div>

            {/* badge: bottom-right */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-[22%] right-0 lg:right-4 z-20 hidden sm:flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-full bg-primary-500/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <PlusIcon className="w-4 h-4 text-white" />
              </span>
              <span className="glass text-sm font-medium text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-full">
                Easy Booking
              </span>
            </motion.div>

            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mx-4 sm:mx-8 lg:mx-16">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=500&fit=crop"
                alt="Healthcare professionals"
                className="w-full h-[260px] sm:h-[340px] md:h-[400px] lg:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent" />
            </div>
          </motion.div>

          {/* ───── Quick action buttons ───── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <Link to="/doctors" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" rightIcon={<span>→</span>}>
                Find a Doctor
              </Button>
            </Link>
            <Link to="/chat" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Try AI Assistant
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ───── Features Section ───── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-cream-100/50 dark:from-black dark:to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for{' '}
              <span className="text-primary-600">Better Health</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources
              you need to manage your health effectively.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-6 hover:bg-primary-500 transition-all duration-300 border border-white/50 dark:border-gray-800 hover:border-primary-500 hover:shadow-xl shadow-lg"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/20 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-white mb-2 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
        {/* Glass decoration orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who have transformed their healthcare
              experience with Chikitsa.
            </p>
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/90 backdrop-blur-sm text-primary-700 hover:bg-white rounded-full px-8 font-semibold shadow-lg border border-white/50"
              >
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

/**
 * Home page with hero section and features.
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
} from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'

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

const stats = [
  { value: '10,000+', label: 'Patients Served' },
  { value: '500+', label: 'Expert Doctors' },
  { value: '50+', label: 'Specialties' },
  { value: '98%', label: 'Satisfaction Rate' },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary-100/50 to-transparent -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Health,{' '}
                <span className="gradient-text">Our Priority</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Experience the future of healthcare with AI-powered assistance,
                expert doctors, and seamless appointment booking. Your wellness
                journey starts here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors">
                  <Button size="lg" rightIcon={<span>→</span>}>
                    Find a Doctor
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="outline" size="lg">
                    Try AI Assistant
                  </Button>
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Trusted by 10,000+ patients
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-4">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=500&fit=crop"
                  alt="Healthcare professional"
                  className="w-full h-auto rounded-2xl"
                />
                
                {/* Floating card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Verified Doctors
                      </p>
                      <p className="text-xs text-gray-500">500+ specialists</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating card 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute -right-8 bottom-1/4 bg-white rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        AI Assistant
                      </p>
                      <p className="text-xs text-gray-500">24/7 support</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for{' '}
              <span className="gradient-text">Better Health</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources
              you need to manage your health effectively.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of patients who have transformed their healthcare
              experience with Chikitsa.
            </p>
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
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

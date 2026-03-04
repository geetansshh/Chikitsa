/**
 * Footer component — warm, minimal healthcare design.
 */

import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/solid'

const footerLinks = [
  { name: 'Find Doctors', path: '/doctors' },
  { name: 'AI Health Assistant', path: '/chat' },
  { name: 'Book Appointments', path: '/appointments' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-gray-300">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-white">Chikitsa</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Your trusted healthcare companion. Connect with top doctors, get
              AI-powered health insights, and manage your wellness journey.
            </p>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="border-t border-gray-800 dark:border-slate-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Chikitsa. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            Made with{' '}
            <HeartIcon className="w-4 h-4 text-red-500" /> for better
            healthcare
          </p>
        </div>
      </div>
    </footer>
  )
}

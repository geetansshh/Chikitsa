/**
 * Main layout component with header and footer.
 */

import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const isFullHeightPage = location.pathname === '/chat'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream-50 via-white to-primary-50/30 dark:from-black dark:via-black dark:to-black relative">
      {/* Decorative background blobs for glassmorphism depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 dark:bg-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-orange-200/15 dark:bg-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-100/15 dark:bg-transparent rounded-full blur-3xl" />
      </div>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isFullHeightPage && <Footer />}
    </div>
  )
}

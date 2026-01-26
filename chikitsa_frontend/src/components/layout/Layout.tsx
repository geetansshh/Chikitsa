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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isFullHeightPage && <Footer />}
    </div>
  )
}

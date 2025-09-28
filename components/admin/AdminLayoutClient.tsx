'use client'

import * as React from 'react'
import { AdminSidebar, MobileAdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useRouter } from 'next/navigation'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: 'ADMIN' | 'EDITOR'
  }
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      // Call the logout API
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        router.push('/auth/sign-in')
        router.refresh()
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  // Close mobile sidebar when route changes
  React.useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  // Handle escape key to close mobile sidebar
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileAdminSidebar
        userRole={user.role}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Desktop layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            userRole={user.role}
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader
            user={user}
            onMenuToggle={handleMobileSidebarToggle}
            onLogout={handleLogout}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

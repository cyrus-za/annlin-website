'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Users,
  Calendar,
  Newspaper,
  BookOpen,
  Mail,
  UserPlus,
  Settings,
  BarChart3,
  Menu,
  X
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: 'ADMIN' | 'EDITOR'
  isCollapsed?: boolean
  onToggle?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Paneelbord',
    href: '/admin',
    icon: Home,
  },
  {
    name: 'Diensgroepe',
    href: '/admin/diensgroepe',
    icon: Users,
  },
  {
    name: 'Jaarprogram',
    href: '/admin/jaarprogram',
    icon: Calendar,
  },
  {
    name: 'Nuus & Artikels',
    href: '/admin/nuus',
    icon: Newspaper,
  },
  {
    name: 'Leesstof',
    href: '/admin/leesstof',
    icon: BookOpen,
  },
  {
    name: 'Kontak Vorms',
    href: '/admin/contact',
    icon: Mail,
  },
  {
    name: 'Gebruikers',
    href: '/admin/users',
    icon: UserPlus,
    adminOnly: true,
  },
  {
    name: 'Statistieke',
    href: '/admin/statistics',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    name: 'Instellings',
    href: '/admin/settings',
    icon: Settings,
    adminOnly: true,
  },
]

export function AdminSidebar({ userRole, isCollapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  
  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || userRole === 'ADMIN'
  )

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Annlin Gemeente</h2>
              <p className="text-xs text-gray-500">Bestuurder</p>
            </div>
          </div>
        )}
        
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400"
                )} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>Annlin Gemeente CMS</p>
            <p>Weergawe 1.0</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile sidebar overlay
export function MobileAdminSidebar({ 
  userRole, 
  isOpen, 
  onClose 
}: { 
  userRole: 'ADMIN' | 'EDITOR'
  isOpen: boolean
  onClose: () => void 
}) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
        <AdminSidebar userRole={userRole} onToggle={onClose} />
      </div>
    </>
  )
}

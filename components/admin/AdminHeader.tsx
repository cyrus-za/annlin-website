'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ExternalLink
} from 'lucide-react'

interface AdminHeaderProps {
  user: {
    name: string
    email: string
    role: 'ADMIN' | 'EDITOR'
  }
  onMenuToggle?: () => void
  onLogout?: () => void
  notificationCount: number
}

export function AdminHeader({ user, onMenuToggle, onLogout, notificationCount }: AdminHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Maak navigasie oop"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <p className="hidden text-sm font-medium text-gray-700 sm:block">Webwerfbestuur</p>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Webwerf
            </Link>
          </Button>

          {user.role === 'ADMIN' && (
            <Button asChild variant="ghost" size="icon" className="relative" title="Kontakindienings">
              <Link href="/admin/indienings" aria-label={`${notificationCount} nuwe kontakindienings`}>
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 px-3 py-2"
              aria-label="Maak gebruikerskieslys oop"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
            <div className="h-8 w-8 bg-amber-700 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>

            {/* User dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {user.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}
                  </p>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left sm:hidden"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Webwerf</span>
                  </Link>
                  <Link
                    href="/admin/profiel"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <User className="h-4 w-4" />
                    <span>Profiel</span>
                  </Link>
                  <Link
                    href="/admin/verstellings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Verstellings</span>
                  </Link>
                </div>
                
                <div className="border-t border-gray-200 py-2">
                  <button 
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Meld Af</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

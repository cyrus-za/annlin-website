'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/public/ThemeSwitcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ADMIN_NOTIFICATION_STORAGE_PREFIX, type AdminNotification } from '@/lib/admin-notifications'
import { 
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ExternalLink,
  GitCommitHorizontal,
  Inbox,
  MessageSquarePlus,
} from 'lucide-react'

interface AdminHeaderProps {
  user: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'EDITOR'
  }
  onMenuToggle?: () => void
  onLogout?: () => void
  notifications: AdminNotification[]
}

export function AdminHeader({ user, onMenuToggle, onLogout, notifications }: AdminHeaderProps) {
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const [seenIds, setSeenIds] = React.useState<Set<string>>(new Set())
  const [notificationsReady, setNotificationsReady] = React.useState(false)
  const storageKey = `${ADMIN_NOTIFICATION_STORAGE_PREFIX}:${user.id}`
  const unreadNotifications = notifications.filter((notification) => !seenIds.has(notification.id))

  React.useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || '[]') as unknown
      setSeenIds(new Set(Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : []))
    } catch {
      window.localStorage.removeItem(storageKey)
    } finally {
      setNotificationsReady(true)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!notificationsReady || !pathname.startsWith('/admin/veranderingslogboek')) return
    const changelogIds = notifications
      .filter((notification) => notification.kind === 'CHANGELOG')
      .map((notification) => notification.id)
    if (changelogIds.length === 0) return

    setSeenIds((current) => {
      const next = new Set([...current, ...changelogIds])
      if (next.size === current.size) return current
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...next].slice(-500)))
      } catch {
        // The in-memory state remains useful when browser storage is unavailable.
      }
      return next
    })
  }, [notifications, notificationsReady, pathname, storageKey])

  function persistSeen(next: Set<string>) {
    setSeenIds(next)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...next].slice(-500)))
    } catch {
      // The in-memory state remains useful when browser storage is unavailable.
    }
  }

  function markSeen(id: string) {
    persistSeen(new Set([...seenIds, id]))
  }

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`${notificationsReady ? unreadNotifications.length : 0} ongeleesde kennisgewings`}>
                <Bell className="h-5 w-5" />
                {notificationsReady && unreadNotifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">{unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-2">
              <div className="flex items-center justify-between gap-3 px-2 py-1">
                <DropdownMenuLabel className="px-0">Kennisgewings</DropdownMenuLabel>
                {unreadNotifications.length > 0 && <button type="button" onClick={() => persistSeen(new Set([...seenIds, ...unreadNotifications.map((item) => item.id)]))} className="text-xs font-medium text-primary hover:underline">Merk alles as gelees</button>}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                {unreadNotifications.map((notification) => {
                  const Icon = notification.kind === 'CONTACT' ? Inbox : notification.kind === 'FEATURE_REQUEST' ? MessageSquarePlus : GitCommitHorizontal
                  return <DropdownMenuItem key={notification.id} asChild className="items-start p-0"><Link href={notification.href} onClick={() => markSeen(notification.id)} className="flex w-full gap-3 rounded-md px-3 py-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0"><strong className="block truncate text-sm text-foreground">{notification.title}</strong><span className="mt-0.5 block text-xs text-muted-foreground">{notification.description}</span></span></Link></DropdownMenuItem>
                })}
                {notificationsReady && unreadNotifications.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">Geen nuwe kennisgewings nie.</p>}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/admin/veranderingslogboek" className="justify-center font-medium">Bekyk veranderingslogboek</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeSwitcher />

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

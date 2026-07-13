'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Menu, X, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationItem {
  name: string
  href: string
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Tuis',
    href: '/',
  },
  {
    name: 'Oor Ons',
    href: '/oor-annlin-gemeente',
  },
  {
    name: 'Jaarprogram',
    href: '/jaarprogram',
  },
  {
    name: 'Uitsendings',
    href: '/uitsendings',
  },
  {
    name: 'Nuus',
    href: '/nuus',
  },
  {
    name: 'Diensgroepe',
    href: '/diensgroepe',
  },
  {
    name: 'Leesstof',
    href: '/leesstof',
  },
  {
    name: 'Kontak',
    href: '/kontakbesonderhede',
  },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const showAdminLink = Boolean(session)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (!query) return

    setIsSearchOpen(false)
    setIsMobileMenuOpen(false)
    router.push(`/soek?q=${encodeURIComponent(query)}`)
  }

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <nav className="bg-white shadow-sm border-b border-amber-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-amber-200">
                <Image
                  src="/gksa-logo.png"
                  alt="Gereformeerde Kerke in Suid-Afrika"
                  width={40}
                  height={40}
                  className="h-9 w-9 object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className="block text-xl font-bold text-amber-900">Annlin Gemeente</span>
                <p className="text-xs text-amber-700">Gereformeerde Kerk Pretoria-Annlin</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 hover:text-amber-700",
                    isActive 
                      ? "text-amber-800 border-b-2 border-amber-600 pb-1" 
                      : "text-gray-700"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-600 hover:text-amber-700"
                aria-label={isSearchOpen ? 'Maak soektog toe' : 'Soek op die webwerf'}
                aria-expanded={isSearchOpen}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                  >
                    <form onSubmit={submitSearch} className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <label htmlFor="desktop-search" className="sr-only">Soekterm</label>
                        <input
                          id="desktop-search"
                          type="search"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Soek in webwerf..."
                          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                          autoFocus
                        />
                      </div>
                      <Button type="submit" size="sm" disabled={!searchTerm.trim()}>
                        Soek
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact Button */}
            {showAdminLink && (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Bestuur
                </Link>
              </Button>
            )}
            <Button asChild size="sm" className="bg-amber-700 hover:bg-amber-800">
              <Link href="/kontak">
                Kontak Ons
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-amber-700"
              aria-label={isMobileMenuOpen ? 'Maak kieslys toe' : 'Maak kieslys oop'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-amber-200">
                    <Image
                      src="/gksa-logo.png"
                      alt="Gereformeerde Kerke in Suid-Afrika"
                      width={32}
                      height={32}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-amber-900">Annlin Gemeente</h2>
                    <p className="text-xs text-amber-700">Gereformeerde Kerk</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600"
                  aria-label="Maak kieslys toe"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="py-4">
                {navigationItems.map((item, index) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href))
                  
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-6 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "text-amber-800 bg-amber-50 border-r-4 border-amber-600"
                            : "text-gray-700 hover:text-amber-800 hover:bg-amber-50"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* Mobile Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <form onSubmit={submitSearch} className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <label htmlFor="mobile-search" className="sr-only">Soekterm</label>
                      <input
                        id="mobile-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Soek..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <Button type="submit" size="sm" aria-label="Soek" disabled={!searchTerm.trim()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  <Button asChild className="w-full bg-amber-700 hover:bg-amber-800">
                    <Link href="/kontak">
                      Kontak Ons
                    </Link>
                  </Button>
                  {showAdminLink && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Bestuur
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Breadcrumb component for page navigation
export function Breadcrumb({ 
  items 
}: { 
  items: Array<{ name: string; href?: string }> 
}) {
  return (
    <nav className="bg-amber-50 border-b border-amber-100 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm">
          <Link 
            href="/" 
            className="text-amber-700 hover:text-amber-900 transition-colors"
          >
            Tuis
          </Link>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <span className="text-amber-600">/</span>
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-amber-700 hover:text-amber-900 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-amber-900 font-medium">{item.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  )
}

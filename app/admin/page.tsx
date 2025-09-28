import { requireAuth } from '@/lib/auth-config'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboard() {
  const { user } = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bestuurder Paneelbord
          </h1>
          <p className="mt-2 text-gray-600">
            Welkom terug, {user.name}! Jy is aangemeld as {user.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Groups */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Diensgroepe
              </h3>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Bestuur kerkdiensgroepe en bedienings
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/diensgroepe">
                Bestuur Diensgroepe
              </Link>
            </Button>
          </Card>

          {/* Calendar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kalender
              </h3>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Bestuur kerkgebeure en jaarlikse program
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/jaarprogram">
                Bestuur Kalender
              </Link>
            </Button>
          </Card>

          {/* News */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nuus & Artikels
              </h3>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Skep en bestuur nuusartikels en aankondigings
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/nuus">
                Bestuur Nuus
              </Link>
            </Button>
          </Card>

          {/* Reading Materials */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Leesstof
              </h3>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Laai op en bestuur dokumente en leesstof
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/leesstof">
                Bestuur Materiaal
              </Link>
            </Button>
          </Card>

          {/* Contact Submissions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kontak Vorms
              </h3>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Bekyk en reageer op kontak vorm indiening
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/contact">
                Bekyk Indienings
              </Link>
            </Button>
          </Card>

          {/* User Management (Admin Only) */}
          {user.role === 'ADMIN' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gebruiker Bestuur
                </h3>
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Bestuur gebruikers en stuur uitnodigings
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/users">
                  Bestuur Gebruikers
                </Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Vinnige Aksies
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/admin/nuus/new">
                Skep Nuwe Artikel
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/jaarprogram">
                Voeg Gebeurtenis By
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/diensgroepe/new">
                Voeg Diensgroep By
              </Link>
            </Button>
            {user.role === 'ADMIN' && (
              <Button variant="outline" asChild>
                <Link href="/admin/users/invite">
                  Nooi Gebruiker
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

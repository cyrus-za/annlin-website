import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  Calendar,
  Newspaper,
  BookOpen,
  Mail,
  FileText,
} from 'lucide-react'
import { CONTENT_PAGE_DEFINITIONS } from '@/lib/content-page-definitions'

export default async function AdminDashboard() {
  const { user } = await requireAuth()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const [totalUsers, totalArticles, upcomingEvents, pendingSubmissions, totalServiceGroups, totalReadingMaterials, publicReadingMaterials] =
    await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.event.count({
        where: {
          startDate: {
            gte: new Date(),
            lte: thirtyDaysFromNow,
          },
        },
      }),
      user.role === 'ADMIN'
        ? prisma.contactSubmission.count({ where: { status: 'NEW' } })
        : Promise.resolve(0),
      prisma.serviceGroup.count({
        where: { isActive: true },
      }),
      prisma.readingMaterial.count(),
      prisma.readingMaterial.count({
        where: {
          id: {
            not: {
              startsWith: 'wp-',
            },
          },
        },
      }),
    ])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bestuurder Paneelbord
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welkom terug, {user.name}! Jy is aangemeld as {user.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Aktiewe CMS gebruikers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Nuusitems</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              Gepubliseer en konsep
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komende Gebeure</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Volgende 30 dae
            </p>
          </CardContent>
        </Card>

        {user.role === 'ADMIN' && (
          <Link href="/admin/indienings" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2">
            <Card className="h-full transition-colors hover:border-amber-300 hover:bg-amber-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hangende Indienings</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Benodig aandag
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Vinnige Aksies</CardTitle>
          <CardDescription>
            Algemene take wat jy mag wil uitvoer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/admin/nuus/new">
                <Newspaper className="mr-2 h-4 w-4" />
                Skep Artikel
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/jaarprogram/new">
                <Calendar className="mr-2 h-4 w-4" />
                Voeg Gebeurtenis By
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/diensgroepe/new">
                <Users className="mr-2 h-4 w-4" />
                Voeg Diensgroep By
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/leesstof/new">
                <BookOpen className="mr-2 h-4 w-4" />
                Voeg Leesstof By
              </Link>
            </Button>
            {user.role === 'ADMIN' && (
              <Button variant="outline" asChild>
                <Link href="/admin/bladsye">
                  <FileText className="mr-2 h-4 w-4" />
                  Wysig Publieke Bladsye
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inhoud Oorsig</CardTitle>
          <CardDescription>
            Huidige inhoud in die stelsel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/diensgroepe" className="rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-amber-700" />
                Diensgroepe
              </div>
              <p className="mt-2 text-2xl font-bold">{totalServiceGroups}</p>
              <p className="text-xs text-muted-foreground">Aktief op publieke webwerf</p>
            </Link>
            <Link href="/admin/leesstof" className="rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpen className="h-4 w-4 text-amber-700" />
                Leesstof
              </div>
              <p className="mt-2 text-2xl font-bold">{publicReadingMaterials}</p>
              <p className="text-xs text-muted-foreground">
                {totalReadingMaterials - publicReadingMaterials} gemigreerde argiefitems bly intern bewaar
              </p>
            </Link>
            <Link href="/admin/jaarprogram" className="rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Calendar className="h-4 w-4 text-amber-700" />
                Jaarprogram
              </div>
              <p className="mt-2 text-2xl font-bold">{upcomingEvents}</p>
              <p className="text-xs text-muted-foreground">Items binne 30 dae</p>
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin/indienings" className="rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-amber-700" />
                  Nuwe navrae
                </div>
                <p className="mt-2 text-2xl font-bold">{pendingSubmissions}</p>
                <p className="text-xs text-muted-foreground">Onverwerkte kontakvorms</p>
              </Link>
            )}
            {user.role === 'ADMIN' && (
              <Link href="/admin/bladsye" className="rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="h-4 w-4 text-amber-700" />
                  Publieke bladsye
                </div>
                <p className="mt-2 text-2xl font-bold">{CONTENT_PAGE_DEFINITIONS.length}</p>
                <p className="text-xs text-muted-foreground">Vaste bladsye met redigeerbare teks</p>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { requireAuth } from '@/lib/auth-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  Newspaper, 
  BookOpen, 
  Mail, 
  UserPlus,
  TrendingUp,
  Clock
} from 'lucide-react'

export default async function AdminDashboard() {
  const { user } = await requireAuth()

  // Mock statistics - in real app, fetch from database
  const stats = {
    totalUsers: 12,
    totalArticles: 45,
    totalEvents: 23,
    pendingSubmissions: 7
  }

  const recentActivity = [
    { type: 'article', title: 'Nuwe artikel gepubliseer: "Jeugkamp 2024"', time: '2 uur gelede' },
    { type: 'event', title: 'Gebeurtenis bygevoeg: "Biduur"', time: '4 uur gelede' },
    { type: 'user', title: 'Nuwe gebruiker geregistreer', time: '6 uur gelede' },
    { type: 'contact', title: 'Kontak vorm indiening ontvang', time: '1 dag gelede' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bestuurder Paneelbord
        </h1>
        <p className="mt-2 text-gray-600">
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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 van vorige maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Artikels</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              +5 van vorige maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komende Gebeure</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Volgende 30 dae
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hangende Indienings</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Benodig aandag
            </p>
          </CardContent>
        </Card>
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
                Skep Nuwe Artikel
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
            {user.role === 'ADMIN' && (
              <Button variant="outline" asChild>
                <Link href="/admin/users/invite">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nooi Gebruiker
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Onlangse Aktiwiteit</CardTitle>
            <CardDescription>
              Jou onlangse aksies en veranderinge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Bekyk Alle Aktiwiteit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Inhoud Oorsig</CardTitle>
            <CardDescription>
              Vinnige oorsig van jou inhoud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Newspaper className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Gepubliseerde Artikels</span>
                </div>
                <span className="text-sm text-gray-600">32</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Aktiewe Gebeure</span>
                </div>
                <span className="text-sm text-gray-600">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-medium">Diensgroepe</span>
                </div>
                <span className="text-sm text-gray-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Leesstof Items</span>
                </div>
                <span className="text-sm text-gray-600">15</span>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Bekyk Statistieke
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { KeyRound, Mail, Shield, User } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminProfilePage() {
  const { user } = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profiel</h1>
        <p className="mt-2 text-muted-foreground">Jou admin rekening en toegang.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rekening</CardTitle>
            <CardDescription>Basiese besonderhede vir jou admin gebruiker.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Naam</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">E-pos</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sekuriteit</CardTitle>
            <CardDescription>Bestuur jou wagwoord vir hierdie admin rekening.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/profiel/wagwoord">
                <KeyRound className="mr-2 h-4 w-4" />
                Verander wagwoord
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

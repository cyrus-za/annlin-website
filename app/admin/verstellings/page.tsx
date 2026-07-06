import Link from 'next/link'
import { BookOpen, Calendar, KeyRound, Newspaper, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const adjustmentLinks = [
  {
    title: 'Diensgroepe',
    description: 'Bestuur diensgroepe, kategoriee en kontakbesonderhede.',
    href: '/admin/diensgroepe',
    icon: Users,
  },
  {
    title: 'Jaarprogram',
    description: 'Bestuur gebeure en jaarkalender inskrywings.',
    href: '/admin/jaarprogram',
    icon: Calendar,
  },
  {
    title: 'Nuus',
    description: 'Bestuur nuus en artikels wat publiek vertoon.',
    href: '/admin/nuus',
    icon: Newspaper,
  },
  {
    title: 'Leesstof',
    description: 'Bestuur dokumente, argiefmateriaal en skakels.',
    href: '/admin/leesstof',
    icon: BookOpen,
  },
  {
    title: 'Wagwoord',
    description: 'Verander jou eie admin wagwoord.',
    href: '/admin/profiel/wagwoord',
    icon: KeyRound,
  },
]

export default function AdminAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Verstellings</h1>
        <p className="mt-2 text-muted-foreground">
          Kortpaaie na die verstellings en inhoud wat tans in die admin beskikbaar is.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adjustmentLinks.map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-800">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href={item.href}>Maak oop</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

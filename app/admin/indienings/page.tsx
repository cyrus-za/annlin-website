import type { ContactSubmissionStatus } from '@prisma/client'
import { ArrowRight, Inbox, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const statusLabels: Record<ContactSubmissionStatus, string> = {
  NEW: 'Nuut',
  READ: 'Gelees',
  REPLIED: 'Beantwoord',
}

const typeLabels = {
  GENERAL: 'Algemene navraag',
  SERVICE_GROUP: 'Diensgroep-navraag',
  SPECIFIC: 'Ander navraag',
} as const

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('af-ZA', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  }).format(date)
}

function statusBadgeVariant(status: ContactSubmissionStatus) {
  if (status === 'NEW') return 'warning' as const
  if (status === 'REPLIED') return 'success' as const
  return 'secondary' as const
}

interface SubmissionsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function ContactSubmissionsPage({ searchParams }: SubmissionsPageProps) {
  await requireAdmin()
  const requestedStatus = (await searchParams).status
  const activeStatus = requestedStatus === 'NEW' || requestedStatus === 'READ' || requestedStatus === 'REPLIED'
    ? requestedStatus
    : undefined

  const [submissions, groupedCounts] = await Promise.all([
    prisma.contactSubmission.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      include: {
        serviceGroup: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.contactSubmission.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ])

  const counts = groupedCounts.reduce<Record<ContactSubmissionStatus, number>>(
    (result, item) => ({ ...result, [item.status]: item._count._all }),
    { NEW: 0, READ: 0, REPLIED: 0 },
  )
  const totalCount = counts.NEW + counts.READ + counts.REPLIED
  const filters: Array<{ label: string; href: string; count: number; status?: ContactSubmissionStatus }> = [
    { label: 'Alles', href: '/admin/indienings', count: totalCount },
    { label: 'Nuut', href: '/admin/indienings?status=NEW', count: counts.NEW, status: 'NEW' },
    { label: 'Gelees', href: '/admin/indienings?status=READ', count: counts.READ, status: 'READ' },
    { label: 'Beantwoord', href: '/admin/indienings?status=REPLIED', count: counts.REPLIED, status: 'REPLIED' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kontakindienings</h1>
        <p className="mt-2 text-gray-600">Lees en verwerk boodskappe wat deur die publieke kontakvorm ontvang is.</p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filtreer kontakindienings">
        {filters.map((filter) => {
          const isActive = activeStatus === filter.status || (!activeStatus && !filter.status)
          return (
            <Button key={filter.href} asChild size="sm" variant={isActive ? 'default' : 'outline'}>
              <Link href={filter.href}>
                {filter.label}
                <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filter.count}</span>
              </Link>
            </Button>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeStatus ? statusLabels[activeStatus] : 'Alle indienings'}</CardTitle>
          <CardDescription>
            {submissions.length} van hoogstens 100 indiening{submissions.length === 1 ? '' : 's'} word gewys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className={`rounded-md border p-4 ${submission.status === 'NEW' ? 'border-amber-300 bg-amber-50/40' : 'bg-white'}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-semibold text-gray-900">{submission.subject}</h2>
                    <Badge variant={statusBadgeVariant(submission.status)}>{statusLabels[submission.status]}</Badge>
                    <Badge variant="outline">{typeLabels[submission.type]}</Badge>
                  </div>
                  <p className="line-clamp-2 whitespace-pre-line break-words text-sm text-gray-700">
                    {submission.message}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{submission.name}</span>
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="break-all">{submission.email}</span>
                    </span>
                    {submission.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {submission.phone}
                      </span>
                    )}
                    {submission.serviceGroup && <span>Diensgroep: {submission.serviceGroup.name}</span>}
                  </div>
                  <p className="text-xs text-gray-500">Ontvang {formatDate(submission.createdAt)}</p>
                </div>
                <Button asChild variant="outline" className="shrink-0 self-start">
                  <Link href={`/admin/indienings/${submission.id}`}>
                    Lees boodskap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}

          {submissions.length === 0 && (
            <div className="py-12 text-center">
              <Inbox className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-3 font-medium text-gray-900">Geen indienings in hierdie afdeling nie</p>
              <p className="mt-1 text-sm text-gray-600">Nuwe kontakvorms sal hier verskyn.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

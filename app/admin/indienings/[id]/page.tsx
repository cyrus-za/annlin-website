import { ArrowLeft, Mail, Phone, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateContactSubmissionStatus } from '../../_actions/contact-submissions'

const statusLabels = {
  NEW: 'Nuut',
  READ: 'Gelees',
  REPLIED: 'Beantwoord',
} as const

const typeLabels = {
  GENERAL: 'Algemene navraag',
  SERVICE_GROUP: 'Diensgroep-navraag',
  SPECIFIC: 'Ander navraag',
} as const

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('af-ZA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  }).format(date)
}

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  await requireAdmin()
  const { id } = await params
  const submission = await prisma.contactSubmission.findUnique({
    where: { id },
    include: {
      serviceGroup: {
        select: { id: true, name: true },
      },
    },
  })

  if (!submission) notFound()

  const replyHref = `mailto:${submission.email}?subject=${encodeURIComponent(`Re: ${submission.subject}`)}`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href="/admin/indienings">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug na indienings
        </Link>
      </Button>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={submission.status === 'NEW' ? 'warning' : submission.status === 'REPLIED' ? 'success' : 'secondary'}>
              {statusLabels[submission.status]}
            </Badge>
            <Badge variant="outline">{typeLabels[submission.type]}</Badge>
          </div>
          <CardTitle className="break-words text-2xl sm:text-3xl">{submission.subject}</CardTitle>
          <CardDescription>Ontvang {formatDate(submission.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-md border bg-gray-50 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Van</p>
              <p className="mt-1 font-medium text-gray-900">{submission.name}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-gray-500">Kontak</p>
              <a href={`mailto:${submission.email}`} className="mt-1 flex min-w-0 items-center gap-2 break-all text-amber-800 hover:underline">
                <Mail className="h-4 w-4 shrink-0" />
                {submission.email}
              </a>
              {submission.phone && (
                <a href={`tel:${submission.phone}`} className="mt-2 flex items-center gap-2 text-amber-800 hover:underline">
                  <Phone className="h-4 w-4" />
                  {submission.phone}
                </a>
              )}
            </div>
            {submission.serviceGroup && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-500">Diensgroep</p>
                <Link href={`/admin/diensgroepe/${submission.serviceGroup.id}`} className="mt-1 inline-flex items-center gap-2 text-amber-800 hover:underline">
                  <Users className="h-4 w-4" />
                  {submission.serviceGroup.name}
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase text-gray-500">Boodskap</h2>
            <p className="mt-3 whitespace-pre-wrap break-words text-base leading-7 text-gray-900">{submission.message}</p>
          </div>

          <div className="flex flex-wrap gap-3 border-t pt-5">
            <Button asChild>
              <a href={replyHref}>
                <Mail className="mr-2 h-4 w-4" />
                Antwoord per e-pos
              </a>
            </Button>
            {submission.status === 'NEW' && (
              <form action={updateContactSubmissionStatus}>
                <input type="hidden" name="id" value={submission.id} />
                <input type="hidden" name="status" value="READ" />
                <Button type="submit" variant="outline">Merk as gelees</Button>
              </form>
            )}
            {submission.status !== 'REPLIED' && (
              <form action={updateContactSubmissionStatus}>
                <input type="hidden" name="id" value={submission.id} />
                <input type="hidden" name="status" value="REPLIED" />
                <Button type="submit" variant="outline">Merk as beantwoord</Button>
              </form>
            )}
            {submission.status !== 'NEW' && (
              <form action={updateContactSubmissionStatus}>
                <input type="hidden" name="id" value={submission.id} />
                <input type="hidden" name="status" value="NEW" />
                <Button type="submit" variant="ghost">Merk weer as nuut</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

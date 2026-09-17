import { GitCommitHorizontal } from 'lucide-react'
import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('af-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }).format(date)
}

export default async function ChangelogPage() {
  await requireAuth()
  const entries = await prisma.changelogEntry.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Veranderingslogboek</h1>
        <p className="mt-2 text-muted-foreground">Nuwe funksies, verbeterings en belangrike tegniese regstellings aan die webwerf.</p>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GitCommitHorizontal className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{entry.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{entry.category}</Badge>
                <time className="text-sm text-muted-foreground" dateTime={entry.publishedAt.toISOString()}>{formatDate(entry.publishedAt)}</time>
              </div>
            </div>
            <p className="mt-3 leading-7 text-muted-foreground">{entry.description}</p>
          </article>
        ))}
        {entries.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Geen veranderings is nog aangeteken nie.</p>}
      </div>
    </div>
  )
}

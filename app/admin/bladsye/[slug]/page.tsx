import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import {
  formatContentFieldValue,
  getContentPageDefinition,
  mergeContentPageSections,
} from '@/lib/content-page-definitions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveContentPage } from '../../_actions/content-pages'

interface AdminContentPageProps {
  params: Promise<{ slug: string }>
}

export default async function AdminContentPage({ params }: AdminContentPageProps) {
  await requireAdmin()
  const { slug } = await params
  const definition = getContentPageDefinition(slug)
  if (!definition) notFound()

  const page = await prisma.contentPage.findUnique({ where: { slug } })
  const sections = mergeContentPageSections(definition, page?.sections)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href="/admin/bladsye">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug na bladsye
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{definition.title}</h1>
          <p className="mt-2 text-gray-600">{definition.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={definition.route} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Bekyk publieke bladsy
          </Link>
        </Button>
      </div>

      <form action={saveContentPage} className="space-y-6">
        <input type="hidden" name="slug" value={definition.slug} />

        <Card>
          <CardHeader>
            <CardTitle>Bladsybesonderhede</CardTitle>
            <CardDescription>Die titel en beskrywing waarmee die bladsy in die bestuurderpaneel herken word.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={page?.title || definition.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beskrywing</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={page?.description || definition.description} required />
            </div>
          </CardContent>
        </Card>

        {definition.groups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              {group.description && <CardDescription>{group.description}</CardDescription>}
            </CardHeader>
            <CardContent className="grid gap-5">
              {group.fields.map((field) => {
                const fieldId = field.path.replaceAll('.', '-')
                const value = formatContentFieldValue(sections, field)
                const isLongField = field.kind !== 'text'
                return (
                  <div key={field.path} className="grid gap-2">
                    <Label htmlFor={fieldId}>{field.label}</Label>
                    {isLongField ? (
                      <Textarea
                        id={fieldId}
                        name={field.path}
                        rows={field.kind === 'paragraphs' ? 8 : 4}
                        defaultValue={value}
                        required
                      />
                    ) : (
                      <Input id={fieldId} name={field.path} defaultValue={value} required />
                    )}
                    {field.help && <p className="text-xs text-gray-500">{field.help}</p>}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}

        <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-md border bg-white/95 p-4 shadow-lg backdrop-blur">
          <Button asChild type="button" variant="outline">
            <Link href="/admin/bladsye">Kanselleer</Link>
          </Button>
          <Button type="submit">Stoor en publiseer</Button>
        </div>
      </form>
    </div>
  )
}

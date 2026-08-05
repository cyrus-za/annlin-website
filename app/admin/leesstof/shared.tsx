import Link from 'next/link'
import type { ReadingMaterial, ReadingMaterialCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { saveReadingMaterial } from '../_actions/content'
import { ResourceFileUpload } from '@/components/admin/ResourceFileUpload'

function dateInputValue(date?: Date) {
  const value = date || new Date()
  return value.toISOString().slice(0, 10)
}

export function ReadingMaterialForm({
  material,
  categories,
}: {
  material?: ReadingMaterial
  categories: ReadingMaterialCategory[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{material ? 'Redigeer Item' : 'Nuwe Item'}</h1>
        <p className="mt-2 text-gray-600">Bestuur dokumente, publikasies en ander gemeentehulpbronne.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leesstof- of publikasiebesonderhede</CardTitle>
          <CardDescription>Titel, datum, lêer, status en kategorie.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveReadingMaterial} className="space-y-5">
            {material && <input type="hidden" name="id" value={material.id} />}
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={material?.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beskrywing / inhoud</Label>
              <MarkdownEditor
                id="description"
                name="description"
                defaultValue={material?.description || ''}
                placeholder="Begin skryf die leesstof-inhoud..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="externalUrl">Eksterne URL</Label>
                <Input id="externalUrl" name="externalUrl" defaultValue={material?.externalUrl || ''} />
              </div>
              <ResourceFileUpload defaultUrl={material?.fileUrl || ''} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contentDate">Datum van dokument</Label>
                <Input
                  id="contentDate"
                  name="contentDate"
                  type="date"
                  defaultValue={dateInputValue(material?.contentDate)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Hierdie datum bepaal waar die item in lyste en filters verskyn.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Kategorie</Label>
                <select id="categoryId" name="categoryId" defaultValue={material?.categoryId || categories[0]?.id || ''} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fileType">Tipe</Label>
                <select id="fileType" name="fileType" defaultValue={material?.fileType || 'LINK'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="LINK">Skakel</option>
                  <option value="PDF">PDF</option>
                  <option value="DOC">Dokument</option>
                  <option value="AUDIO">Klank</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={material?.status || 'DRAFT'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="DRAFT">Konsep</option>
                  <option value="PUBLISHED">Gepubliseer</option>
                  <option value="ARCHIVED">Argief</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-3 pb-2">
                <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <input type="checkbox" name="showDate" value="true" defaultChecked={material?.showDate ?? true} className="h-4 w-4 rounded border-input" />
                  Wys datum op die webwerf
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <input type="checkbox" name="isArchived" value="true" defaultChecked={material?.isArchived ?? false} className="h-4 w-4 rounded border-input" />
                  Historiese argief
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Stoor Item</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/leesstof">Kanselleer</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

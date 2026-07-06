import Link from 'next/link'
import type { ReadingMaterial, ReadingMaterialCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveReadingMaterial } from '../_actions/content'

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
        <h1 className="text-3xl font-bold text-gray-900">{material ? 'Redigeer Leesstof' : 'Nuwe Leesstof'}</h1>
        <p className="mt-2 text-gray-600">Bestuur inhoud wat op die publieke leesstofblad verskyn.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leesstof Besonderhede</CardTitle>
          <CardDescription>Titel, beskrywing, skakels en kategorie.</CardDescription>
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
              <Textarea id="description" name="description" defaultValue={material?.description || ''} rows={14} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="externalUrl">Eksterne URL</Label>
                <Input id="externalUrl" name="externalUrl" defaultValue={material?.externalUrl || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fileUrl">Lêer URL</Label>
                <Input id="fileUrl" name="fileUrl" defaultValue={material?.fileUrl || ''} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Stoor Leesstof</Button>
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

import Link from 'next/link'
import type { Article, ArticleCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { saveArticle } from '../_actions/content'

function dateInputValue(date?: Date) {
  const value = date || new Date()
  return value.toISOString().slice(0, 10)
}

export function ArticleForm({
  article,
  categories,
}: {
  article?: Article
  categories: ArticleCategory[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{article ? 'Redigeer Artikel' : 'Nuwe Artikel'}</h1>
        <p className="mt-2 text-gray-600">Bestuur inhoud wat op die publieke nuusblad verskyn.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Artikel Besonderhede</CardTitle>
          <CardDescription>Titel, inhoud, status en kategorie.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveArticle} className="space-y-5">
            {article && <input type="hidden" name="id" value={article.id} />}
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={article?.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" defaultValue={article?.slug} placeholder="Word outomaties uit titel gemaak indien leeg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Kort opsomming</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={article?.excerpt || ''} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Inhoud</Label>
              <MarkdownEditor
                id="content"
                name="content"
                defaultValue={article?.content}
                placeholder="Begin skryf die artikel..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="featuredImageUrl">Hooffoto URL</Label>
              <Input id="featuredImageUrl" name="featuredImageUrl" defaultValue={article?.featuredImageUrl || ''} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contentDate">Datum van berig</Label>
                <Input
                  id="contentDate"
                  name="contentDate"
                  type="date"
                  defaultValue={dateInputValue(article?.contentDate)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Hierdie datum bepaal waar die berig in lyste en filters verskyn.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Kategorie</Label>
                <select id="categoryId" name="categoryId" defaultValue={article?.categoryId || categories[0]?.id || ''} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={article?.status || 'DRAFT'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="DRAFT">Konsep</option>
                  <option value="PUBLISHED">Gepubliseer</option>
                  <option value="ARCHIVED">Argief</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                name="showDate"
                value="true"
                defaultChecked={article?.showDate ?? true}
                className="h-4 w-4 rounded border-input"
              />
              Wys datum op die webwerf
            </label>
            <div className="flex gap-3">
              <Button type="submit">Stoor Artikel</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/nuus">Kanselleer</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { prisma } from '@/lib/db'
import { ArticleForm } from '../shared'

export default async function NewArticlePage() {
  const categories = await prisma.articleCategory.findMany({ orderBy: { name: 'asc' } })
  return <ArticleForm categories={categories} />
}

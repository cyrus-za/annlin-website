import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ArticleForm } from '../shared'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id: params.id } }),
    prisma.articleCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!article) notFound()

  return <ArticleForm article={article} categories={categories} />
}

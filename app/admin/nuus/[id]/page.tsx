import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ArticleForm } from '../shared'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.articleCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!article) notFound()

  return <ArticleForm article={article} categories={categories} />
}

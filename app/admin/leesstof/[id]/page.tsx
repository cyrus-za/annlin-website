import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ReadingMaterialForm } from '../shared'

export default async function EditReadingMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [material, categories] = await Promise.all([
    prisma.readingMaterial.findUnique({ where: { id } }),
    prisma.readingMaterialCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!material) notFound()

  return <ReadingMaterialForm material={material} categories={categories} />
}

import { prisma } from '@/lib/db'
import { ReadingMaterialForm } from '../shared'

export default async function NewReadingMaterialPage() {
  const categories = await prisma.readingMaterialCategory.findMany({ orderBy: { name: 'asc' } })
  return <ReadingMaterialForm categories={categories} />
}

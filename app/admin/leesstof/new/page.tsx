import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-config'
import { ReadingMaterialForm } from '../shared'

export default async function NewReadingMaterialPage() {
  await requireAdmin()
  const categories = await prisma.readingMaterialCategory.findMany({ orderBy: { name: 'asc' } })
  return <ReadingMaterialForm categories={categories} />
}

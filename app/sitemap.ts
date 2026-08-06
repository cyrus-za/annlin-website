import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export const revalidate = 300

const staticPaths = [
  '/',
  '/oor-annlin-gemeente',
  '/jaarprogram',
  '/uitsendings',
  '/nuus',
  '/diensgroepe',
  '/leesstof',
  '/kontak',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
  const [serviceGroups, articles, readingMaterials] = await Promise.all([
    prisma.serviceGroup.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.readingMaterial.findMany({
      where: { status: 'PUBLISHED', isArchived: false },
      select: { id: true, updatedAt: true },
    }),
  ])

  return [
    ...staticPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : 0.8,
    })),
    ...serviceGroups.map((group) => ({
      url: `${baseUrl}/diensgroepe/${group.slug}`,
      lastModified: group.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/nuus/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...readingMaterials.map((material) => ({
      url: `${baseUrl}/leesstof/${material.id}`,
      lastModified: material.updatedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}

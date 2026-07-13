"use server"

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import {
  buildContentSectionsFromForm,
  getContentPageDefinition,
} from '@/lib/content-page-definitions'
import { createContentRevision } from '@/lib/services/revisions'

function formText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function saveContentPage(formData: FormData) {
  const { user } = await requireAdmin()
  const slug = formText(formData, 'slug')
  const definition = getContentPageDefinition(slug)

  if (!definition) throw new Error('Onbekende publieke bladsy')

  const currentPage = await prisma.contentPage.findUnique({ where: { slug } })
  const title = formText(formData, 'title') || definition.title
  const description = formText(formData, 'description') || definition.description
  const sections = buildContentSectionsFromForm(definition, currentPage?.sections, formData)
  const now = new Date()

  const page = await prisma.contentPage.upsert({
    where: { slug },
    update: {
      title,
      description,
      sections: sections as Prisma.InputJsonValue,
      status: 'PUBLISHED',
      publishedAt: currentPage?.publishedAt || now,
    },
    create: {
      slug,
      title,
      description,
      sections: sections as Prisma.InputJsonValue,
      status: 'PUBLISHED',
      publishedAt: now,
    },
  })

  await createContentRevision({
    entityType: 'ContentPage',
    entityId: page.id,
    snapshot: page,
    createdBy: user.id,
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: currentPage ? 'UPDATE' : 'CREATE',
      entityType: 'ContentPage',
      entityId: page.id,
      changes: currentPage ? { before: currentPage, after: page } : page,
    },
  })

  revalidatePath(definition.route)
  revalidatePath(`/api/content-pages/public/${slug}`)
  revalidatePath('/admin/bladsye')
  redirect('/admin/bladsye')
}

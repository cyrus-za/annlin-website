"use server"

import { ArticleStatus, ReadingMaterialFileType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { createContentRevision } from '@/lib/services/revisions'

async function requireAdmin() {
  const { user } = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Onvoldoende regte')
  }
  return user
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key)
  return value || null
}

async function ensureArticleCategory() {
  return prisma.articleCategory.upsert({
    where: { slug: 'nuus' },
    update: {},
    create: {
      name: 'Nuus',
      slug: 'nuus',
      description: 'Gemeente nuus en aankondigings',
      color: '#A16207',
    },
  })
}

async function ensureReadingCategory() {
  return prisma.readingMaterialCategory.upsert({
    where: { name: 'Algemeen' },
    update: {},
    create: {
      name: 'Algemeen',
      description: 'Algemene leesstof',
    },
  })
}

export async function saveArticle(formData: FormData) {
  const user = await requireAdmin()
  const id = text(formData, 'id')
  const title = text(formData, 'title')
  const content = text(formData, 'content')
  const slug = slugify(text(formData, 'slug') || title)
  const statusValue = text(formData, 'status')
  const status = statusValue === ArticleStatus.DRAFT ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED
  const categoryId = text(formData, 'categoryId') || (await ensureArticleCategory()).id
  const contentDate = text(formData, 'contentDate')

  if (!title || !content || !/^\d{4}-\d{2}-\d{2}$/.test(contentDate)) {
    throw new Error('Titel, inhoud en datum van berig is verplig')
  }

  const data = {
    title,
    slug,
    content,
    excerpt: optionalText(formData, 'excerpt'),
    featuredImageUrl: optionalText(formData, 'featuredImageUrl'),
    categoryId,
    status,
    contentDate: new Date(`${contentDate}T00:00:00.000Z`),
    showDate: formData.get('showDate') === 'true',
    publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
    authorId: user.id,
  }

  const article = id
    ? await prisma.article.update({ where: { id }, data })
    : await prisma.article.create({ data })

  await createContentRevision({
    entityType: 'Article',
    entityId: article.id,
    snapshot: article,
    createdBy: user.id,
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: id ? 'UPDATE' : 'CREATE',
      entityType: 'Article',
      entityId: article.id,
      changes: article,
    },
  })

  revalidatePath('/nuus')
  revalidatePath('/admin/nuus')
  redirect('/admin/nuus')
}

export async function deleteArticle(formData: FormData) {
  const user = await requireAdmin()
  const id = text(formData, 'id')
  const article = await prisma.article.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'DELETE',
      entityType: 'Article',
      entityId: id,
      changes: { deleted: article },
    },
  })

  revalidatePath('/nuus')
  revalidatePath('/admin/nuus')
}

export async function saveReadingMaterial(formData: FormData) {
  const user = await requireAdmin()
  const id = text(formData, 'id')
  const title = text(formData, 'title')
  const categoryId = text(formData, 'categoryId') || (await ensureReadingCategory()).id
  const fileTypeValue = text(formData, 'fileType')
  const fileType = fileTypeValue in ReadingMaterialFileType ? fileTypeValue as ReadingMaterialFileType : ReadingMaterialFileType.LINK
  const contentDate = text(formData, 'contentDate')
  const statusValue = text(formData, 'status')
  const status = ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(statusValue)
    ? statusValue as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    : 'DRAFT'

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(contentDate)) {
    throw new Error('Titel en datum van dokument is verplig')
  }

  const data = {
    title,
    description: optionalText(formData, 'description'),
    fileUrl: optionalText(formData, 'fileUrl'),
    externalUrl: optionalText(formData, 'externalUrl'),
    categoryId,
    fileType,
    contentDate: new Date(`${contentDate}T00:00:00.000Z`),
    showDate: formData.get('showDate') === 'true',
    status,
    isArchived: formData.get('isArchived') === 'true',
  }

  const material = id
    ? await prisma.readingMaterial.update({ where: { id }, data })
    : await prisma.readingMaterial.create({ data })

  await createContentRevision({
    entityType: 'ReadingMaterial',
    entityId: material.id,
    snapshot: material,
    createdBy: user.id,
  })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: id ? 'UPDATE' : 'CREATE',
      entityType: 'ReadingMaterial',
      entityId: material.id,
      changes: material,
    },
  })

  revalidatePath('/leesstof')
  revalidatePath('/admin/leesstof')
  redirect('/admin/leesstof')
}

export async function deleteReadingMaterial(formData: FormData) {
  const user = await requireAdmin()
  const id = text(formData, 'id')
  const material = await prisma.readingMaterial.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'DELETE',
      entityType: 'ReadingMaterial',
      entityId: id,
      changes: { deleted: material },
    },
  })

  revalidatePath('/leesstof')
  revalidatePath('/admin/leesstof')
}

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
  const status = text(formData, 'status') === ArticleStatus.DRAFT ? ArticleStatus.DRAFT : ArticleStatus.PUBLISHED
  const categoryId = text(formData, 'categoryId') || (await ensureArticleCategory()).id

  if (!title || !content) {
    throw new Error('Titel en inhoud is verplig')
  }

  const data = {
    title,
    slug,
    content,
    excerpt: optionalText(formData, 'excerpt'),
    featuredImageUrl: optionalText(formData, 'featuredImageUrl'),
    categoryId,
    status,
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

  if (!title) {
    throw new Error('Titel is verplig')
  }

  const data = {
    title,
    description: optionalText(formData, 'description'),
    fileUrl: optionalText(formData, 'fileUrl'),
    externalUrl: optionalText(formData, 'externalUrl'),
    categoryId,
    fileType,
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

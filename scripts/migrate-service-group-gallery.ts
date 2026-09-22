import { createHash } from 'node:crypto'

import { prisma } from '../lib/db'
import { extractTrailingMarkdownImageGallery } from '../lib/public-content'

const gallerySlugs = new Set([
  'evangelisasie-blad',
  'jeugbediening',
  'sosiale-dienste',
  'tradisionele-dienste',
  'tweedehandse-goedere-verkopings',
  'vroue-bedieningsgroep',
])

const captions: Record<string, Record<string, string>> = {
  'evangelisasie-blad': {
    'Gesprek oor Jesus': 'Om vrymoedig oor Jesus te praat.',
    '2e H Verkoping': '’n Tipiese maandelikse tweedehandse verkoping.',
    'Kerkleiers word opgelei': 'Kerkleiers tydens ’n opleidingsuitreik.',
    '2025 Bygewoon deur 33 predikante en kerkleiers': 'In 2025 is die opleiding deur 33 predikante en kerkleiers bygewoon.',
    'Bybelverspreiding oor die jare': 'Bybelverspreiding oor die afgelope aantal jare.',
    'Bybels vir Alto Molocue gemeente': 'Bybels vir die Alto Molocue-gemeente.',
  },
  jeugbediening: {
    'leerkragte 2026 FOTOs': 'Die 2026-kategete.',
  },
  'sosiale-dienste': {
    'WhatsApp Image 2023-10-31 at 15.05.13_30c8999e': 'Suster Rita Kruger en haar span bedien tydens ’n gemeentekamp.',
  },
  'tradisionele-dienste': {
    Nagmaalbediening: 'Voorbereiding vir die nagmaalbediening.',
  },
  'tweedehandse-goedere-verkopings': {
    'Bybeltafel by 2e handse verkoping': 'Ds. Attie Venter en sr. Marietjie van der Walt by die Bybeltafel.',
  },
  'vroue-bedieningsgroep': {
    'Vroue wat bid': 'Vroue kom saam in gebed.',
  },
}

const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g

function sourceImageUrl(value: string) {
  if (!value.startsWith('/_next/image?')) return value
  return new URL(value, 'https://annlin.invalid').searchParams.get('url') || value
}

function filenameFromUrl(value: string) {
  try {
    return decodeURIComponent(new URL(value, 'https://annlin.invalid').pathname.split('/').pop() || 'diensgroep-foto')
  } catch {
    return 'diensgroep-foto'
  }
}

function mimeTypeFromFilename(filename: string) {
  if (/\.png$/i.test(filename)) return 'image/png'
  if (/\.webp$/i.test(filename)) return 'image/webp'
  return 'image/jpeg'
}

function photoId(serviceGroupId: string, url: string) {
  return `sg-photo-${createHash('sha256').update(`${serviceGroupId}:${url}`).digest('hex').slice(0, 24)}`
}

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "service_group_photos" (
      "id" TEXT NOT NULL,
      "serviceGroupId" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "pathname" TEXT,
      "filename" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "size" INTEGER NOT NULL DEFAULT 0,
      "alt" TEXT NOT NULL DEFAULT '',
      "caption" TEXT,
      "displayOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "service_group_photos_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "service_group_photos_serviceGroupId_fkey"
        FOREIGN KEY ("serviceGroupId") REFERENCES "service_groups"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "service_group_photos_serviceGroupId_url_key" ON "service_group_photos"("serviceGroupId", "url")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "service_group_photos_serviceGroupId_displayOrder_idx" ON "service_group_photos"("serviceGroupId", "displayOrder")`)

  const [groups, assets] = await Promise.all([
    prisma.serviceGroup.findMany({
      where: { slug: { in: [...gallerySlugs] } },
      select: { id: true, slug: true, description: true },
    }),
    prisma.uploadedAsset.findMany({ select: { url: true, pathname: true, filename: true, mimeType: true, size: true } }),
  ])
  const assetsByUrl = new Map(assets.map((asset) => [asset.url, asset]))
  let imported = 0

  for (const group of groups) {
    const images = [...group.description.matchAll(markdownImagePattern)].map((match) => ({
      alt: (match[1] || '').trim(),
      url: sourceImageUrl(match[2] || ''),
    }))

    for (const [displayOrder, image] of images.entries()) {
      const asset = assetsByUrl.get(image.url)
      const filename = asset?.filename || filenameFromUrl(image.url)
      await prisma.$executeRaw`
        INSERT INTO "service_group_photos"
          ("id", "serviceGroupId", "url", "pathname", "filename", "mimeType", "size", "alt", "caption", "displayOrder", "updatedAt")
        VALUES
          (${photoId(group.id, image.url)}, ${group.id}, ${image.url}, ${asset?.pathname || null}, ${filename}, ${asset?.mimeType || mimeTypeFromFilename(filename)}, ${asset?.size || 0}, ${image.alt}, ${captions[group.slug]?.[image.alt] || null}, ${displayOrder}, CURRENT_TIMESTAMP)
        ON CONFLICT ("serviceGroupId", "url") DO UPDATE SET
          "pathname" = EXCLUDED."pathname",
          "filename" = EXCLUDED."filename",
          "mimeType" = EXCLUDED."mimeType",
          "size" = EXCLUDED."size",
          "alt" = EXCLUDED."alt",
          "caption" = EXCLUDED."caption",
          "displayOrder" = EXCLUDED."displayOrder",
          "updatedAt" = CURRENT_TIMESTAMP
      `
      imported++
    }

    const trailing = extractTrailingMarkdownImageGallery(group.description)
    if (trailing.images.length > 0) {
      await prisma.serviceGroup.update({
        where: { id: group.id },
        data: { description: trailing.content },
      })
    }
  }

  const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "service_group_photos"
  `
  console.log(JSON.stringify({ status: 'ok', considered: imported, galleryPhotos: Number(count || 0) }))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Diensgroepfotomigrasie het misluk')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())

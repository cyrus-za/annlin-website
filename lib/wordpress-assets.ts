export type WordPressAssetReference = {
  kind: 'image' | 'linked-file'
  url: string
  label: string
  filename: string
  sourceIndex: number
}

const imageExtensions = new Set(['gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'])
const documentExtensions = new Set([
  'doc',
  'docx',
  'm4a',
  'mp3',
  'pdf',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
])
const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g

export function decodeWordPressEntities(value: string) {
  let decoded = value

  for (let index = 0; index < 2; index++) {
    decoded = decoded
      .replaceAll('&amp;', '&')
      .replaceAll('&#038;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replace(/&#x([0-9a-f]+);/gi, (_match, codePoint: string) =>
        String.fromCodePoint(Number.parseInt(codePoint, 16))
      )
      .replace(/&#(\d+);/g, (_match, codePoint: string) =>
        String.fromCodePoint(Number.parseInt(codePoint, 10))
      )
      .replace(/[\u201c\u201d\u2033]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, '-')
      .replaceAll('\u2026', '...')
  }

  return decoded
}

export function stripDuplicateResponsiveDiviModules(html: string) {
  return decodeWordPressEntities(html).replace(
    /\[et_pb_([a-z0-9_]+)\b(?=[^\]]*\bdisabled_on=["']off\|off\|on["'])[^\]]*][\s\S]*?\[\/et_pb_\1]/gi,
    ' '
  )
}

function attributeValue(tag: string, attribute: string) {
  const pattern = new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i')
  return tag.match(pattern)?.[1] || ''
}

function filenameFromUrl(url: string) {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '')
  } catch {
    return url.split('/').filter(Boolean).pop()?.split(/[?#]/, 1)[0] || ''
  }
}

function extensionFromFilename(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function assetKind(url: string) {
  const extension = extensionFromFilename(filenameFromUrl(url))

  if (imageExtensions.has(extension)) return 'image' as const
  if (documentExtensions.has(extension)) return 'linked-file' as const
  return null
}

function isImageAssetUrl(url: string) {
  return assetKind(decodeWordPressEntities(url).trim()) === 'image'
}

function cleanLabel(value: string) {
  return decodeWordPressEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?et_pb_[^\]]*]/gi, ' ')
    .replace(/[\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function humanizeFilename(filename: string) {
  const readableFilename = filename
    .replace(/\.[^.]+$/, '')
    .replace(/\.\d+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (/registrasievorm/i.test(readableFilename)) return 'Registrasievorm'
  return readableFilename
}

function assetLabelFromMarkdown(content: string, href: string) {
  const imageLabel = [...content.matchAll(markdownImagePattern)]
    .map((match) => cleanLabel(match[1] || ''))
    .find(Boolean)

  if (imageLabel) return imageLabel

  return humanizeFilename(filenameFromUrl(href))
}

function imageMarkdown(src: string, alt = '') {
  const cleanedSrc = decodeWordPressEntities(src).trim()
  if (!cleanedSrc) return ''
  return `![${cleanLabel(alt)}](${cleanedSrc})`
}

function linkMarkdown(href: string, label = '') {
  const cleanedHref = decodeWordPressEntities(href).trim()
  if (!cleanedHref) return ''
  return `[${cleanLabel(label) || cleanedHref}](${cleanedHref})`
}

function preserveAnchor(href: string, content: string) {
  const cleanedHref = decodeWordPressEntities(href).trim()
  const normalizedContent = content.trim()
  const images = [...normalizedContent.matchAll(markdownImagePattern)]

  if (images.length === 0) {
    const label = cleanLabel(normalizedContent)
    return label ? linkMarkdown(cleanedHref, label) : ''
  }

  if (isImageAssetUrl(cleanedHref)) {
    const firstImage = images[0]
    const fullMatch = firstImage?.[0]
    const alt = firstImage?.[1] || cleanLabel(normalizedContent)
    return fullMatch
      ? normalizedContent.replace(fullMatch, imageMarkdown(cleanedHref, alt))
      : normalizedContent
  }

  if (normalizedContent.toLowerCase().includes(cleanedHref.toLowerCase())) {
    return normalizedContent
  }

  const assetLabel = assetLabelFromMarkdown(normalizedContent, cleanedHref)
  const linkLabel = assetLabel ? `${assetLabel} oopmaak` : 'Maak lêer oop'
  return `${normalizedContent}\n\n${linkMarkdown(cleanedHref, linkLabel)}`
}

export function preserveWordPressAssetMarkup(html: string) {
  return decodeWordPressEntities(html)
    .replace(/\[et_pb_image\b[^\]]*]/gi, (shortcode) => {
      const src = attributeValue(shortcode, 'src')
      const title = attributeValue(shortcode, 'title_text')
      const url = attributeValue(shortcode, 'url')
      const parts = [imageMarkdown(src, title)]

      if (url && url !== src) {
        parts.push(linkMarkdown(url, title ? `${title} oopmaak` : url))
      }

      return parts.filter(Boolean).join('\n\n')
    })
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = attributeValue(tag, 'src') || attributeValue(tag, 'data-src')
      const alt = attributeValue(tag, 'alt') || attributeValue(tag, 'title')
      return imageMarkdown(src, alt)
    })
    .replace(
      /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_match, href: string, content: string) => preserveAnchor(href, content)
    )
}

function createReference(
  url: string,
  label: string,
  sourceIndex: number,
  forcedKind?: WordPressAssetReference['kind']
) {
  const cleanedUrl = decodeWordPressEntities(url).trim()
  const kind = forcedKind ?? assetKind(cleanedUrl)

  if (!cleanedUrl || !kind) return null

  return {
    kind,
    url: cleanedUrl,
    label: cleanLabel(label),
    filename: filenameFromUrl(cleanedUrl),
    sourceIndex,
  } satisfies WordPressAssetReference
}

export function extractWordPressAssetReferences(html: string) {
  const decodedHtml = decodeWordPressEntities(html)
  const references: WordPressAssetReference[] = []

  for (const match of decodedHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const reference = createReference(
      attributeValue(tag, 'src') || attributeValue(tag, 'data-src'),
      attributeValue(tag, 'alt') || attributeValue(tag, 'title'),
      match.index,
      'image'
    )
    if (reference) references.push(reference)
  }

  for (const match of decodedHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const reference = createReference(match[1] || '', '', match.index)
    if (reference) references.push(reference)
  }

  for (const match of decodedHtml.matchAll(/\[et_pb_image\b[^\]]*]/gi)) {
    const shortcode = match[0]
    const label = attributeValue(shortcode, 'title_text')
    const image = createReference(attributeValue(shortcode, 'src'), label, match.index, 'image')
    const linkedFile = createReference(attributeValue(shortcode, 'url'), label, match.index + 1)

    if (image) references.push(image)
    if (linkedFile) references.push(linkedFile)
  }

  for (const match of decodedHtml.matchAll(/\[et_pb_[a-z0-9_]+\b[^\]]*]/gi)) {
    const shortcode = match[0]
    const linkedFile = createReference(
      attributeValue(shortcode, 'url'),
      attributeValue(shortcode, 'admin_label') || attributeValue(shortcode, 'title_text'),
      match.index
    )

    if (linkedFile) references.push(linkedFile)
  }

  const uniqueReferences = new Map<string, WordPressAssetReference>()

  for (const reference of references.sort((a, b) => a.sourceIndex - b.sourceIndex)) {
    const key = `${reference.kind}:${reference.url}`
    const existing = uniqueReferences.get(key)

    if (!existing) {
      uniqueReferences.set(key, reference)
    } else if (!existing.label && reference.label) {
      uniqueReferences.set(key, { ...existing, label: reference.label })
    }
  }

  return [...uniqueReferences.values()]
}

export function extractWordPressGalleryMediaIds(html: string) {
  const mediaIds: number[] = []

  for (const match of decodeWordPressEntities(html).matchAll(/\[et_pb_gallery\b[^\]]*]/gi)) {
    const galleryIds = attributeValue(match[0], 'gallery_ids')

    for (const value of galleryIds.split(',')) {
      const mediaId = Number.parseInt(value.trim(), 10)
      if (Number.isInteger(mediaId) && mediaId > 0) mediaIds.push(mediaId)
    }
  }

  return [...new Set(mediaIds)]
}

function contentContainsReference(content: string, reference: WordPressAssetReference) {
  const normalizedContent = content.toLowerCase()

  if (reference.kind === 'image') {
    return [...content.matchAll(markdownImagePattern)].some((match) => {
      const imageUrl = match[2]?.toLowerCase() || ''
      return (
        imageUrl.includes(reference.url.toLowerCase()) ||
        (reference.filename.length > 0 && imageUrl.includes(reference.filename.toLowerCase()))
      )
    })
  }

  return (
    normalizedContent.includes(reference.url.toLowerCase()) ||
    (reference.filename.length > 0 && normalizedContent.includes(reference.filename.toLowerCase()))
  )
}

function referenceToMarkdown(reference: WordPressAssetReference) {
  const label = reference.label || humanizeFilename(reference.filename)

  if (reference.kind === 'image') {
    return `![${label}](${reference.url})`
  }

  return `[${label || 'Maak lêer oop'}](${reference.url})`
}

export function ensureWordPressAssetsPreserved(html: string, content: string) {
  const missingReferences = extractWordPressAssetReferences(html).filter(
    (reference) => !contentContainsReference(content, reference)
  )

  if (missingReferences.length === 0) return content

  return [content.trim(), ...missingReferences.map(referenceToMarkdown)].filter(Boolean).join('\n\n')
}

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

function cleanLabel(value: string) {
  return decodeWordPressEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?et_pb_[^\]]*]/gi, ' ')
    .replace(/[\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
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

  const uniqueReferences = new Map<string, WordPressAssetReference>()

  for (const reference of references.sort((a, b) => a.sourceIndex - b.sourceIndex)) {
    const key = `${reference.kind}:${reference.url}`
    if (!uniqueReferences.has(key)) uniqueReferences.set(key, reference)
  }

  return [...uniqueReferences.values()]
}

function contentContainsReference(content: string, reference: WordPressAssetReference) {
  const normalizedContent = content.toLowerCase()
  return (
    normalizedContent.includes(reference.url.toLowerCase()) ||
    (reference.filename.length > 0 && normalizedContent.includes(reference.filename.toLowerCase()))
  )
}

function referenceToMarkdown(reference: WordPressAssetReference) {
  const label = reference.label || reference.filename

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

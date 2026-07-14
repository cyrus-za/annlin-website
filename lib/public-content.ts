const incompleteMarkdownImagePattern = /!\[[^\]]*\]\([^\s)]*(?:\)|$)/g
const incompleteMarkdownLinkPattern = /\[([^\]]+)\]\([^\s)]*(?:\)|$)/g
const malformedNestedImageLinkPattern =
  /\[!([^\](\n]{0,120})\((?:https?:\/\/|www\.)[^\s)]+\)\]\((?:https?:\/\/|www\.)[^\s)]+\)/gi
const bareUrlPattern = /(?:https?:\/\/|www\.)[^\s<]+/gi
const googleMapsUrlPattern = /(?<!\()\bhttps?:\/\/(?:www\.)?google\.com\/maps\/[^\s)\]]+/gi
const googleMapsMarkdownLinkPattern =
  /\[[^\]]*\]\((https?:\/\/(?:www\.)?google\.com\/maps\/[^\s)]+)\)/gi
const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findMatchingDelimiter(value: string, start: number, open: string, close: string) {
  let depth = 0

  for (let index = start; index < value.length; index++) {
    if (value[index] === '\\') {
      index += 1
      continue
    }

    if (value[index] === open) depth += 1
    if (value[index] !== close) continue

    depth -= 1
    if (depth === 0) return index
  }

  return -1
}

function stripMarkdownLinksAndImages(value: string): string {
  let output = ''

  for (let index = 0; index < value.length; index++) {
    const isImage = value[index] === '!' && value[index + 1] === '['
    const isLink = value[index] === '['

    if (!isImage && !isLink) {
      output += value[index]
      continue
    }

    const bracketStart = isImage ? index + 1 : index
    const bracketEnd = findMatchingDelimiter(value, bracketStart, '[', ']')
    const destinationStart = bracketEnd + 1

    if (bracketEnd < 0 || value[destinationStart] !== '(') {
      output += value[index]
      continue
    }

    const destinationEnd = findMatchingDelimiter(value, destinationStart, '(', ')')
    if (destinationEnd < 0) {
      output += value[index]
      continue
    }

    if (!isImage) {
      const label = value.slice(bracketStart + 1, bracketEnd)
      output += stripMarkdownLinksAndImages(label)
    } else {
      output += ' '
    }

    index = destinationEnd
  }

  return output
}

function stripLeadingWordPressPageChrome(value: string) {
  let cleaned = normalizeWhitespace(value)

  for (let index = 0; index < 4; index++) {
    const next = cleaned
      .replace(/^\s*GEREFORMEERDE KERK\s*\n+\s*PRETORIA-ANNLIN\s*/i, '')
      .replace(/^\s*Gereformeerde Kerk Pretoria-Annlin\s*/i, '')
      .replace(/^\s*(Nuus|Diensteblad)\s*/i, '')
      .replace(/^\s*\uE016\s*/i, '')
      .trimStart()

    if (next === cleaned) {
      break
    }

    cleaned = next
  }

  return cleaned
}

function stripLeadingArticleChrome(value: string) {
  let cleaned = stripLeadingWordPressPageChrome(value)

  for (let index = 0; index < 4; index++) {
    const next = cleaned
      .replace(/^\s*Weeklikse Gemeente-nuusblad\s*/i, '')
      .replace(/^\s*Die Fontein\s*/i, '')
      .trimStart()

    if (next === cleaned) break
    cleaned = next
  }

  return cleaned
}

function labelForEmptyAssetLink(url: string) {
  let filename = ''

  try {
    filename = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || '')
  } catch {
    filename = url.split('/').filter(Boolean).pop()?.split(/[?#]/, 1)[0] || ''
  }

  const readableFilename = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (/registrasievorm/i.test(readableFilename)) return 'Registrasievorm'
  return readableFilename ? `${readableFilename} oopmaak` : 'Maak lêer oop'
}

function labelEmptyAssetLinks(value: string) {
  return value.replace(/\[\s*\]\((https?:\/\/[^\s)]+)\)/gi, (_match, url: string) => {
    return `[${labelForEmptyAssetLink(url)}](${url})`
  })
}

function stripLeadingArticlePreviewMedia(value: string) {
  let cleaned = value.trimStart()

  for (let index = 0; index < 8; index++) {
    const next = cleaned
      .replace(/^\s*!\[[^\]]*\]\([^\n]+\)\s*/i, '')
      .replace(/^\s*\[[^\]]+(?:oopmaak|aflaai)\]\([^\n]+\)\s*/i, '')
      .replace(/^\s*\(klik op die foto[^)]*\)\s*/i, '')
      .replace(/^\s*\[Kliek hier vir \d{4} Nuus!?\]\([^\n]+\)\s*/i, '')
      .trimStart()

    if (next === cleaned) break
    cleaned = next
  }

  return cleaned
}

export function normalizeGoogleMapsLinks(value: string) {
  return value
    .replace(
      googleMapsMarkdownLinkPattern,
      (_match, url: string) => `[Maak roete in Google Maps oop](${url})`
    )
    .replace(googleMapsUrlPattern, (url) => `[Maak roete in Google Maps oop](${url})`)
}

export function normalizeArticleContent(value: string) {
  return normalizeGoogleMapsLinks(
    labelEmptyAssetLinks(stripLeadingArticleChrome(value.replace(/\uE016/g, '')))
  )
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function normalizeReadingMaterialContent(value: string, title: string) {
  const repeatedTitlePattern = new RegExp(
    `^\\s*${escapeRegExp(title)}(?:[ \\t]*(?:\\n+|$))`,
    'i'
  )
  let normalized = normalizeWhitespace(value)

  for (let index = 0; index < 8; index++) {
    const next = normalizeWhitespace(
      stripLeadingWordPressPageChrome(normalized).replace(repeatedTitlePattern, '')
    )

    if (next === normalized) break
    normalized = next
  }

  return normalized
}

export type MarkdownAudioLink = {
  title: string
  url: string
}

function isAudioUrl(url: string) {
  try {
    return /\.mp3$/i.test(new URL(url).pathname)
  } catch {
    return /\.mp3(?:[?#]|$)/i.test(url)
  }
}

export function extractMarkdownAudioLinks(value: string): MarkdownAudioLink[] {
  const links = new Map<string, MarkdownAudioLink>()

  for (const match of value.matchAll(markdownLinkPattern)) {
    const title = match[1]?.trim()
    const url = match[2]?.trim()

    if (!title || !url || !isAudioUrl(url) || links.has(url)) continue
    links.set(url, { title, url })
  }

  return [...links.values()]
}

export function stripMarkdownAudioLinks(value: string) {
  return normalizeWhitespace(
    value.replace(markdownLinkPattern, (match, _title: string, url: string) => {
      return isAudioUrl(url) ? '' : match
    })
  )
}

export function stripMarkdown(value: string) {
  return stripMarkdownLinksAndImages(
    value.replace(malformedNestedImageLinkPattern, '$1')
  )
    .replace(incompleteMarkdownImagePattern, ' ')
    .replace(incompleteMarkdownLinkPattern, '$1')
    .replace(/!?\[\s*\]\s*\(?/g, ' ')
    .replace(bareUrlPattern, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createExcerpt(value: string, maxLength = 180) {
  const normalized = stripMarkdown(value)

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function createArticleExcerpt(value: string, maxLength = 220) {
  return createExcerpt(stripLeadingArticlePreviewMedia(normalizeArticleContent(value)), maxLength)
}

export function normalizeServiceGroupContent(value: string, title: string) {
  let normalized = normalizeWhitespace(value)
  const completeHeaderPattern = new RegExp(
    `GEREFORMEERDE KERK\\s+PRETORIA-ANNLIN\\s+(?:Die\\s+)?${escapeRegExp(title)}s?(?:\\s+Blad)?`,
    'gi'
  )
  const completeHeaders = [...normalized.slice(0, 2500).matchAll(completeHeaderPattern)]
  const lastCompleteHeader = completeHeaders.at(-1)

  if (lastCompleteHeader?.index !== undefined) {
    return normalizeWhitespace(
      normalized.slice(lastCompleteHeader.index + lastCompleteHeader[0].length)
    )
  }

  normalized = stripLeadingWordPressPageChrome(normalized)
  const repeatedTitlePattern = new RegExp(
    `^\\s*${escapeRegExp(title)}s?(?:[ \\t]+Blad)?[ \\t]*(?:\\n+|$)`,
    'i'
  )

  return normalizeWhitespace(normalized.replace(repeatedTitlePattern, ''))
}

export function createServiceGroupExcerpt(value: string, title: string, maxLength = 180) {
  return createExcerpt(normalizeServiceGroupContent(value, title), maxLength)
}

export function stripLeadingDateFromTitle(title: string) {
  return title
    .replace(
      /^\s*(\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}\s*[-–]\s*)/i,
      ''
    )
    .trim()
}

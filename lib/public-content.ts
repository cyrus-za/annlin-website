const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
const incompleteMarkdownImagePattern = /!\[[^\]]*\]\([^\s)]*(?:\)|$)/g
const incompleteMarkdownLinkPattern = /\[([^\]]+)\]\([^\s)]*(?:\)|$)/g
const bareUrlPattern = /(?:https?:\/\/|www\.)[^\s<]+/gi
const googleMapsUrlPattern = /(?<!\]\()\bhttps?:\/\/(?:www\.)?google\.com\/maps\/[^\s)]+/gi
const googleMapsMarkdownLinkPattern =
  /\[Maak roete in Google Maps oop\]\((https?:\/\/(?:www\.)?google\.com\/maps\/[^\s)]+)\)/gi

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

export function normalizeArticleContent(value: string) {
  return stripLeadingWordPressPageChrome(value)
    .replace(googleMapsMarkdownLinkPattern, '$1')
    .replace(googleMapsUrlPattern, (url) => `[Maak roete in Google Maps oop](${url})`)
    .replace(/\uE016/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function stripMarkdown(value: string) {
  return value
    .replace(markdownImagePattern, ' ')
    .replace(markdownLinkPattern, '$1')
    .replace(incompleteMarkdownImagePattern, ' ')
    .replace(incompleteMarkdownLinkPattern, '$1')
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
  return createExcerpt(normalizeArticleContent(value), maxLength)
}

export function normalizeServiceGroupContent(value: string, title: string) {
  const normalized = stripLeadingWordPressPageChrome(value)
  const repeatedTitlePattern = new RegExp(
    `^\\s*${escapeRegExp(title)}s?(?:\\s+Blad)?(?=\\s|$)`,
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

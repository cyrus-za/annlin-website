const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g

export function stripMarkdown(value: string) {
  return value
    .replace(markdownImagePattern, '$1')
    .replace(markdownLinkPattern, '$1')
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

export function stripLeadingDateFromTitle(title: string) {
  return title
    .replace(
      /^\s*(\d{1,2}\s+[A-Za-zÀ-ÿ]+\s+\d{4}\s*[-–]\s*)/i,
      ''
    )
    .trim()
}

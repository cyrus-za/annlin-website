const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g
const emptyMarkdownLinkPattern = /(?<!!)\[\s*\]\([^)]+\)/g
const pathLabelLinkPattern = /(?<!!)\[([^\]]+)\]\((\/[^)]+)\)/g

export type ContentIntegrityIssue =
  | 'dangerousUrl'
  | 'duplicateImage'
  | 'emptyImageAlt'
  | 'emptyLinkLabel'
  | 'legacyDomain'
  | 'legacyPhotoNavigation'
  | 'pathOnlyLinkLabel'
  | 'privateUseCharacter'
  | 'wordpressShortcode'

function filenameLabel(url: string) {
  let filename = ''

  try {
    filename = decodeURIComponent(new URL(url, 'https://annlin.invalid').pathname.split('/').pop() || '')
  } catch {
    filename = url.split('/').pop() || ''
  }

  const label = filename
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+-/, '')
    .replace(/-e\d{9,}$/i, '')
    .replace(/-\d+[x×]\d+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : 'Inhoudsprentjie'
}

function routeLabel(path: string) {
  if (path === '/') return 'Tuisblad'

  const segment = path.split('/').filter(Boolean).pop() || path
  const label = decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return label ? `${label.charAt(0).toUpperCase()}${label.slice(1)}` : 'Maak bladsy oop'
}

function removeConsecutiveDuplicateImages(value: string) {
  const matches = [...value.matchAll(markdownImagePattern)]
  let output = ''
  let cursor = 0
  let previousUrl = ''
  let previousEnd = 0

  for (const match of matches) {
    const start = match.index || 0
    const end = start + match[0].length
    const url = match[2]?.trim() || ''
    const between = value.slice(previousEnd, start)
    const duplicate = url === previousUrl && between.trim() === ''

    if (!duplicate) {
      output += value.slice(cursor, end)
      cursor = end
    } else {
      output = output.trimEnd()
      cursor = end
    }

    previousUrl = url
    previousEnd = end
  }

  return `${output}${value.slice(cursor)}`
}

function legacyPhotoNavigationCount(value: string) {
  return [
    ...value.matchAll(
      /\[\/(?:nuus)?\]\(\/(?:nuus)?\)\s*Kliek enige plek op fotoblad om weer terug te gaan na (?:Tuisblad|nuusblad)/gi
    ),
  ].length
}

export function normalizeContentMarkdown(value: string) {
  const withoutLegacyNavigation = value.replace(
    /\s*\[\/(?:nuus)?\]\(\/(?:nuus)?\)\s*Kliek enige plek op fotoblad om weer terug te gaan na (?:Tuisblad|nuusblad)\s*/gi,
    '\n\n'
  )
  const withImageAlts = withoutLegacyNavigation.replace(
    /!\[\s*\]\(([^)]+)\)/g,
    (_match, url: string) => `![${filenameLabel(url)}](${url})`
  )
  const withReadableLinks = withImageAlts.replace(
    pathLabelLinkPattern,
    (match, label: string, path: string) => {
      return label.trim() === path ? `[${routeLabel(path)}](${path})` : match
    }
  )

  return removeConsecutiveDuplicateImages(withReadableLinks)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function auditContentMarkdown(value: string) {
  const issues = new Map<ContentIntegrityIssue, number>()
  const add = (issue: ContentIntegrityIssue, count: number) => {
    if (count > 0) issues.set(issue, count)
  }

  const images = [...value.matchAll(markdownImagePattern)]
  let duplicateImages = 0

  for (let index = 1; index < images.length; index++) {
    const previous = images[index - 1]
    const current = images[index]
    if (!previous || !current) continue

    const previousEnd = (previous.index || 0) + previous[0].length
    const between = value.slice(previousEnd, current.index || 0)

    if (previous[2]?.trim() === current[2]?.trim() && between.trim() === '') {
      duplicateImages += 1
    }
  }

  add('emptyImageAlt', images.filter((image) => !image[1]?.trim()).length)
  add('duplicateImage', duplicateImages)
  add('emptyLinkLabel', [...value.matchAll(emptyMarkdownLinkPattern)].length)
  add(
    'pathOnlyLinkLabel',
    [...value.matchAll(pathLabelLinkPattern)].filter((match) => match[1]?.trim() === match[2]?.trim()).length
  )
  add('legacyPhotoNavigation', legacyPhotoNavigationCount(value))
  add('legacyDomain', [...value.matchAll(/https?:\/\/(?:www\.)?annlin\.co\.za/gi)].length)
  add('dangerousUrl', [...value.matchAll(/(?:javascript|data):[^\s)]+/gi)].length)
  add('wordpressShortcode', [...value.matchAll(/\[(?:et_pb|gallery|caption)[^\]]*\]/gi)].length)
  add('privateUseCharacter', [...value.matchAll(/[\uE000-\uF8FF]/g)].length)

  return Object.fromEntries(issues) as Partial<Record<ContentIntegrityIssue, number>>
}

export function extractContentUrls(value: string) {
  const urls = new Set<string>()

  for (const match of value.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const url = match[1]?.trim()
    if (url) urls.add(url)
  }

  return [...urls]
}

#!/usr/bin/env tsx

type PageAudit = {
  requestedUrl: string
  finalUrl: string
  status: number
  title: string | null
  linksFound: number
}

type ServiceGroupResponse = {
  serviceGroups?: Array<{ slug?: string }>
}

const USER_AGENT = 'Annlin public link audit'
const MAX_PAGES = 300
const SEEDED_PATHS = [
  '/',
  '/oor-annlin-gemeente',
  '/jaarprogram',
  '/uitsendings',
  '/nuus',
  '/diensgroepe',
  '/leesstof',
  '/kontakbesonderhede',
  '/kontak',
  '/privaatheid',
  '/gebruiksvoorwaardes',
  '/soek?q=kerk',
]

function requiredUrl(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return new URL(value)
}

function optionalHost(name: string) {
  const value = process.env[name]
  if (!value) return null
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function decodeAttribute(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&#038;', '&')
    .replaceAll('&quot;', '"')
    .trim()
}

function extractLinks(html: string, pageUrl: URL) {
  const links = new Set<string>()

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = decodeAttribute(match[1] || '')
    if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue

    try {
      const url = new URL(href, pageUrl)
      url.hash = ''
      links.add(url.toString())
    } catch {
      // Invalid legacy markup is reported by the content audit, not followed here.
    }
  }

  for (const match of html.matchAll(/<form\b[^>]*\baction=["']([^"']+)["'][^>]*>/gi)) {
    const action = decodeAttribute(match[1] || '')
    if (!action) continue

    try {
      const url = new URL(action, pageUrl)
      url.hash = ''
      links.add(url.toString())
    } catch {
      // Invalid form actions are caught during interactive browser QA.
    }
  }

  return [...links]
}

function pageTitle(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return title?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null
}

function shouldCrawl(url: URL, siteUrl: URL) {
  if (url.origin !== siteUrl.origin) return false
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) return false
  return true
}

async function fetchWithRetry(url: string) {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': USER_AGENT,
        },
        redirect: 'follow',
      })

      if (response.status < 500 || attempt === 3) return response
      await response.body?.cancel()
    } catch (error) {
      lastError = error
      if (attempt === 3) throw error
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }

  throw lastError
}

async function dynamicSeedUrls(siteUrl: URL) {
  const apiUrl = new URL(
    '/api/diensgroepe?isActive=true&limit=100&sortBy=displayOrder&sortOrder=asc',
    siteUrl
  )
  const response = await fetchWithRetry(apiUrl.toString())

  if (!response.ok) {
    throw new Error(`Service-group route discovery failed with ${response.status}.`)
  }

  const data = (await response.json()) as ServiceGroupResponse
  return (data.serviceGroups || [])
    .map((group) => group.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => new URL(`/diensgroepe/${slug}`, siteUrl).toString())
}

async function main() {
  const siteUrl = requiredUrl('SITE_URL')
  const legacyHost = optionalHost('WORDPRESS_BASE_URL')
  const queue = SEEDED_PATHS.map((path) => new URL(path, siteUrl).toString())
  const seedFailures: Array<{ source: string; error: string }> = []

  try {
    queue.push(...(await dynamicSeedUrls(siteUrl)))
  } catch (error) {
    seedFailures.push({
      source: 'serviceGroups',
      error: error instanceof Error ? error.message : String(error),
    })
  }

  const queued = new Set(queue)
  const pages: PageAudit[] = []
  const externalLinks = new Set<string>()
  const legacyMediaLinks = new Set<string>()
  const legacyPageLinks = new Set<string>()
  const failures: Array<{ requestedUrl: string; error: string }> = []

  while (queue.length > 0 && pages.length + failures.length < MAX_PAGES) {
    const requestedUrl = queue.shift()!

    try {
      const response = await fetchWithRetry(requestedUrl)
      const contentType = response.headers.get('content-type') || ''
      const html = contentType.includes('text/html') ? await response.text() : ''
      const finalUrl = new URL(response.url)
      const links = html ? extractLinks(html, finalUrl) : []

      pages.push({
        requestedUrl,
        finalUrl: finalUrl.toString(),
        status: response.status,
        title: pageTitle(html),
        linksFound: links.length,
      })

      for (const link of links) {
        const url = new URL(link)
        const normalizedHost = url.hostname.replace(/^www\./, '')

        if (legacyHost && normalizedHost === legacyHost) {
          if (url.pathname.startsWith('/wp-content/uploads/')) {
            legacyMediaLinks.add(link)
          } else {
            legacyPageLinks.add(link)
          }
        }

        if (!shouldCrawl(url, siteUrl)) {
          externalLinks.add(link)
          continue
        }

        if (!queued.has(link)) {
          queued.add(link)
          queue.push(link)
        }
      }
    } catch (error) {
      failures.push({
        requestedUrl,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const broken = pages.filter((page) => page.status >= 400)
  const redirects = pages.filter((page) => page.requestedUrl !== page.finalUrl)

  console.log(
    JSON.stringify(
      {
        summary: {
          pagesVisited: pages.length,
          brokenPages: broken.length,
          requestFailures: failures.length,
          seedFailures: seedFailures.length,
          redirects: redirects.length,
          legacyPageLinks: legacyPageLinks.size,
          legacyMediaLinks: legacyMediaLinks.size,
          externalLinks: externalLinks.size,
          hitPageLimit: pages.length + failures.length >= MAX_PAGES && queue.length > 0,
        },
        broken,
        failures,
        seedFailures,
        redirects,
        legacyPageLinks: [...legacyPageLinks].sort(),
        legacyMediaLinks: [...legacyMediaLinks].sort(),
        externalLinks: [...externalLinks].sort(),
        pages,
      },
      null,
      2
    )
  )

  if (
    broken.length > 0 ||
    failures.length > 0 ||
    seedFailures.length > 0 ||
    legacyPageLinks.size > 0
  ) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

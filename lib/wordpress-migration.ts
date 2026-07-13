type WordPressPageReference = {
  id: number
  slug: string
}

type WordPressRouteOptions = {
  serviceGroupSlugs: ReadonlySet<string>
  newsSlugs: ReadonlySet<string>
  readingSlugs: ReadonlySet<string>
  singletonRoutes: ReadonlyMap<string, string>
}

function normalizeHost(host: string) {
  return host.replace(/^www\./i, '').toLowerCase()
}

export function buildWordPressPageRouteMap(
  pages: WordPressPageReference[],
  options: WordPressRouteOptions
) {
  const routes = new Map<string, string>([
    ['', '/'],
    ['nuus-2', '/nuus'],
    ['nuus-2020', '/nuus'],
  ])

  for (const page of pages) {
    const singletonRoute = options.singletonRoutes.get(page.slug)

    if (singletonRoute) {
      routes.set(page.slug, singletonRoute)
    } else if (options.serviceGroupSlugs.has(page.slug)) {
      routes.set(page.slug, `/diensgroepe/${page.slug}`)
    } else if (options.newsSlugs.has(page.slug)) {
      routes.set(page.slug, `/nuus/${page.slug}`)
    } else if (options.readingSlugs.has(page.slug)) {
      routes.set(page.slug, `/leesstof/wp-page-${page.id}`)
    } else {
      routes.set(page.slug, `/leesstof/wp-archive-page-${page.id}`)
    }
  }

  return routes
}

export function replaceWordPressPageLinks(
  value: string,
  wordpressBaseUrl: string,
  routes: ReadonlyMap<string, string>
) {
  const wordpressHost = normalizeHost(new URL(wordpressBaseUrl).hostname)

  return value.replace(/(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi, (candidate) => {
    let url: URL

    try {
      url = new URL(candidate.startsWith('www.') ? `https://${candidate}` : candidate)
    } catch {
      return candidate
    }

    if (normalizeHost(url.hostname) !== wordpressHost) {
      return candidate
    }

    const pathParts = url.pathname.split('/').filter(Boolean)

    // Uploads stay on WordPress until the complete media archive is copied to R2.
    if (pathParts[0] === 'wp-content' && pathParts[1] === 'uploads') {
      return candidate
    }

    const slug = pathParts[0] || ''
    return routes.get(slug) ?? candidate
  })
}

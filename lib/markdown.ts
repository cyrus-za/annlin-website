function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function normalizeMarkdownUrl(value: string) {
  const trimmed = value.trim()

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`
  }

  return trimmed
}

export function isSafeMarkdownUrl(value: string, image = false) {
  const normalized = normalizeMarkdownUrl(value)
  const allowed = image
    ? /^(?:https?:\/\/|\/(?!\/))/i
    : /^(?:https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i

  return allowed.test(normalized)
}

function safeUrl(value: string, image = false) {
  const normalized = normalizeMarkdownUrl(value)
  return isSafeMarkdownUrl(normalized, image) ? normalized : '#'
}

function renderInline(value: string) {
  const replacements: string[] = []
  const token = (html: string) => {
    const index = replacements.push(html) - 1
    return `\u0000${index}\u0000`
  }

  let rendered = value
    .replace(/`([^`]+)`/g, (_match, code: string) => token(`<code>${escapeHtml(code)}</code>`))
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_match, alt: string, url: string) =>
        token(
          `<img src="${escapeHtml(safeUrl(url, true))}" alt="${escapeHtml(alt)}" loading="lazy" />`
        )
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match, label: string, url: string) =>
        token(
          `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
        )
    )

  rendered = escapeHtml(rendered)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')

  return rendered.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => {
    return replacements[Number.parseInt(index, 10)] || ''
  })
}

export function markdownToHtml(markdown: string) {
  const output: string[] = []
  const paragraph: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    output.push(`<p>${paragraph.map(renderInline).join('<br>')}</p>`)
    paragraph.length = 0
  }

  const flushList = () => {
    if (!listType || listItems.length === 0) return
    output.push(`<${listType}>${listItems.map((item) => `<li>${item}</li>`).join('')}</${listType}>`)
    listType = null
    listItems = []
  }

  for (const sourceLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const line = sourceLine.trimEnd()

    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    const unorderedItem = line.match(/^[-*+]\s+(.+)$/)
    const orderedItem = line.match(/^\d+\.\s+(.+)$/)
    const quote = line.match(/^>\s?(.+)$/)

    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1]?.length || 1
      output.push(`<h${level}>${renderInline(heading[2] || '')}</h${level}>`)
      continue
    }

    if (/^\s*---\s*$/.test(line)) {
      flushParagraph()
      flushList()
      output.push('<hr>')
      continue
    }

    if (unorderedItem || orderedItem) {
      flushParagraph()
      const nextListType = unorderedItem ? 'ul' : 'ol'

      if (listType && listType !== nextListType) flushList()
      listType = nextListType
      listItems.push(renderInline((unorderedItem || orderedItem)?.[1] || ''))
      continue
    }

    if (quote) {
      flushParagraph()
      flushList()
      output.push(`<blockquote><p>${renderInline(quote[1] || '')}</p></blockquote>`)
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return output.join('')
}

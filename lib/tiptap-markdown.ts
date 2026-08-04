import type { JSONContent } from '@tiptap/core'

function inlineMarkdown(node: JSONContent): string {
  if (node.type === 'hardBreak') return '\n'

  if (node.type === 'image') {
    const alt = String(node.attrs?.['alt'] || '').replace(/[\[\]]/g, '').trim()
    const src = String(node.attrs?.['src'] || '').trim()
    return src ? `![${alt}](${src})` : ''
  }

  let content = node.text ?? (node.content || []).map(inlineMarkdown).join('')

  for (const mark of node.marks || []) {
    if (mark.type === 'code') content = `\`${content}\``
    if (mark.type === 'bold') content = `**${content}**`
    if (mark.type === 'italic') content = `*${content}*`
    if (mark.type === 'link') {
      const href = String(mark.attrs?.['href'] || '').trim()
      if (href) content = `[${content}](${href})`
    }
  }

  return content
}

function listItemMarkdown(node: JSONContent): string {
  const blocks = (node.content || []).map(blockMarkdown).filter(Boolean)
  return blocks.join('\n').trim()
}

function listMarkdown(node: JSONContent, ordered: boolean): string {
  return (node.content || [])
    .map((item, index) => {
      const marker = ordered ? `${index + 1}. ` : '- '
      const content = listItemMarkdown(item)
      const lines = content.split('\n')
      return `${marker}${lines[0] || ''}${lines.slice(1).map((line) => `\n  ${line}`).join('')}`
    })
    .join('\n')
}

function blockMarkdown(node: JSONContent): string {
  const content = (node.content || []).map(inlineMarkdown).join('')

  switch (node.type) {
    case 'doc':
      return (node.content || []).map(blockMarkdown).filter(Boolean).join('\n\n')
    case 'paragraph':
      return content
    case 'heading':
      return `${'#'.repeat(Number(node.attrs?.['level']) || 2)} ${content}`
    case 'bulletList':
      return listMarkdown(node, false)
    case 'orderedList':
      return listMarkdown(node, true)
    case 'listItem':
      return listItemMarkdown(node)
    case 'blockquote':
      return (node.content || [])
        .map(blockMarkdown)
        .join('\n\n')
        .split('\n')
        .map((line) => `> ${line}`.trimEnd())
        .join('\n')
    case 'horizontalRule':
      return '---'
    case 'image':
      return inlineMarkdown(node)
    default:
      return content
  }
}

export function tiptapJsonToMarkdown(document: JSONContent): string {
  return blockMarkdown(document).replace(/\n{3,}/g, '\n\n').trim()
}

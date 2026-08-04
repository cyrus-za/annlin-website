import assert from 'node:assert/strict'

import { tiptapJsonToMarkdown } from '../lib/tiptap-markdown'

const markdown = tiptapJsonToMarkdown({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Welkom' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Lees die ', marks: [{ type: 'italic' }] },
        {
          type: 'text',
          text: 'nuus',
          marks: [
            { type: 'bold' },
            { type: 'link', attrs: { href: '/nuus' } },
          ],
        },
        { type: 'hardBreak' },
        { type: 'text', text: 'vandag.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Een' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Twee' }] }] },
      ],
    },
    {
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '’n Aanhaling' }] }],
    },
    { type: 'horizontalRule' },
    { type: 'image', attrs: { src: 'https://example.com/foto.jpg', alt: 'Gemeente' } },
  ],
})

assert.equal(
  markdown,
  [
    '## Welkom',
    '*Lees die *[**nuus**](/nuus)\nvandag.',
    '- Een\n- Twee',
    '> ’n Aanhaling',
    '---',
    '![Gemeente](https://example.com/foto.jpg)',
  ].join('\n\n')
)

assert.equal(tiptapJsonToMarkdown({ type: 'doc', content: [{ type: 'paragraph' }] }), '')

console.log('Tiptap Markdown serialization tests passed.')

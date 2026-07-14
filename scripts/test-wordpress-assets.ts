#!/usr/bin/env tsx

import assert from 'node:assert/strict'
import {
  decodeWordPressEntities,
  ensureWordPressAssetsPreserved,
  extractWordPressAssetReferences,
} from '../lib/wordpress-assets'

const imageUrl = 'http://www.annlin.co.za/wp-content/uploads/2023/11/DXF.png'
const fileUrl =
  'http://www.annlin.co.za/wp-content/uploads/2023/12/Die-Fontein-3-Desember-2023-WEB.pdf'
const malformedBulkMarkup = `
  <a href=&#8221;${fileUrl}&#8221;>
    [et_pb_image src=&#8221;${imageUrl}&#8221; title_text=&#8221;DXF&#8221;
      url=&#8221;${fileUrl}&#8221; _builder_version=&#8221;4.14.7&#8243;]
  </a>
`

assert.equal(decodeWordPressEntities('4.14.7&#8243;'), '4.14.7"')

const references = extractWordPressAssetReferences(malformedBulkMarkup)
assert.deepEqual(
  references.map(({ kind, url }) => ({ kind, url })),
  [
    { kind: 'linked-file', url: fileUrl },
    { kind: 'image', url: imageUrl },
  ]
)

const flattenedContent = `[${fileUrl}](${fileUrl})`
const restoredContent = ensureWordPressAssetsPreserved(malformedBulkMarkup, flattenedContent)

assert.match(restoredContent, new RegExp(`!\\[DXF\\]\\(${imageUrl.replaceAll('.', '\\.')}\\)`))
assert.equal(ensureWordPressAssetsPreserved(malformedBulkMarkup, restoredContent), restoredContent)

console.log('WordPress asset preservation checks passed.')

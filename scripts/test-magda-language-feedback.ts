import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { markdownToHtml } from '../lib/markdown'
import { groupSlugs, reviseGroupDescription, revisePageCopy } from './lib/magda-language'

const source = "Visie\n\nOns visie is 'n Gemeente wat volgelinge van Christus maak.\n\nMissie\n\nBeplan aksies\n\nOrganiseer\n\n1 Eie omgewing\n\nBid vir vyf: Bid saam.\n\n![Foto](/foto.jpg)\n\nOm vrymoedig te kan praat oor Jesus"
const result = reviseGroupDescription('evangelisasie-blad', source)
assert.equal(reviseGroupDescription('evangelisasie-blad', result), result)
const html = markdownToHtml(result)
assert.ok(html.includes('<h2>Eie omgewing</h2>'))
assert.ok(html.includes('<ul><li>Beplan aksies.</li><li>Organiseer.</li></ul>'))
assert.ok(html.includes('<strong>Bid vir vyf:</strong>'))
assert.ok(html.includes('<em>Om vrymoedig te kan praat oor Jesus</em>'))
assert.ok(html.includes('src="/foto.jpg"'))
assert.deepEqual(revisePageCopy({ title: 'Ons Roeping', other: 12, history: 'Gebou in 2023' }), { title: 'Ons roeping', other: 12, history: 'Gebou in 2023' })
assert.equal(revisePageCopy('Predikant (vanaf Oktober 2023)'), 'Predikant')

// Optionally verify an uncommitted production snapshot without exposing personal data.
const snapshot = process.argv.find((arg) => arg.startsWith('--snapshot='))?.slice('--snapshot='.length)
let groupsChecked = 0
if (snapshot) {
  const data = JSON.parse(readFileSync(snapshot, 'utf8')) as { groups: { slug: string; description: string }[] }
  for (const slug of groupSlugs) {
    const group = data.groups.find((item) => item.slug === slug)
    assert.ok(group, `Missing ${slug}`)
    const revised = reviseGroupDescription(slug, group.description)
    assert.equal(reviseGroupDescription(slug, revised), revised, `Not idempotent: ${slug}`)
    const images = (text: string) => [...text.matchAll(/!\[[^\]]*\]\([^)]+\)/g)].map((match) => match[0])
    assert.deepEqual(images(revised), images(group.description), `Images changed: ${slug}`)
    assert.ok(!/Sit bullets|maak dit italic|hierdie kan verwarring|Ã/.test(revised))
    assert.ok(markdownToHtml(revised).includes('<h3>'))
    groupsChecked++
  }
}
console.log(JSON.stringify({ status: 'ok', groupsChecked }))

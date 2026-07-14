#!/usr/bin/env tsx

import assert from 'node:assert/strict'
import {
  decodeWordPressEntities,
  ensureWordPressAssetsPreserved,
  extractWordPressAssetReferences,
  preserveWordPressAssetMarkup,
  stripDuplicateResponsiveDiviModules,
} from '../lib/wordpress-assets'
import { replaceMigratedWordPressAssetLinks } from '../lib/wordpress-migration'
import {
  createArticleExcerpt,
  extractMarkdownAudioLinks,
  normalizeArticleContent,
  stripMarkdownAudioLinks,
  stripMarkdown,
} from '../lib/public-content'

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

const galleryImageUrl = 'https://www.annlin.co.za/wp-content/uploads/2026/03/3.jpeg'
const galleryMarkup = `
  <a href="${galleryImageUrl}" title="3">
    <img src="${galleryImageUrl}" alt="Jeugaktiwiteit" />
  </a>
`
const preservedGallery = preserveWordPressAssetMarkup(galleryMarkup)

assert.equal(preservedGallery.trim(), `![Jeugaktiwiteit](${galleryImageUrl})`)

const flattenedImageLink = `[${galleryImageUrl}](${galleryImageUrl})`
const reconciledImage = ensureWordPressAssetsPreserved(galleryMarkup, flattenedImageLink)
assert.match(reconciledImage, /!\[Jeugaktiwiteit\]\(https:\/\//)

const pdfWrappedImageMarkup = `
  <a href="${fileUrl}">
    <img src="${imageUrl}" alt="DXF" />
  </a>
`
const preservedPdfImage = preserveWordPressAssetMarkup(pdfWrappedImageMarkup)

assert.equal(
  preservedPdfImage.trim(),
  `![DXF](${imageUrl})\n\n[DXF oopmaak](${fileUrl})`
)
assert.equal(createArticleExcerpt(preservedPdfImage), '')

const malformedNestedImageLink =
  `[!DXF(${imageUrl})](${fileUrl}) Gemeentenuus vir hierdie week.`
assert.equal(createArticleExcerpt(malformedNestedImageLink), 'DXF Gemeentenuus vir hierdie week.')

const longGoogleMapsLink =
  '[Maak roete in Google Maps oop](https://www.google.com/maps/dir//143+Leonie+St,+Doringkloof,+Centurion,+0157/@-25.8518806,28.181,12z/data=!4m2!4m1!3e0?entry=ttu)'
assert.equal(
  stripMarkdown(`Sustersaamtrek 2024\n${longGoogleMapsLink}\nKliek hier vir besonderhede.`),
  'Sustersaamtrek 2024 Maak roete in Google Maps oop Kliek hier vir besonderhede.'
)

const emptyRegistrationLink =
  '[](https://www.annlin.co.za/wp-content/uploads/2024/01/SUSTERSAAMTREK-2024-REGISTRASIEVORM.1.pdf)'
assert.match(normalizeArticleContent(emptyRegistrationLink), /^\[Registrasievorm\]\(/)
assert.match(normalizeArticleContent(`\uE016${emptyRegistrationLink}`), /^\[Registrasievorm\]\(/)
assert.match(
  normalizeArticleContent(emptyRegistrationLink.replace('[]', '[\uE016]')),
  /^\[Registrasievorm\]\(/
)

const newsPageChrome = `
  GEREFORMEERDE KERK
  PRETORIA-ANNLIN Nuus
  Weeklikse Gemeente-nuusblad
  Die Fontein
  Gemeentenuus vir hierdie week.
`
assert.equal(normalizeArticleContent(newsPageChrome), 'Gemeentenuus vir hierdie week.')

const newsWithLeadingMedia = `
  Weeklikse Gemeente-nuusblad
  Die Fontein
  ![DXF](${imageUrl})
  [DXF oopmaak](${fileUrl})
  (klik op die foto vir Die Fontein)
  [Kliek hier vir 2022 Nuus](/nuus/nuus-2022)
  Aanbieding oor selfverdediging
  Die gemeente het 'n praktiese aanbieding bygewoon.
`
assert.equal(
  createArticleExcerpt(newsWithLeadingMedia),
  "Aanbieding oor selfverdediging Die gemeente het 'n praktiese aanbieding bygewoon."
)

const oldSummaryUrl =
  'https://www.annlin.co.za/wp-content/uploads/2025/03/2025-03-02-Oggend-Preeksamevatting.pdf'
const currentSummaryUrl =
  'https://www.annlin.co.za/wp-content/uploads/2025/08/2025-07-27-Oggend-Preeksamevatting.pdf'
const summaryMarkup = `
  <a href="${currentSummaryUrl}">27 Julie 2025 Oggenderediens</a>
  <a href="${oldSummaryUrl}"><span><br /></span></a>
  <a href="${oldSummaryUrl}"><br /></a>
`
const preservedSummaries = ensureWordPressAssetsPreserved(
  summaryMarkup,
  preserveWordPressAssetMarkup(summaryMarkup)
)

assert.equal(preservedSummaries.match(new RegExp(oldSummaryUrl, 'g'))?.length, 1)
assert.match(
  preservedSummaries,
  /\[2025 03 02 Oggend Preeksamevatting\]\(https:\/\/www\.annlin\.co\.za/
)
assert.match(preservedSummaries, /\[27 Julie 2025 Oggenderediens\]\(https:\/\//)

const responsiveDiviMarkup = `
  [et_pb_text disabled_on="on|on|off"]<p>Desktop inhoud</p>[/et_pb_text]
  [et_pb_text disabled_on="off|off|on"]<p>Duplikaat mobiele inhoud</p>[/et_pb_text]
`
const desktopDiviMarkup = stripDuplicateResponsiveDiviModules(responsiveDiviMarkup)
assert.match(desktopDiviMarkup, /Desktop inhoud/)
assert.doesNotMatch(desktopDiviMarkup, /Duplikaat mobiele inhoud/)

const audioMarkdown = `
  Inleiding

  [Eerste oordenking](https://legacy.example/uploads/oordenking-01.mp3)
  [Tweede oordenking](https://legacy.example/uploads/oordenking-02.mp3)
  [Eerste oordenking duplikaat](https://legacy.example/uploads/oordenking-01.mp3)
  [Werkkaart](https://legacy.example/uploads/werkkaart.pdf)
`
assert.deepEqual(extractMarkdownAudioLinks(audioMarkdown), [
  {
    title: 'Eerste oordenking',
    url: 'https://legacy.example/uploads/oordenking-01.mp3',
  },
  {
    title: 'Tweede oordenking',
    url: 'https://legacy.example/uploads/oordenking-02.mp3',
  },
])
assert.doesNotMatch(stripMarkdownAudioLinks(audioMarkdown), /\.mp3/)
assert.match(stripMarkdownAudioLinks(audioMarkdown), /werkkaart\.pdf/)

assert.equal(
  replaceMigratedWordPressAssetLinks(
    '![Gebed](https://legacy.example/uploads/2026/02/pray-hands.png)'
  ),
  '![Gebed](/migrated/leesstof/oordenkings-gebed.png)'
)
assert.equal(
  replaceMigratedWordPressAssetLinks(
    '[Werkkaart](https://legacy.example/uploads/KINDERWERKKAART.pdf)'
  ),
  '[Werkkaart](https://legacy.example/uploads/KINDERWERKKAART.pdf)'
)

console.log('WordPress asset preservation checks passed.')

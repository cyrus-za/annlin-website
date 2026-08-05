import type { ReadingMaterialFileType } from '@prisma/client'

export type WordPressDocument = {
  id: number
  date?: string
  source_url: string
  mime_type: string
  title?: { rendered?: string }
}

export type PublicationClassification = {
  category: string
  description: string
  contentDate: Date
  fileType: ReadingMaterialFileType
  isArchived: boolean
  title: string
  dedupeKey: string
  preferForWeb: boolean
}

const MONTHS = new Map([
  ['januarie', 0],
  ['februarie', 1],
  ['maart', 2],
  ['april', 3],
  ['mei', 4],
  ['junie', 5],
  ['julie', 6],
  ['augustus', 7],
  ['september', 8],
  ['oktober', 9],
  ['november', 10],
  ['desember', 11],
])

export const PUBLICATION_CATEGORIES = [
  'Die Fontein - Weekblad',
  'Die Fontein - Maandblad',
  'Liturgie',
  'Preeksamevattings',
  'Kinderwerk',
  'Oordenkings',
  'Jaarprogramme',
  'Uitreikmateriaal',
  'Algemene dokumente',
] as const

export function decodeWordPressTitle(value = '') {
  return value
    .replaceAll('&#038;', '&')
    .replaceAll('&amp;', '&')
    .replaceAll('&#8211;', '-')
    .replaceAll('&#8212;', '-')
    .replaceAll('&ndash;', '-')
    .replaceAll('&mdash;', '-')
    .replaceAll('&nbsp;', ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day))
}

function extractContentDate(document: WordPressDocument, value: string) {
  const iso = value.match(/\b(20\d{2})[-_](0?[1-9]|1[0-2])[-_](0?[1-9]|[12]\d|3[01])\b/)
  if (iso) return utcDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))

  const afrikaansDate = value.match(
    /\b(0?[1-9]|[12]\d|3[01])[-_ ]+(Januarie|Februarie|Maart|April|Mei|Junie|Julie|Augustus|September|Oktober|November|Desember)[-_ ]+(20\d{2})\b/i
  )
  if (afrikaansDate) {
    return utcDate(
      Number(afrikaansDate[3]),
      MONTHS.get(afrikaansDate[2]?.toLowerCase() || '') || 0,
      Number(afrikaansDate[1])
    )
  }

  const afrikaansMonth = value.match(
    /\b(Januarie|Februarie|Maart|April|Mei|Junie|Julie|Augustus|September|Oktober|November|Desember)[-_ ]+(20\d{2})\b/i
  )
  if (afrikaansMonth) {
    return utcDate(
      Number(afrikaansMonth[2]),
      MONTHS.get(afrikaansMonth[1]?.toLowerCase() || '') || 0,
      1
    )
  }

  const uploaded = document.date ? new Date(document.date) : new Date(0)
  if (!Number.isNaN(uploaded.getTime()) && uploaded.getTime() > 0) {
    return utcDate(uploaded.getUTCFullYear(), uploaded.getUTCMonth(), uploaded.getUTCDate())
  }

  throw new Error(`No content date could be determined for WordPress media ${document.id}.`)
}

function categoryFor(value: string, mimeType: string) {
  if (/maandblad/i.test(value)) return 'Die Fontein - Maandblad'
  if (/weekblad|die[-_ ]fontein/i.test(value)) return 'Die Fontein - Weekblad'
  if (/liturgie/i.test(value)) return 'Liturgie'
  if (/preek.*samevat|preeksamevat/i.test(value)) return 'Preeksamevattings'
  if (/kinderwerk|kinderkerk|gehoorsaamheid|selfbeheersing|nederigheid|\bles 1\b/i.test(value)) {
    return 'Kinderwerk'
  }
  if (/ons[-_ ]gesels[-_ ]oor[-_ ]jesus/i.test(value) || mimeType === 'audio/mpeg') {
    return 'Oordenkings'
  }
  if (/jaarprogram/i.test(value)) return 'Jaarprogramme'
  if (/outreach|uitreik|dissipelskap|nampula|ribaue|truth.*recon/i.test(value)) {
    return 'Uitreikmateriaal'
  }
  return 'Algemene dokumente'
}

function fileTypeFor(mimeType: string): ReadingMaterialFileType {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  return 'DOC'
}

function isHistoricalArchive(category: string, value: string) {
  if (category !== 'Algemene dokumente' && category !== 'Jaarprogramme') return false

  return /registrasie|uitnodiging|advertensie|vakature|kamp|wegbreek|re[eë]ls|pos\b|popi|jaarprogram[-_ ]+\d+|jaarprogram.*finaal/i.test(
    value
  )
}

export function classifyWordPressDocument(
  document: WordPressDocument
): PublicationClassification | null {
  if (!['application/pdf', 'audio/mpeg'].includes(document.mime_type) && !document.mime_type.includes('presentation')) {
    return null
  }

  const originalTitle = decodeWordPressTitle(document.title?.rendered)
  const value = `${originalTitle} ${decodeURIComponent(document.source_url)}`
  const category = categoryFor(value, document.mime_type)
  const contentDate = extractContentDate(document, value)
  const monthKey = contentDate.toISOString().slice(0, 7)
  const title = originalTitle.replace(/\s+-?\s*WEB\s*$/i, '').replace(/\s+/g, ' ').trim()

  return {
    category,
    contentDate,
    fileType: fileTypeFor(document.mime_type),
    isArchived: isHistoricalArchive(category, value),
    title: title || `WordPress-dokument ${document.id}`,
    description:
      category === 'Die Fontein - Maandblad' || category === 'Die Fontein - Weekblad'
        ? 'Die Fontein, die gemeente se nuuspublikasie.'
        : `${category} uit die voormalige Annlin-webwerf.`,
    dedupeKey:
      category === 'Die Fontein - Maandblad' ? `die-fontein-maandblad-${monthKey}` : `wp-media-${document.id}`,
    preferForWeb: /\bweb\b/i.test(value),
  }
}

export function canonicalWordPressDocuments(documents: WordPressDocument[]) {
  const grouped = new Map<
    string,
    { document: WordPressDocument; classification: PublicationClassification }[]
  >()

  for (const document of documents) {
    const classification = classifyWordPressDocument(document)
    if (!classification) continue
    const group = grouped.get(classification.dedupeKey) || []
    group.push({ document, classification })
    grouped.set(classification.dedupeKey, group)
  }

  return [...grouped.values()].map((variants) => {
    const canonical = [...variants].sort((left, right) => {
      if (left.classification.preferForWeb !== right.classification.preferForWeb) {
        return left.classification.preferForWeb ? -1 : 1
      }
      return right.document.id - left.document.id
    })[0]
    if (!canonical) throw new Error('A publication variant group was unexpectedly empty.')
    return canonical
  })
}

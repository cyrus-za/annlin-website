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

const KNOWN_PUBLICATION_TITLES = new Map<number, string>([
  [13201, 'Terwyl die Here voluit werk, span ek my ook in!'],
  [13119, 'Wanneer die Here besig is, gebeur dinge!'],
  [13098, 'Wie is in die kollig?'],
  [13085, 'Onthou jy die Here?'],
  [13078, 'Salig-sagmoedig ondanks die klipharde werklikheid'],
  [13017, 'Die gemeentepad tussen Jerusalem en Jerigo'],
  [12833, 'Die Heilige Gees oes God se kinders in'],
  [12765, 'Die Christelike lewenstyl word gekenmerk deur dankbaarheid, liefde en omvorming deur die Gees'],
  [12698, 'U is die God wat my sien!'],
  [12682, 'Uit die dieptes roep ons!'],
  [12672, 'Sit jou hoop op die genade wat kom!'],
  [12554, 'Ek leef elke oomblik in Jesus'],
  [12541, 'Ek kan alles hanteer danksy Christus!'],
  [12529, "Die Kerk is 'n gebou in konstruksie"],
  [12452, 'Die hoop in Christus bring volharding en beproefdheid'],
  [12407, 'Te midde van dood: Sien Jesus raak!'],
  [12396, 'Christus is in julle'],
  [12381, 'Die Here Jesus het opgestaan!'],
  [12364, "'n Koning op 'n donkie bring hoop!"],
  [12357, 'Leef en laat leef uit God se genade'],
  [12327, 'Jesus, die Seun, die Klip en ons'],
  [12265, 'Waar is ek regtig veilig?'],
  [12254, 'Die misterie van God se wonderdade'],
  [12091, 'Jesus is uiters kosbaar!'],
  [12081, 'Jesus is groots, by ons en genadig!'],
  [12071, 'Jesus gee ruimte om te lewe'],
  [12054, 'Jesus is Koning in liefde'],
  [12052, 'Jesus is my geliefde Seun'],
  [11901, 'Advertensie vir terreinwerker'],
  [11941, 'Ons Here Jesus is ...'],
  [11939, 'Moenie bang wees nie, maar glo, want God is by jou!'],
  [11922, "Die Here sorg vir 'n tuin-toekoms!"],
  [11657, 'In watter mate is jy persoonlik met Jesus besig en op Jesus gerig?'],
  [11656, 'Hoe word ons in die geloof versterk deur te bely dat die Heilige Gees Here is en lewend maak?'],
  [11655, "Ek beloof om as 'n lewende lid van die kerk my gawes aan te wend"],
  [11636, 'Hoe gaan dit met jou en my vrug dra, heilig leef en elke oomblik vir God leef?'],
  [11635, 'Hoe voel, dink en praat ons oor ons broers en susters wat alleen leef?'],
  [11404, 'Hoe opgewonde is jy en ek oor Koning Jesus?'],
  [11403, 'Hoe bly jou en my harte by die Here?'],
  [11402, 'Wat het ons as Christene nodig om sinvol koning te kan wees?'],
  [11401, 'Hoe voel jy wanneer jy in die Here se teenwoordigheid kom en leef?'],
  [11393, 'Wat bied ons Here Jesus aan jou en my as stukkende mense?'],
  [11392, 'Watter tipe Koning dien jy en ek?'],
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

function cleanDateWorkarounds(value: string) {
  return value
    .replace(/([A-Za-zÀ-ž])(?=\d)/g, '$1 ')
    .replace(/\b20\d{2}[-_.](?:0?[1-9]|1[0-2])[-_.](?:0?[1-9]|[12]\d|3[01])\b/g, ' ')
    .replace(
      /\b(?:Sondag\s+)?(?:0?[1-9]|[12]\d|3[01])\s+(?:Januarie|Februarie|Maart|April|Mei|Junie|Julie|Augustus|September|Oktober|November|Desember)(?:\s+20\d{2})?\b/gi,
      ' '
    )
    .replace(/^\s*[-–—:()]+|[-–—:()]+\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function publicationTitle(documentId: number, category: string, originalTitle: string) {
  const knownTitle = KNOWN_PUBLICATION_TITLES.get(documentId)
  if (knownTitle) return knownTitle

  if (category === 'Die Fontein - Weekblad') return 'Die Fontein Weekblad'
  if (category === 'Die Fontein - Maandblad') return 'Die Fontein Maandblad'
  if (category === 'Liturgie') return 'Liturgie'

  if (category === 'Preeksamevattings') {
    if (/aand/i.test(originalTitle)) return 'Aandpreeksamevatting'
    if (/oggend/i.test(originalTitle)) return 'Oggendpreeksamevatting'
    return 'Preeksamevatting'
  }

  if (category === 'Jaarprogramme') {
    const year = originalTitle.match(/\b(20\d{2})\b/)?.[1]
    return year ? `Jaarprogram ${year}` : 'Jaarprogram'
  }

  const normalized = originalTitle
    .replace(/\s+-?\s*WEB\s*$/i, '')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (category === 'Kinderwerk') {
    return cleanDateWorkarounds(normalized)
      .replace(/^KINDERWERKKAART\s*/i, 'Kinderwerkkaart: ')
      .replace(/^Kinderkerk\s*-\s*/i, 'Kinderkerk: ')
      .replace(/:\s*$/, '')
  }

  return cleanDateWorkarounds(normalized)
}

export function publicationDescription(category: string) {
  const descriptions: Record<string, string> = {
    'Die Fontein - Maandblad': 'Die Fontein, die gemeente se maandelikse nuuspublikasie.',
    'Die Fontein - Weekblad': 'Die Fontein, die gemeente se weeklikse nuuspublikasie.',
    Liturgie: 'Die liturgie vir die erediens.',
    Preeksamevattings: "'n Samevatting van die preek.",
    Kinderwerk: 'Geloofsvormingsmateriaal vir kinders.',
    Oordenkings: 'Oordenkings vir persoonlike luister en groei.',
    Jaarprogramme: 'Gemeenteprogramme en jaarbeplanning.',
    Uitreikmateriaal: 'Toerusting en verslae vir die gemeente se uitreikwerk.',
    'Algemene dokumente': 'Dokument uit die gemeente se hulpbronbiblioteek.',
  }

  return descriptions[category] || 'Leesstof uit die gemeente se hulpbronbiblioteek.'
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
  const title = publicationTitle(document.id, category, originalTitle)

  return {
    category,
    contentDate,
    fileType: fileTypeFor(document.mime_type),
    isArchived: isHistoricalArchive(category, value),
    title: title || `Dokument ${document.id}`,
    description: publicationDescription(category),
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

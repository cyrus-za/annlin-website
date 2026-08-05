#!/usr/bin/env tsx

import { ArticleStatus } from '@prisma/client'
import { disconnectDatabase, prisma } from '../lib/db'
import { createArticleExcerpt, normalizeArticleContent } from '../lib/public-content'

type StorySpec = {
  sourceSlug: string
  sourceTitle: string
  title?: string
  slug: string
  contentDate: string
  showDate?: boolean
  prependFiles?: string[]
  excludeFiles?: string[]
  assetOnlyFile?: string
  excerpt?: string
}

const storySpecs: StorySpec[] = [
  {
    sourceSlug: 'nuus-2021',
    sourceTitle: '2021 Begin met inperkings op eredienste',
    slug: 'begin-met-inperkings-op-eredienste-2021',
    contentDate: '2021-01-01',
    showDate: false,
  },
  { sourceSlug: 'nuus-2021', sourceTitle: 'Pinksterviering 2021', slug: 'pinksterviering-2021', contentDate: '2021-05-22' },
  { sourceSlug: 'nuus-2021', sourceTitle: 'Die Susters bederf die Seniors', slug: 'die-susters-bederf-die-seniors-2021', contentDate: '2021-11-06' },
  {
    sourceSlug: 'nuus-2021',
    sourceTitle: '2 e Handse Goedereverkopings weer op volle spoed',
    title: 'Tweedehandse Goedereverkoping weer op volle spoed',
    slug: 'tweedehandse-goedereverkoping-weer-op-volle-spoed-2021',
    contentDate: '2021-05-01',
    showDate: false,
  },
  {
    sourceSlug: 'nuus-2021',
    sourceTitle: 'Uitreik na Hospi-taalpersoneel',
    title: 'Uitreik na hospitaalpersoneel',
    slug: 'uitreik-na-hospitaalpersoneel-2021',
    contentDate: '2021-01-01',
    showDate: false,
  },
  {
    sourceSlug: 'nuus-2021',
    sourceTitle: 'Die Heidelbergse Kategismus vertaal in Lomwe',
    slug: 'heidelbergse-kategismus-vertaal-in-lomwe',
    contentDate: '2021-07-01',
    showDate: false,
  },
  {
    sourceSlug: 'nuus-2021',
    sourceTitle: 'Drie predikante reis eersdaags na Mosambiek',
    slug: 'drie-predikante-reis-na-mosambiek-2021',
    contentDate: '2021-07-02',
    showDate: false,
  },
  { sourceSlug: 'nuus-2021', sourceTitle: 'Vordering met Mosambiek Uitreik', slug: 'vordering-met-mosambiek-uitreik-2021', contentDate: '2021-07-02' },

  { sourceSlug: 'nuus-2022', sourceTitle: 'Verandering van eredienstye', slug: 'verandering-van-eredienstye-2022', contentDate: '2022-01-02' },
  { sourceSlug: 'nuus-2022', sourceTitle: 'Ons kerk hou kermis', slug: 'ons-kerk-hou-kermis-2022', contentDate: '2022-03-12' },
  { sourceSlug: 'nuus-2022', sourceTitle: 'Genotvolle Kerkkamp.', title: 'Genotvolle kerkkamp', slug: 'genotvolle-kerkkamp-2022', contentDate: '2022-09-02' },
  { sourceSlug: 'nuus-2022', sourceTitle: 'Laerskooljeug se Boemelaarsaand', slug: 'laerskooljeug-se-boemelaarsaand-2022', contentDate: '2022-02-04' },
  { sourceSlug: 'nuus-2022', sourceTitle: '"Mystery" Aand vir ons Jeug', title: '“Mystery”-aand vir ons jeug', slug: 'mystery-aand-vir-ons-jeug-2022', contentDate: '2022-02-12' },
  { sourceSlug: 'nuus-2022', sourceTitle: '"Grot" onder water', title: '“Grot” onder water', slug: 'grot-onder-water-2022', contentDate: '2022-02-04' },
  {
    sourceSlug: 'nuus-2022',
    sourceTitle: 'Wat beteken dit om deur die Gees te leef?',
    title: 'Pinksterfees: Wat beteken dit om deur die Gees te leef?',
    slug: 'pinksterfeesvieringe-4-5-junie-2022',
    contentDate: '2022-06-04',
    prependFiles: ['Pinksterfees-2022.jpg'],
  },

  {
    sourceSlug: 'nuus-2023',
    sourceTitle: 'Aanbieding oor selfverdediging',
    slug: 'aanbieding-oor-selfverdediging-2023',
    contentDate: '2023-11-01',
    showDate: false,
    prependFiles: ['SE.jpg'],
  },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Diakonie praatjie: Vra die dierearts', slug: 'diakonie-praatjie-vra-die-dierearts-2023', contentDate: '2023-08-26' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Diakens bied werkswinkel aan', slug: 'diakens-bied-werkswinkel-aan-2023', contentDate: '2023-05-20' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Graad 1 kindertjies kry Bybels', slug: 'graad-1-kindertjies-kry-bybels-2023', contentDate: '2023-01-15' },
  {
    sourceSlug: 'nuus-2023',
    sourceTitle: 'Skop Nuwe Jaar af met gesellige braai',
    slug: 'skop-nuwe-jaar-af-met-gesellige-braai-2023',
    contentDate: '2023-01-14',
    excludeFiles: ['Speletjiesdag-20-Des-2023.jpg'],
  },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Verwelkom die Kurpershoek gesin!', title: 'Verwelkom die Kurpershoek-gesin', slug: 'verwelkom-die-kurpershoek-gesin-2023', contentDate: '2023-10-14' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Uitgestuur op hul sendingreis', slug: 'uitgestuur-op-hul-sendingreis-2023', contentDate: '2023-06-25' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Heerlike Pretdag', title: 'Heerlike pretdag', slug: 'heerlike-pretdag-2023', contentDate: '2023-05-13' },
  {
    sourceSlug: 'nuus-2023',
    sourceTitle: 'Ses jong lidmate doen belydenis van geloof',
    slug: 'ses-jong-lidmate-doen-belydenis-van-geloof-2023',
    contentDate: '2023-11-01',
    showDate: false,
    excludeFiles: ['kersliedere-23.png'],
  },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Senior Ontbyt - 4 November 2023', title: 'Seniorontbyt', slug: 'seniorontbyt-2023', contentDate: '2023-11-04' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Mosambiekspan terug', slug: 'mosambiekspan-terug-2023', contentDate: '2023-07-12' },
  {
    sourceSlug: 'nuus-2023',
    sourceTitle: "Dit was 'n geloofstap sê Giepie",
    slug: 'dit-was-n-geloofstap-se-giepie-2023',
    contentDate: '2023-07-01',
    showDate: false,
  },
  { sourceSlug: 'nuus-2023', sourceTitle: "Gemeente Wegbreeknaweek 2023 - 'n Saam-met-Mekaar Lewe", slug: 'gemeente-wegbreeknaweek-2023', contentDate: '2023-10-28' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Diakonie praatjie: Dwelms en afhanklikheid', slug: 'diakonie-praatjie-dwelms-en-afhanklikheid-2023', contentDate: '2023-07-22' },
  { sourceSlug: 'nuus-2023', sourceTitle: 'Dankie ds Attie', slug: 'dankie-ds-attie-2023', contentDate: '2023-06-24' },
  {
    sourceSlug: 'nuus-2023',
    sourceTitle: 'Speletjiesdag',
    title: 'Speletjiesdag',
    slug: 'speletjiesdag-20-desember-2023',
    contentDate: '2023-12-20',
    assetOnlyFile: 'Speletjiesdag-20-Des-2023.jpg',
    excerpt: 'Speletjiesdag vir gemeentelede wat gedurende Desember tuis was.',
  },
  {
    sourceSlug: 'nuus-2023',
    sourceTitle: 'Kersliedere by Kerslig',
    title: 'Kersliedere by Kerslig',
    slug: 'kersliedere-by-kerslig-2023',
    contentDate: '2023-12-24',
    assetOnlyFile: 'kersliedere-23.png',
    excerpt: 'Die gemeente se Kersliedere by Kerslig-geleentheid op Oukersaand 2023.',
  },

  { sourceSlug: 'nuus-2024', sourceTitle: 'Dopperspele 2024', slug: 'dopperspele-2024', contentDate: '2024-05-11' },
  { sourceSlug: 'nuus-2024', sourceTitle: 'Gemeentekamp 2024', slug: 'gemeentekamp-2024', contentDate: '2024-11-01', showDate: false },
  { sourceSlug: 'nuus-2024', sourceTitle: 'Annlin Senior-ontbyt', title: 'Annlin-seniorontbyt', slug: 'annlin-seniorontbyt-2024', contentDate: '2024-11-02' },
  { sourceSlug: 'nuus-2024', sourceTitle: 'Belydenis van Geloof en Doop', title: 'Belydenis van geloof en doop', slug: 'belydenis-van-geloof-en-doop-2024', contentDate: '2024-05-12' },
  { sourceSlug: 'nuus-2024', sourceTitle: 'Annlin Seniorete', title: 'Annlin se seniorete', slug: 'annlin-se-seniorete-2024', contentDate: '2024-01-01', showDate: false },
  { sourceSlug: 'nuus-2024', sourceTitle: 'Gemeente-Ete', title: 'Gemeente-ete', slug: 'gemeente-ete-2024', contentDate: '2024-02-18' },

  { sourceSlug: 'nuus-2026', sourceTitle: "Graad 1's 2026", title: 'Graad 1’s ontvang Bybels', slug: 'graad-1s-ontvang-bybels-2026', contentDate: '2026-01-18', excludeFiles: ['Article-Spread-2.png', 'Article-Spread-1.png', 'Die-Fontein-Maandblad-April-2026-16.jpg'] },
  {
    sourceSlug: 'nuus-2026',
    sourceTitle: 'Die Potjiekos-kompetisie ten bate van TOPIA op Saterdag, 14 Februarie 2026.🔥',
    title: 'Potjiekoskompetisie ten bate van TOPIA',
    slug: 'potjiekoskompetisie-ten-bate-van-topia-2026',
    contentDate: '2026-02-14',
    excerpt: 'Foto’s van die gemeente se potjiekoskompetisie ten bate van TOPIA-bediening.',
  },
]

const annualSlugs = [...new Set(storySpecs.map((story) => story.sourceSlug))]
const markdownImagePattern = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00Z`)
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function withoutFiles(value: string, filenames: string[] = []) {
  if (filenames.length === 0) return value
  const excluded = new Set(filenames)

  return value.replace(markdownImagePattern, (match, _alt: string, url: string) => {
    let filename = ''
    try {
      filename = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
    } catch {
      return match
    }
    return excluded.has(filename) ? '' : match
  })
}

function firstImageUrl(value: string) {
  markdownImagePattern.lastIndex = 0
  return markdownImagePattern.exec(value)?.[2] || null
}

function storyContent(
  sourceContent: string,
  story: StorySpec,
  sourceStories: StorySpec[],
  assetUrlByFilename: ReadonlyMap<string, string>
) {
  if (story.assetOnlyFile) {
    const url = assetUrlByFilename.get(story.assetOnlyFile)
    if (!url) throw new Error(`Missing uploaded asset for ${story.assetOnlyFile}.`)
    return `![${story.title || story.sourceTitle}](${url})`
  }

  const lines = splitLines(sourceContent)
  const start = lines.indexOf(story.sourceTitle)
  if (start < 0 || lines.lastIndexOf(story.sourceTitle) !== start) {
    throw new Error(`Expected one exact heading "${story.sourceTitle}" in ${story.sourceSlug}.`)
  }

  const segmentedStories = sourceStories.filter((candidate) => !candidate.assetOnlyFile)
  const storyIndex = segmentedStories.indexOf(story)
  const nextTitle = segmentedStories[storyIndex + 1]?.sourceTitle
  const end = nextTitle ? lines.indexOf(nextTitle, start + 1) : lines.length
  if (nextTitle && end < 0) {
    throw new Error(`Could not find next heading "${nextTitle}" in ${story.sourceSlug}.`)
  }

  const prepend = (story.prependFiles || []).map((filename) => {
    const url = assetUrlByFilename.get(filename)
    if (!url) throw new Error(`Missing uploaded asset for ${filename}.`)
    return `![${story.title || story.sourceTitle}](${url})`
  })
  const body = withoutFiles(lines.slice(start + 1, end).join('\n\n'), story.excludeFiles)
  const content = normalizeArticleContent([...prepend, body].filter(Boolean).join('\n\n'))

  if (!content) throw new Error(`Story ${story.slug} has no content after cleanup.`)
  return content
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run')
  if (apply === dryRun) throw new Error('Choose exactly one mode: --dry-run or --apply.')

  const [sources, uploadedAssets, existingArticles, admin, category] = await Promise.all([
    prisma.article.findMany({
      where: { slug: { in: annualSlugs } },
      select: { slug: true, content: true, status: true },
    }),
    prisma.uploadedAsset.findMany({ select: { filename: true, url: true } }),
    prisma.article.findMany({
      where: { slug: { in: storySpecs.map((story) => story.slug) } },
      select: { slug: true },
    }),
    prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' }, select: { id: true } }),
    prisma.articleCategory.findUnique({ where: { slug: 'algemeen' }, select: { id: true } }),
  ])

  if (!admin) throw new Error('No admin user exists for imported News stories.')
  if (!category) throw new Error('The algemeen News category does not exist.')

  const sourceBySlug = new Map(sources.map((source) => [source.slug, source]))
  const missingSources = annualSlugs.filter((slug) => !sourceBySlug.has(slug))
  if (missingSources.length > 0) throw new Error(`Missing annual News sources: ${missingSources.join(', ')}`)
  const nonArchived = sources.filter((source) => source.status !== ArticleStatus.ARCHIVED)
  if (nonArchived.length > 0) throw new Error(`Annual News sources must remain archived: ${nonArchived.map((source) => source.slug).join(', ')}`)

  const assetUrlByFilename = new Map(uploadedAssets.map((asset) => [asset.filename, asset.url]))
  const prepared = storySpecs.map((story) => {
    const source = sourceBySlug.get(story.sourceSlug)
    if (!source) throw new Error(`Missing source ${story.sourceSlug}.`)
    const sourceStories = storySpecs.filter((candidate) => candidate.sourceSlug === story.sourceSlug)
    const content = storyContent(source.content, story, sourceStories, assetUrlByFilename)
    const excerpt = story.excerpt || createArticleExcerpt(content, 240)
    return {
      ...story,
      title: story.title || story.sourceTitle,
      content,
      excerpt: excerpt || null,
      featuredImageUrl: firstImageUrl(content),
    }
  })

  if (apply) {
    await prisma.$transaction(async (transaction) => {
      for (const story of prepared) {
        const contentDate = dateAtNoon(story.contentDate)
        await transaction.article.upsert({
          where: { slug: story.slug },
          update: {
            title: story.title,
            content: story.content,
            excerpt: story.excerpt,
            featuredImageUrl: story.featuredImageUrl,
            categoryId: category.id,
            status: ArticleStatus.PUBLISHED,
            contentDate,
            showDate: story.showDate ?? true,
            publishedAt: contentDate,
            authorId: admin.id,
          },
          create: {
            title: story.title,
            slug: story.slug,
            content: story.content,
            excerpt: story.excerpt,
            featuredImageUrl: story.featuredImageUrl,
            categoryId: category.id,
            status: ArticleStatus.PUBLISHED,
            contentDate,
            showDate: story.showDate ?? true,
            publishedAt: contentDate,
            authorId: admin.id,
          },
        })
      }
    }, { timeout: 60_000 })
  }

  const existingSlugs = new Set(existingArticles.map((article) => article.slug))
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    annualSources: annualSlugs.length,
    stories: prepared.length,
    created: apply ? prepared.filter((story) => !existingSlugs.has(story.slug)).length : 0,
    updated: apply ? prepared.filter((story) => existingSlugs.has(story.slug)).length : 0,
    hiddenApproximateDates: prepared.filter((story) => story.showDate === false).length,
    withImages: prepared.filter((story) => story.featuredImageUrl).length,
    bySource: Object.fromEntries(annualSlugs.map((slug) => [slug, prepared.filter((story) => story.sourceSlug === slug).length])),
    records: prepared.map((story) => ({
      slug: story.slug,
      title: story.title,
      contentDate: story.contentDate,
      showDate: story.showDate ?? true,
      contentLength: story.content.length,
      hasImage: Boolean(story.featuredImageUrl),
      exists: existingSlugs.has(story.slug),
    })),
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)

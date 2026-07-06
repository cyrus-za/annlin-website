#!/usr/bin/env tsx

import { disconnectDatabase, prisma } from '../lib/db'

const KERKDIENSTGEMIST_STATION_NEEDLE =
  'kerkdienstgemist.nl/stations/1246'
const YOUTUBE_SERMON_CHANNEL_NEEDLE = 'youtube.com/channel/UC4NmYnuAd0293vFhf1i-tpg'

const KERKDIENSTGEMIST_STATION_TEST_PATTERN =
  /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/i
const YOUTUBE_SERMON_CHANNEL_TEST_PATTERN =
  /\bhttps?:\/\/(?:www\.)?youtube\.com\/channel\/UC4NmYnuAd0293vFhf1i-tpg[^\s]*/i

function normalizeDescription(value: string) {
  return value
    .replace(
      /\s*Vir die video uitsending,?\s*klik asb op die volgende skakel:\s*\bhttps?:\/\/(?:www\.)?youtube\.com\/channel\/UC4NmYnuAd0293vFhf1i-tpg[^\s]*/gi,
      ''
    )
    .replace(
      /\s*As u egter nie die betrokke erediens raaksien nie,\s*klik dan links bo op [“"]uploads[”"]\.\s*Dit behoort die webwerf op te dateer\./gi,
      ''
    )
    .replace(
      /\s*Vir die klankuitsending,?\s*klik op die volgende skakel:\s*\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/gi,
      ''
    )
    .replace(
      /\bhttps?:\/\/kerkdienstgemist\.nl\/stations\/1246[^\s]*/gi,
      ''
    )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim()
}

async function main() {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        {
          description: {
            contains: KERKDIENSTGEMIST_STATION_NEEDLE,
            mode: 'insensitive',
          },
        },
        {
          sermonUrl: {
            contains: KERKDIENSTGEMIST_STATION_NEEDLE,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: YOUTUBE_SERMON_CHANNEL_NEEDLE,
            mode: 'insensitive',
          },
        },
        {
          sermonUrl: {
            contains: YOUTUBE_SERMON_CHANNEL_NEEDLE,
            mode: 'insensitive',
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      sermonUrl: true,
    },
  })

  for (const event of events) {
    const description = normalizeDescription(event.description)

    await prisma.event.update({
      where: { id: event.id },
      data: {
        description: description || event.title,
        sermonUrl: '/uitsendings',
      },
    })
  }

  const remainingRawLinks = await prisma.event.count({
    where: {
      OR: [
        {
          description: {
            contains: KERKDIENSTGEMIST_STATION_NEEDLE,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: YOUTUBE_SERMON_CHANNEL_NEEDLE,
            mode: 'insensitive',
          },
        },
      ],
    },
  })

  const internalUitsendingsLinks = await prisma.event.count({
    where: {
      sermonUrl: '/uitsendings',
    },
  })

  console.log(
    JSON.stringify(
      {
        updated: events.length,
        remainingRawLinks,
        internalUitsendingsLinks,
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          hadRawDescriptionLink:
            KERKDIENSTGEMIST_STATION_TEST_PATTERN.test(event.description) ||
            YOUTUBE_SERMON_CHANNEL_TEST_PATTERN.test(event.description),
          hadRawSermonUrl:
            (event.sermonUrl?.includes(KERKDIENSTGEMIST_STATION_NEEDLE) ||
              event.sermonUrl?.includes(YOUTUBE_SERMON_CHANNEL_NEEDLE)) ??
            false,
        })),
      },
      null,
      2
    )
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })

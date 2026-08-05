export const serviceGroupImages = {
  hospitaalbesoeke: {
    thumbnailUrl: '/images/diensgroepe/hospitaalbesoeke-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/hospitaalbesoeke-banner.webp',
  },
  'seniors-2': {
    thumbnailUrl: '/images/diensgroepe/seniors-2-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/seniors-2-banner.webp',
  },
  jeugbediening: {
    thumbnailUrl: '/images/diensgroepe/jeugbediening-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/jeugbediening-banner.webp',
  },
  'sosiale-dienste': {
    thumbnailUrl: '/images/diensgroepe/sosiale-dienste-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/sosiale-dienste-banner.webp',
  },
  'tradisionele-dienste': {
    thumbnailUrl: '/images/diensgroepe/tradisionele-dienste-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/tradisionele-dienste-banner.webp',
  },
  'versorging-en-barmhartigheid-2': {
    thumbnailUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-banner.webp',
  },
  'vervoer-2': {
    thumbnailUrl: '/images/diensgroepe/vervoer-2-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/vervoer-2-banner.webp',
  },
  'verwelkoming-en-gasvryheid': {
    thumbnailUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-banner.webp',
  },
  gebedsgroepe: {
    thumbnailUrl: '/images/diensgroepe/gebedsgroepe-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/gebedsgroepe-banner.webp',
  },
  'evangelisasie-blad': {
    thumbnailUrl: '/images/diensgroepe/evangelisasie-blad-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/evangelisasie-blad-banner.webp',
  },
  'tweedehandse-goedere-verkopings': {
    thumbnailUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-banner.webp',
  },
  terebinte: {
    thumbnailUrl: '/images/diensgroepe/terebinte-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/terebinte-banner.webp',
  },
  susters: {
    thumbnailUrl: '/images/diensgroepe/susters-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/susters-banner.webp',
  },
  sekuriteit: {
    thumbnailUrl: '/images/diensgroepe/sekuriteit-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/sekuriteit-banner.webp',
  },
  'fontein-redaksie': {
    thumbnailUrl: '/images/diensgroepe/fontein-redaksie-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/fontein-redaksie-banner.webp',
  },
  'vroue-bedieningsgroep': {
    thumbnailUrl: '/images/diensgroepe/vroue-bedieningsgroep-thumbnail.webp',
    bannerUrl: '/images/diensgroepe/vroue-bedieningsgroep-banner.webp',
  },
} as const

export type ServiceGroupImageSlug = keyof typeof serviceGroupImages

export function getServiceGroupImages(slug: string) {
  return serviceGroupImages[slug as ServiceGroupImageSlug]
}

export const serviceGroupImages = {
  hospitaalbesoeke: {
    thumbnailUrl: '/images/diensgroepe/hospitaalbesoeke-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/hospitaalbesoeke-banner-v2.webp',
  },
  'seniors-2': {
    thumbnailUrl: '/images/diensgroepe/seniors-2-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/seniors-2-banner-v2.webp',
  },
  jeugbediening: {
    thumbnailUrl: '/images/diensgroepe/jeugbediening-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/jeugbediening-banner-v2.webp',
  },
  'sosiale-dienste': {
    thumbnailUrl: '/images/diensgroepe/sosiale-dienste-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/sosiale-dienste-banner-v2.webp',
  },
  'tradisionele-dienste': {
    thumbnailUrl: '/images/diensgroepe/tradisionele-dienste-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/tradisionele-dienste-banner-v2.webp',
  },
  'versorging-en-barmhartigheid-2': {
    thumbnailUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-banner-v2.webp',
  },
  'vervoer-2': {
    thumbnailUrl: '/images/diensgroepe/vervoer-2-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/vervoer-2-banner-v2.webp',
  },
  'verwelkoming-en-gasvryheid': {
    thumbnailUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-banner-v2.webp',
  },
  gebedsgroepe: {
    thumbnailUrl: '/images/diensgroepe/gebedsgroepe-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/gebedsgroepe-banner-v2.webp',
  },
  'evangelisasie-blad': {
    thumbnailUrl: '/images/diensgroepe/evangelisasie-blad-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/evangelisasie-blad-banner-v2.webp',
  },
  'tweedehandse-goedere-verkopings': {
    thumbnailUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-banner-v2.webp',
  },
  terebinte: {
    thumbnailUrl: '/images/diensgroepe/terebinte-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/terebinte-banner-v2.webp',
  },
  susters: {
    thumbnailUrl: '/images/diensgroepe/susters-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/susters-banner-v2.webp',
  },
  sekuriteit: {
    thumbnailUrl: '/images/diensgroepe/sekuriteit-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/sekuriteit-banner-v2.webp',
  },
  'fontein-redaksie': {
    thumbnailUrl: '/images/diensgroepe/fontein-redaksie-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/fontein-redaksie-banner-v2.webp',
  },
  'vroue-bedieningsgroep': {
    thumbnailUrl: '/images/diensgroepe/vroue-bedieningsgroep-thumbnail-v2.webp',
    bannerUrl: '/images/diensgroepe/vroue-bedieningsgroep-banner-v2.webp',
  },
} as const

export type ServiceGroupImageSlug = keyof typeof serviceGroupImages

export function getServiceGroupImages(slug: string) {
  return serviceGroupImages[slug as ServiceGroupImageSlug]
}

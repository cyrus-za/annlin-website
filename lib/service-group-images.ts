export const serviceGroupImages = {
  hospitaalbesoeke: {
    thumbnailUrl: '/images/diensgroepe/hospitaalbesoeke-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/hospitaalbesoeke-banner-v4.webp',
  },
  'seniors-2': {
    thumbnailUrl: '/images/diensgroepe/seniors-2-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/seniors-2-banner-v4.webp',
  },
  jeugbediening: {
    thumbnailUrl: '/images/diensgroepe/jeugbediening-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/jeugbediening-banner-v4.webp',
  },
  'sosiale-dienste': {
    thumbnailUrl: '/images/diensgroepe/sosiale-dienste-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/sosiale-dienste-banner-v4.webp',
  },
  'tradisionele-dienste': {
    thumbnailUrl: '/images/diensgroepe/tradisionele-dienste-thumbnail-v3.webp',
    bannerUrl: '/images/diensgroepe/tradisionele-dienste-banner-v3.webp',
  },
  'versorging-en-barmhartigheid-2': {
    thumbnailUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-banner-v4.webp',
  },
  'vervoer-2': {
    thumbnailUrl: '/images/diensgroepe/vervoer-2-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/vervoer-2-banner-v4.webp',
  },
  'verwelkoming-en-gasvryheid': {
    thumbnailUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-banner-v4.webp',
  },
  gebedsgroepe: {
    thumbnailUrl: '/images/diensgroepe/gebedsgroepe-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/gebedsgroepe-banner-v4.webp',
  },
  'evangelisasie-blad': {
    thumbnailUrl: '/images/diensgroepe/evangelisasie-blad-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/evangelisasie-blad-banner-v4.webp',
  },
  'tweedehandse-goedere-verkopings': {
    thumbnailUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-banner-v4.webp',
  },
  terebinte: {
    thumbnailUrl: '/images/diensgroepe/terebinte-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/terebinte-banner-v4.webp',
  },
  susters: {
    thumbnailUrl: '/images/diensgroepe/susters-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/susters-banner-v4.webp',
  },
  sekuriteit: {
    thumbnailUrl: '/images/diensgroepe/sekuriteit-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/sekuriteit-banner-v4.webp',
  },
  'fontein-redaksie': {
    thumbnailUrl: '/images/diensgroepe/fontein-redaksie-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/fontein-redaksie-banner-v4.webp',
  },
  'vroue-bedieningsgroep': {
    thumbnailUrl: '/images/diensgroepe/vroue-bedieningsgroep-thumbnail-v4.webp',
    bannerUrl: '/images/diensgroepe/vroue-bedieningsgroep-banner-v4.webp',
  },
} as const

export type ServiceGroupImageSlug = keyof typeof serviceGroupImages

export function getServiceGroupImages(slug: string) {
  return serviceGroupImages[slug as ServiceGroupImageSlug]
}

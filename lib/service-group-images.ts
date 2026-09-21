export const serviceGroupImages = {
  hospitaalbesoeke: {
    thumbnailUrl: '/images/diensgroepe/hospitaalbesoeke-thumbnail-v6.webp',
    bannerUrl: '/images/diensgroepe/hospitaalbesoeke-banner-v6.webp',
  },
  'seniors-2': {
    thumbnailUrl: '/images/diensgroepe/seniors-2-thumbnail-v6.webp',
    bannerUrl: '/images/diensgroepe/seniors-2-banner-v6.webp',
  },
  jeugbediening: {
    thumbnailUrl: '/images/diensgroepe/jeugbediening-thumbnail-v6.webp',
    bannerUrl: '/images/diensgroepe/jeugbediening-banner-v6.webp',
  },
  'sosiale-dienste': {
    thumbnailUrl: '/images/diensgroepe/sosiale-dienste-thumbnail-v6.webp',
    bannerUrl: '/images/diensgroepe/sosiale-dienste-banner-v6.webp',
  },
  'tradisionele-dienste': {
    thumbnailUrl: '/images/diensgroepe/tradisionele-dienste-thumbnail-v8.webp',
    bannerUrl: '/images/diensgroepe/tradisionele-dienste-banner-v8.webp',
  },
  'versorging-en-barmhartigheid-2': {
    thumbnailUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/versorging-en-barmhartigheid-2-banner-v5.webp',
  },
  'vervoer-2': {
    thumbnailUrl: '/images/diensgroepe/vervoer-2-thumbnail-v6.webp',
    bannerUrl: '/images/diensgroepe/vervoer-2-banner-v6.webp',
  },
  'verwelkoming-en-gasvryheid': {
    thumbnailUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/verwelkoming-en-gasvryheid-banner-v5.webp',
  },
  gebedsgroepe: {
    thumbnailUrl: '/images/diensgroepe/gebedsgroepe-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/gebedsgroepe-banner-v5.webp',
  },
  'evangelisasie-blad': {
    thumbnailUrl: '/images/diensgroepe/evangelisasie-blad-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/evangelisasie-blad-banner-v5.webp',
  },
  'tweedehandse-goedere-verkopings': {
    thumbnailUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/tweedehandse-goedere-verkopings-banner-v5.webp',
  },
  terebinte: {
    thumbnailUrl: '/images/diensgroepe/terebinte-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/terebinte-banner-v5.webp',
  },
  susters: {
    thumbnailUrl: '/images/diensgroepe/susters-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/susters-banner-v5.webp',
  },
  sekuriteit: {
    thumbnailUrl: '/images/diensgroepe/sekuriteit-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/sekuriteit-banner-v5.webp',
  },
  'fontein-redaksie': {
    thumbnailUrl: '/images/diensgroepe/fontein-redaksie-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/fontein-redaksie-banner-v5.webp',
  },
  'vroue-bedieningsgroep': {
    thumbnailUrl: '/images/diensgroepe/vroue-bedieningsgroep-thumbnail-v5.webp',
    bannerUrl: '/images/diensgroepe/vroue-bedieningsgroep-banner-v5.webp',
  },
} as const

export type ServiceGroupImageSlug = keyof typeof serviceGroupImages

export function getServiceGroupImages(slug: string) {
  return serviceGroupImages[slug as ServiceGroupImageSlug]
}

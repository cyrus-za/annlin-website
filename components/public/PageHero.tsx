import Image, { getImageProps } from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  title: string
  description: ReactNode
  image: string
  mobileImage?: string
  icon: ReactNode
  imageClassName?: string
}

export function PageHero({ title, description, image, mobileImage, icon, imageClassName }: PageHeroProps) {
  const responsiveImage = mobileImage
    ? {
        desktop: getImageProps({
          src: image,
          alt: '',
          fill: true,
          sizes: '100vw',
          quality: 80,
          loading: 'eager',
          fetchPriority: 'high',
        }).props,
        mobile: getImageProps({
          src: mobileImage,
          alt: '',
          fill: true,
          sizes: '100vw',
          quality: 80,
          loading: 'eager',
          fetchPriority: 'high',
        }).props,
      }
    : null

  return (
    <section className="relative flex min-h-[24rem] items-end overflow-hidden bg-stone-900 sm:min-h-[30rem]">
      {responsiveImage ? (
        <picture className="absolute inset-0 block">
          <source
            media="(max-width: 639px)"
            sizes={responsiveImage.mobile.sizes}
            srcSet={responsiveImage.mobile.srcSet}
          />
          <img
            {...responsiveImage.desktop}
            alt=""
            className={cn('object-cover', imageClassName)}
          />
        </picture>
      ) : (
        <Image
          src={image}
          alt=""
          fill
          preload
          sizes="100vw"
          quality={80}
          className={cn('object-cover', imageClassName)}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgb(12 10 9 / 0.9), rgb(12 10 9 / 0.44) 58%, rgb(12 10 9 / 0.1))',
        }}
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 lg:px-8">
        <div className="max-w-3xl text-white">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-sm">
            {icon}
          </div>
          <h1 className="font-display text-5xl font-bold sm:text-6xl">{title}</h1>
          <div className="mt-6 text-lg leading-relaxed text-stone-100 sm:text-xl">{description}</div>
        </div>
      </div>
    </section>
  )
}

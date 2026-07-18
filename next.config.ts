import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack for development (already enabled via CLI flags)
  experimental: {
    // Keep low-tier Neon connections sequential while ISR pages are prerendered.
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationRetryCount: 3,
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-label',
      'framer-motion',
      'class-variance-authority',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add domains for externally uploaded images.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  // Redirects for SEO (will be populated during WordPress migration)
  async redirects() {
    const serviceGroupSlugs = [
      'hospitaalbesoeke',
      'seniors-2',
      'jeugbediening',
      'sosiale-dienste',
      'tradisionele-dienste',
      'versorging-en-barmhartigheid-2',
      'vervoer-2',
      'verwelkoming-en-gasvryheid',
      'gebedsgroepe',
      'evangelisasie-blad',
      'tweedehandse-goedere-verkopings',
      'terebinte',
      'susters',
      'sekuriteit',
      'fontein-redaksie',
      'vroue-bedieningsgroep',
    ]

    const readingSlugs = [
      'leesstof-2',
      'preke-op-skrif',
      'oordenkings-ons-gesels-oor-jesus',
      'kinderwerkkaarte',
      'ek-wil-weet',
    ]

    const newsSlugs = [
      'nuus-2025',
      'nuus-2024',
      'nuus-2023',
      'nuus-2022',
      'nuus-2021',
      'susters-saamtrek-2024',
      'pinksterfeesvieringe-4-5-junie-2022',
      'uitnodiging-diensteblad',
    ]

    const archiveSlugs = [
      'mosambiek-whatsappgroep',
      'manne-bedieningsgroep-4',
      'koor',
      'verwelkoming',
      'katkisasie-leerkragte',
      'rousmart',
      'kleuterbediening',
      'verslawing2',
      'laerskooljeug',
      'katkisasie-fotoblad',
      'buitelandse-evangelisasie',
      'bybelverspreiding',
      'evangelisasie-omliggende-gebiede',
      'evangelisasie-eie-omgewing',
    ]

    const unavailableAdminSlugs = [
      'contact',
      'users',
      'users/invite',
      'statistics',
      'settings',
    ]

    return [
      { source: '/homepagenew', destination: '/', permanent: true },
      ...unavailableAdminSlugs.map((slug) => ({
        source: `/admin/${slug}`,
        destination: '/admin',
        permanent: false,
      })),
      {
        source: '/onlangse-video-uitsendings-van-preke',
        destination: '/uitsendings',
        permanent: true,
      },
      ...serviceGroupSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: '/diensgroepe',
        permanent: true,
      })),
      ...readingSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: '/leesstof',
        permanent: true,
      })),
      ...newsSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: '/nuus',
        permanent: true,
      })),
      ...archiveSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: '/leesstof',
        permanent: true,
      })),
      {
        source: '/event/:slug*',
        destination: '/jaarprogram',
        permanent: true,
      },
    ];
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Environment variables that should be available to the client
  env: {
    CUSTOM_KEY: process.env['CUSTOM_KEY'],
  },
};

export default nextConfig;

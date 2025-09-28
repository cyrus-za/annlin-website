import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack for development (already enabled via CLI flags)
  experimental: {
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
    // Add domains for external images (WordPress migration, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'annlin.co.za',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        port: '',
        pathname: '/**',
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
    return [
      // Example redirects - will be populated with actual WordPress URLs
      // {
      //   source: '/old-wordpress-path',
      //   destination: '/new-nextjs-path',
      //   permanent: true,
      // },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Environment variables that should be available to the client
  env: {
    CUSTOM_KEY: process.env['CUSTOM_KEY'],
  },
};

export default nextConfig;

// Global type declarations for the Annlin Church Website

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string
      DIRECT_URL?: string
      
      // Authentication
      BETTER_AUTH_SECRET: string
      BETTER_AUTH_URL: string
      
      // Email
      RESEND_API_KEY: string
      FROM_EMAIL: string
      
      // File Storage
      BLOB_READ_WRITE_TOKEN: string
      
      // Application
      NEXT_PUBLIC_APP_URL: string
      NODE_ENV: 'development' | 'production' | 'test'
      
      // Optional Admin Setup
      ADMIN_EMAIL?: string
      ADMIN_PASSWORD?: string
    }
  }
}

// Extend Window interface for client-side globals
declare interface Window {
  // Add any global window properties here
  gtag?: (...args: unknown[]) => void
}

// Module declarations for packages without types
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.svg?url' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.avif' {
  const content: string
  export default content
}

// CSS Modules and regular CSS
declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

export {}

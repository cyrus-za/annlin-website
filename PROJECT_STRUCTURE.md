# Project Structure

This document outlines the complete folder structure of the Annlin Church Website project.

```
annlin-website/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles with Tailwind CSS
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Homepage
│   └── favicon.ico              # Site favicon
│
├── components/                   # React components
│   ├── ui/                      # Base UI components (21st.dev inspired)
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card component
│   │   ├── input.tsx            # Input component
│   │   └── label.tsx            # Label component
│   ├── admin/                   # Admin dashboard components
│   │   └── index.ts             # Admin components index
│   └── public/                  # Public website components
│       └── index.ts             # Public components index
│
├── lib/                         # Utility functions and configurations
│   ├── services/                # Business logic services
│   │   └── index.ts             # Services index
│   ├── validations/             # Zod validation schemas
│   │   └── index.ts             # Validation schemas
│   ├── constants/               # Application constants
│   │   └── index.ts             # Constants definitions
│   ├── env.ts                   # Environment validation
│   └── utils.ts                 # Utility functions
│
├── types/                       # TypeScript type definitions
│   ├── index.ts                 # Main type definitions
│   └── global.d.ts              # Global type declarations
│
├── hooks/                       # Custom React hooks
│   ├── index.ts                 # Hooks index
│   ├── use-local-storage.ts     # localStorage hook
│   ├── use-debounce.ts          # Debounce hook
│   └── use-previous.ts          # Previous value hook
│
├── prisma/                      # Database schema and migrations
│   └── schema.prisma            # Prisma database schema
│
├── scripts/                     # Migration and utility scripts
│   └── README.md                # Scripts documentation
│
├── styles/                      # Additional CSS files
│   └── README.md                # Styles documentation
│
├── public/                      # Static assets
│   ├── next.svg                 # Next.js logo
│   ├── vercel.svg               # Vercel logo
│   ├── file.svg                 # File icon
│   ├── globe.svg                # Globe icon
│   └── window.svg               # Window icon
│
├── .git/                        # Git repository
├── .next/                       # Next.js build output (ignored)
├── node_modules/                # Dependencies (ignored)
│
├── .env.example                 # Environment variables template
├── .env.local                   # Environment variables (ignored)
├── .gitignore                   # Git ignore rules
├── .gitattributes               # Git attributes
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── eslint.config.mjs            # ESLint configuration
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lock file
├── README.md                    # Project documentation
├── ENVIRONMENT_SETUP.md         # Environment setup guide
└── PROJECT_STRUCTURE.md         # This file
```

## Directory Purposes

### `/app`
Next.js 15+ App Router pages and layouts. Each folder represents a route in the application.

### `/components`
- **`/ui`**: Base UI components using 21st.dev design principles
- **`/admin`**: Components specific to the admin dashboard
- **`/public`**: Components for the public-facing website

### `/lib`
- **`/services`**: Business logic and API service functions
- **`/validations`**: Zod schemas for form and data validation
- **`/constants`**: Application-wide constants and configuration

### `/types`
TypeScript type definitions for the entire application.

### `/hooks`
Custom React hooks for reusable stateful logic.

### `/prisma`
Database schema definition and migration files.

### `/scripts`
Migration scripts for WordPress import and other utilities.

### `/styles`
Additional CSS files for complex styling that can't be handled by Tailwind.

### `/public`
Static assets served directly by Next.js.

## Key Features

- **Modern Architecture**: Next.js 15+ with App Router
- **Type Safety**: Comprehensive TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design tokens
- **Authentication**: better-auth for secure admin access
- **File Storage**: Vercel Blob for media management
- **Email**: Resend for transactional emails
- **Rich Text**: Tiptap editor with Markdown storage

## Development Workflow

1. **Components**: Create in appropriate subdirectory (`ui`, `admin`, `public`)
2. **Pages**: Add to `/app` following App Router conventions
3. **Services**: Add business logic to `/lib/services`
4. **Types**: Define in `/types` for reusability
5. **Validation**: Create Zod schemas in `/lib/validations`
6. **Database**: Update schema in `/prisma/schema.prisma`

This structure supports scalable development and maintains clear separation of concerns.

#!/usr/bin/env tsx

/**
 * Script to create .env.local file with development values
 * Run this script to set up environment variables for development
 */

import { writeFileSync } from 'fs'
import { join } from 'path'

const envContent = `# Development Environment Variables
# These are placeholder values for development - replace with real values for production

# Database Configuration (NeonDB) - Development placeholder
DATABASE_URL="postgresql://dev:dev@localhost:5432/annlin_dev"
DIRECT_URL="postgresql://dev:dev@localhost:5432/annlin_dev"

# Authentication (better-auth) - Development
BETTER_AUTH_SECRET="dev-secret-key-that-is-at-least-32-characters-long-for-development"
BETTER_AUTH_URL="http://localhost:3000"

# Email Service (Resend) - Development placeholder
RESEND_API_KEY="re_development_api_key_placeholder"
FROM_EMAIL="dev@localhost.local"

# File Storage (Vercel Blob) - Development placeholder
BLOB_READ_WRITE_TOKEN="dev_blob_token_placeholder"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Admin User Setup
ADMIN_EMAIL="admin@localhost.local"
ADMIN_PASSWORD="admin123456"
`

const envPath = join(process.cwd(), '.env.local')

try {
  writeFileSync(envPath, envContent)
  console.log('✅ Created .env.local file with development values')
  console.log('📝 Note: These are placeholder values for development')
  console.log('🔧 Replace with real values for production use')
  console.log('📖 See ENVIRONMENT_SETUP.md for detailed instructions')
} catch (error) {
  console.error('❌ Error creating .env.local file:', error)
  process.exit(1)
}

# Environment Setup

This document explains how to set up the required environment variables for the Annlin Church Website.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration (NeonDB)
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname:port/database?sslmode=require"

# Authentication (better-auth)
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_here"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Admin User Setup (for initial seeding)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-password"
```

## Service Setup Instructions

### 1. NeonDB Setup
1. Create a new project at [neon.tech](https://neon.tech)
2. Copy the connection string and set it as `DATABASE_URL`
3. For direct connections, use the same URL as `DIRECT_URL`

### 2. Better Auth Secret
Generate a secure 32+ character secret:
```bash
openssl rand -base64 32
```

### 3. Resend Email Service
1. Sign up at [resend.com](https://resend.com)
2. Create an API key and set it as `RESEND_API_KEY`
3. Verify your domain and set `FROM_EMAIL`

### 4. Vercel Blob Storage
1. Create a Vercel project
2. Generate a Blob token with read/write permissions
3. Set it as `BLOB_READ_WRITE_TOKEN`

## Production Environment

For production deployment, ensure:
- All URLs use HTTPS
- `DATABASE_URL` points to your production NeonDB instance
- `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` use your production domain
- Use strong, unique secrets for production

## Database Setup

After setting up environment variables:

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Run database migrations:
```bash
npx prisma db push
```

3. (Optional) Seed the database:
```bash
npm run seed
```
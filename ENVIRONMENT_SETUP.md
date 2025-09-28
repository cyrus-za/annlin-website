# Environment Setup Guide

This guide will help you set up the required environment variables for the Annlin Church Website.

## Required Services

### 1. NeonDB (Database)
1. Visit [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from your dashboard
4. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   DIRECT_URL="postgresql://username:password@hostname:port/database"
   ```

### 2. Resend (Email Service)
1. Visit [resend.com](https://resend.com) and create an account
2. Generate an API key from your dashboard
3. Add to `.env.local`:
   ```
   RESEND_API_KEY="re_your_api_key_here"
   FROM_EMAIL="noreply@annlin.co.za"
   ```

### 3. Vercel Blob (File Storage)
1. Visit [vercel.com](https://vercel.com) and create an account
2. Create a new project or use existing one
3. Go to Storage → Create → Blob Store
4. Generate a read-write token
5. Add to `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"
   ```

## Authentication Setup
Generate a secure secret for better-auth:
```bash
# Generate a 32-character secret
openssl rand -base64 32
```

Add to `.env.local`:
```
BETTER_AUTH_SECRET="your-generated-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

## Application Configuration
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Optional Admin Setup
For initial admin user creation:
```
ADMIN_EMAIL="admin@annlin.co.za"
ADMIN_PASSWORD="your-secure-password"
```

## Complete .env.local Example
Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual service credentials.

## Validation
The application will validate all environment variables on startup using Zod schemas. If any required variables are missing or invalid, you'll see a clear error message.

## Security Notes
- Never commit `.env.local` to version control
- Use strong, unique passwords and API keys
- Rotate secrets regularly
- Use different credentials for development and production

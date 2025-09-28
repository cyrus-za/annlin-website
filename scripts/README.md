# Database Scripts

This directory contains various scripts for database management, testing, and setup.

## Available Scripts

### Database Setup and Migration

#### `npm run db:setup`
**Complete database setup script** - Runs all necessary steps to set up the database from scratch:
1. Tests database connection
2. Runs Prisma migrations (`db push`)
3. Generates Prisma client
4. Seeds database with initial data
5. Runs verification tests

Use this for initial setup or when setting up a new environment.

#### `npm run db:push`
Pushes the Prisma schema to the database (creates/updates tables).

#### `npm run db:generate`
Generates the Prisma client based on the current schema.

#### `npm run db:seed`
Seeds the database with initial data:
- Creates admin user (if ADMIN_EMAIL/ADMIN_PASSWORD are set)
- Creates default article categories (Sosiaal, Jeug, Sinode, etc.)
- Creates default event categories (Eredienste, Byeenkomste, etc.)
- Creates default reading material categories (Preke, Bybelstudie, etc.)

Options:
- `--force`: Overwrites existing data
- `--verbose`: Shows detailed output

### Testing Scripts

#### `npm run db:test`
Comprehensive database connection and health test:
- Basic connection test with retry logic
- Database health check with latency measurement
- Migration status verification
- Safe operation testing

#### `npm run auth:test`
Tests the authentication system setup.

#### `npm run invitations:test`
Tests the user invitation system.

## Script Details

### `setup-database.ts`
Complete database setup automation. Ideal for:
- Initial project setup
- Setting up new development environments
- Resetting database state
- CI/CD pipeline database initialization

### `seed-database.ts`
Database seeding with Afrikaans content for the church website:
- **Admin User**: Creates admin user from environment variables
- **Article Categories**: Sosiaal, Jeug, Sinode, Algemeen, Eredienste
- **Event Categories**: Eredienste, Byeenkomste, Jeugaktiwiteite, Sosiale Gebeure, Opleiding
- **Reading Material Categories**: Preke, Bybelstudie, Toesprake, Liedere, Algemeen

All categories include appropriate Afrikaans names and descriptions.

### `test-db-connection.ts`
Comprehensive database testing:
- Connection testing with retry logic
- Latency measurement
- Neon pool status monitoring
- Migration status checking
- Safe operation testing

## Environment Requirements

Ensure your `.env.local` file contains:

```bash
# Required for database operations
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Required for seeding admin user
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-password"

# Other required variables
BETTER_AUTH_SECRET="..."
RESEND_API_KEY="..."
# ... etc
```

## Usage Examples

### Initial Setup (New Project)
```bash
# Complete setup from scratch
npm run db:setup
```

### Development Workflow
```bash
# After schema changes
npm run db:push
npm run db:generate

# Test connection
npm run db:test

# Re-seed data if needed
npm run db:seed --force
```

### Troubleshooting
```bash
# Test just the connection
npm run db:test

# Check auth system
npm run auth:test

# Reseed with verbose output
npm run db:seed --force --verbose
```

## Error Handling

All scripts include:
- ✅ Comprehensive error handling
- ✅ Graceful shutdown on interruption
- ✅ Detailed error messages with troubleshooting tips
- ✅ Connection retry logic
- ✅ Safe operation wrappers

## Afrikaans Localization

The seeding script creates content in Afrikaans as required:
- Category names and descriptions are in Afrikaans
- Follows the project's localization guidelines
- Uses appropriate church terminology

## Security

- Passwords are hashed using bcryptjs with salt rounds of 12
- Environment variables are validated before use
- Database operations use safe wrappers with error handling
- Admin credentials are only displayed during initial setup
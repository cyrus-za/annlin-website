# Migration and Utility Scripts

This directory contains scripts for migrating content from WordPress and other utility functions.

## WordPress Migration Scripts

### `migrate-wordpress.ts`
Main migration script that orchestrates the entire migration process.

### `parse-wordpress-xml.ts`
Parses WordPress XML export files and extracts content.

### `migrate-content.ts`
Transforms WordPress content to Next.js format (HTML to Markdown).

### `migrate-media.ts`
Migrates media files from WordPress to Vercel Blob storage.

## Utility Scripts

### `seed-database.ts`
Seeds the database with initial data for development.

### `generate-types.ts`
Generates TypeScript types from database schema.

## Usage

Run scripts from the project root:

```bash
# Run WordPress migration
npm run migrate:wordpress

# Seed database
npm run seed

# Generate types
npm run generate:types
```

## Environment Variables

Scripts require the same environment variables as the main application. Ensure `.env.local` is configured before running migration scripts.

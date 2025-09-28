#!/usr/bin/env tsx

/**
 * Complete database setup script
 * Handles migrations and initial seeding
 * Usage: npm run db:setup
 */

import { execSync } from 'child_process'
import { checkDatabaseConnection, disconnectDatabase } from '../lib/db'

async function setupDatabase() {
  console.log('🚀 Starting complete database setup...')
  console.log('=' .repeat(60))
  
  try {
    // Step 1: Check if we can connect to the database
    console.log('\n📡 Step 1: Testing database connection...')
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      console.log('❌ Cannot connect to database.')
      console.log('💡 Please ensure:')
      console.log('   - Your .env.local file is configured with valid DATABASE_URL')
      console.log('   - Your database server is running and accessible')
      console.log('   - Your database credentials are correct')
      process.exit(1)
    }
    
    console.log('✅ Database connection successful!')
    
    // Step 2: Run Prisma migrations
    console.log('\n🔄 Step 2: Running database migrations...')
    try {
      execSync('npx prisma db push', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Database migrations completed!')
    } catch (error) {
      console.log('❌ Migration failed:', error)
      throw error
    }
    
    // Step 3: Generate Prisma client (in case schema changed)
    console.log('\n⚙️  Step 3: Regenerating Prisma client...')
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Prisma client generated!')
    } catch (error) {
      console.log('❌ Prisma client generation failed:', error)
      throw error
    }
    
    // Step 4: Run database seeding
    console.log('\n🌱 Step 4: Seeding database with initial data...')
    try {
      execSync('tsx scripts/seed-database.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Database seeding completed!')
    } catch (error) {
      console.log('❌ Database seeding failed:', error)
      throw error
    }
    
    // Step 5: Final verification
    console.log('\n✅ Step 5: Running final verification...')
    try {
      execSync('tsx scripts/test-db-connection.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Database verification passed!')
    } catch (error) {
      console.log('❌ Database verification failed:', error)
      throw error
    }
    
    // Success summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Database setup completed successfully!')
    console.log('=' .repeat(60))
    console.log('✅ Database migrations applied')
    console.log('✅ Prisma client generated')
    console.log('✅ Initial data seeded')
    console.log('✅ Database connection verified')
    console.log('\n🚀 Your application is ready to use!')
    console.log('💡 You can now start the development server with: npm run dev')
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error)
    console.log('\n💡 Troubleshooting tips:')
    console.log('   1. Check your DATABASE_URL in .env.local')
    console.log('   2. Ensure your database server is running')
    console.log('   3. Verify database credentials and permissions')
    console.log('   4. Check network connectivity to database')
    process.exit(1)
  } finally {
    await disconnectDatabase()
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Setup interrupted, cleaning up...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Setup terminated, cleaning up...')
  await disconnectDatabase()
  process.exit(0)
})

setupDatabase()

#!/usr/bin/env tsx

/**
 * Test script to verify database connection
 * Usage: npm run test-db
 */

import { checkDatabaseConnection, disconnectDatabase } from '../lib/db'

async function testConnection() {
  console.log('🔄 Testing database connection...')
  
  try {
    const isConnected = await checkDatabaseConnection()
    
    if (isConnected) {
      console.log('✅ Database connection test passed!')
      console.log('📊 Database is ready for operations')
    } else {
      console.log('❌ Database connection test failed!')
      console.log('💡 Please check your DATABASE_URL in .env.local')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Database connection error:', error)
    console.log('💡 Make sure your .env.local file is configured correctly')
    process.exit(1)
  } finally {
    await disconnectDatabase()
  }
}

testConnection()

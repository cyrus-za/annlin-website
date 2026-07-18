#!/usr/bin/env tsx

/**
 * Comprehensive database connection test script
 * Tests connection, health, and migration status
 * Usage: npm run test-db
 */

import { 
  checkDatabaseConnection, 
  disconnectDatabase, 
  getDatabaseHealth,
  checkMigrationStatus,
  safeDatabaseOperation 
} from '../lib/db'

async function testConnection() {
  console.log('🔄 Starting comprehensive database test...')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Basic connection check
    console.log('\n📡 Test 1: Basic Connection Check')
    console.log('-'.repeat(30))
    
    const isConnected = await checkDatabaseConnection()
    
    if (isConnected) {
      console.log('✅ Basic connection test passed!')
    } else {
      console.log('❌ Basic connection test failed!')
      console.log('💡 Please check your DATABASE_URL in .env.local')
      process.exit(1)
    }
    
    // Test 2: Health check with latency
    console.log('\n🏥 Test 2: Database Health Check')
    console.log('-'.repeat(30))
    
    const health = await getDatabaseHealth()
    
    if (health.isConnected) {
      console.log(`✅ Database is healthy`)
      console.log(`⚡ Latency: ${health.latency}ms`)
      
    } else {
      console.log(`❌ Database health check failed: ${health.error}`)
    }
    
    // Test 3: Migration status
    console.log('\n🔄 Test 3: Migration Status Check')
    console.log('-'.repeat(30))
    
    const migrationStatus = await checkMigrationStatus()
    
    if (migrationStatus.error) {
      console.log(`⚠️  Migration check: ${migrationStatus.error}`)
    } else if (migrationStatus.isUpToDate) {
      console.log('✅ All migrations are up to date')
    } else {
      console.log(`⚠️  Pending migrations found:`)
      migrationStatus.pendingMigrations?.forEach(migration => {
        console.log(`   - ${migration}`)
      })
    }
    
    // Test 4: Safe database operation test
    console.log('\n🛡️  Test 4: Safe Operation Test')
    console.log('-'.repeat(30))
    
    const testResult = await safeDatabaseOperation(
      async () => {
        // Simple test query
        const result = await import('../lib/db').then(({ prisma }) => 
          prisma.$queryRaw<Array<{ test: number }>>`SELECT 42 as test`
        )
        return result[0]?.test
      },
      'Test query execution'
    )
    
    if (testResult.success) {
      console.log(`✅ Safe operation test passed! Result: ${testResult.data}`)
    } else {
      console.log(`❌ Safe operation test failed: ${testResult.error}`)
    }
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Database Test Summary')
    console.log('='.repeat(50))
    
    const allTestsPassed = isConnected && health.isConnected && testResult.success
    
    if (allTestsPassed) {
      console.log('✅ All database tests passed!')
      console.log('🚀 Database is ready for operations')
      
      if (migrationStatus.error || !migrationStatus.isUpToDate) {
        console.log('⚠️  Note: Consider running database migrations')
        console.log('   Run: npx prisma migrate deploy')
      }
    } else {
      console.log('❌ Some database tests failed!')
      console.log('💡 Please check your database configuration')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Database test error:', error)
    console.log('💡 Make sure your .env.local file is configured correctly')
    console.log('💡 Ensure your database server is running and accessible')
    process.exit(1)
  } finally {
    console.log('\n🔌 Disconnecting from database...')
    await disconnectDatabase()
    console.log('👋 Database test completed')
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received termination signal, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

testConnection()

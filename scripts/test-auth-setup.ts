#!/usr/bin/env tsx

/**
 * Test script to verify authentication setup
 * Usage: npm run auth:test
 */

import { auth } from '../lib/auth'

async function testAuthSetup() {
  console.log('🔄 Testing authentication setup...')
  
  try {
    // Test that auth configuration is valid
    console.log('✅ Auth configuration loaded successfully')
    console.log('📊 Auth baseURL:', auth.options.baseURL)
    console.log('📊 Email verification enabled:', auth.options.emailVerification?.sendOnSignUp)
    console.log('📊 Session expires in:', auth.options.session?.expiresIn, 'seconds')
    
    // Test database adapter connection
    console.log('🔄 Testing database adapter...')
    
    // This will test if the database connection works
    await auth.api.listSessions({
      headers: new Headers(),
    })
    
    console.log('✅ Database adapter connection successful')
    console.log('✅ Authentication setup test passed!')
    
  } catch (error) {
    console.error('❌ Authentication setup test failed:', error)
    console.log('💡 Make sure your environment variables are configured correctly')
    console.log('💡 Ensure the database is accessible and migrations are run')
    process.exit(1)
  }
}

testAuthSetup()

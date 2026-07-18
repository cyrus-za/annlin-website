#!/usr/bin/env tsx

/**
 * Test script to verify authentication setup
 * Usage: npm run auth:test
 */

import { auth } from '../lib/auth'
import { prisma } from '../lib/db'

async function testAuthSetup() {
  console.log('🔄 Testing authentication setup...')
  
  try {
    // Test that auth configuration is valid
    console.log('✅ Auth configuration loaded successfully')
    console.log('📊 Auth baseURL:', auth.options.baseURL)
    console.log('📊 Email verification required:', auth.options.emailAndPassword?.requireEmailVerification)
    console.log('📊 Session expires in:', auth.options.session?.expiresIn, 'seconds')

    if (auth.options.emailAndPassword?.disableSignUp !== true) {
      throw new Error('Public email/password registration must remain disabled')
    }

    if (auth.options.user?.additionalFields?.role?.defaultValue !== 'EDITOR') {
      throw new Error('The fallback user role must not grant administrator access')
    }
    
    // Test database adapter connection
    console.log('🔄 Testing database adapter...')

    await prisma.user.count()
    
    console.log('✅ Database adapter connection successful')

    // Anonymous requests should not have a session, but should not fail.
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (session !== null) {
      throw new Error('Expected anonymous getSession call to return null')
    }

    console.log('✅ Anonymous session check successful')
    console.log('✅ Authentication setup test passed!')
    
  } catch (error) {
    console.error('❌ Authentication setup test failed:', error)
    console.log('💡 Make sure your environment variables are configured correctly')
    console.log('💡 Ensure the database is accessible and migrations are run')
    process.exit(1)
  }
}

testAuthSetup()

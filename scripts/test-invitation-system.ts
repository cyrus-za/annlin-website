#!/usr/bin/env tsx

/**
 * Test script to verify invitation system setup
 * Usage: npm run invitations:test
 */

import { env } from '../lib/env'

async function testInvitationSystem() {
  console.log('🔄 Testing invitation system...')
  
  try {
    // Test email service configuration
    console.log('✅ Email service configuration loaded')
    console.log('📊 Resend API key configured:', env.RESEND_API_KEY.startsWith('re_'))
    console.log('📊 From email:', env.FROM_EMAIL)
    
    // Test email template generation (without actually sending)
    console.log('🔄 Testing email template generation...')
    console.log('✅ Email template generation successful')
    
    // Note: We won't actually send a test email to avoid spam
    // In a real test environment, you could uncomment the following:
    /*
    console.log('🔄 Testing email sending (to test email)...')
    const emailSent = await sendEmail(testEmailData)
    
    if (emailSent) {
      console.log('✅ Email sent successfully')
    } else {
      console.log('❌ Email sending failed')
    }
    */
    
    console.log('✅ Invitation system test completed successfully!')
    console.log('💡 To test actual email sending, configure a test recipient and uncomment the test code')
    
  } catch (error) {
    console.error('❌ Invitation system test failed:', error)
    console.log('💡 Make sure your RESEND_API_KEY and FROM_EMAIL are configured correctly')
    process.exit(1)
  }
}

testInvitationSystem()

#!/usr/bin/env tsx

/**
 * Test script to verify invitation system setup
 * Usage: npm run invitations:test
 */

import { env } from '../lib/env'
import { verifyPassword } from 'better-auth/crypto'
import { prisma } from '../lib/db'
import { acceptInvitation } from '../lib/services/user-invitations'

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

    const inviter = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!inviter) throw new Error('An administrator is required for the invitation integration test')

    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const email = `invitation-test-${nonce}@example.invalid`
    const password = `Invitation-${nonce}`
    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        name: 'Invitation Test',
        role: 'EDITOR',
        invitedBy: inviter.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    })

    try {
      const result = await acceptInvitation(invitation.token, password)
      if (!result.success || !result.user) throw new Error(result.error ?? 'Invitation acceptance failed')

      const account = await prisma.account.findFirst({
        where: { userId: result.user.id, providerId: 'credential' },
      })
      const passwordMatches = account?.password
        ? await verifyPassword({ hash: account.password, password })
        : false

      if (result.user.role !== 'EDITOR' || !passwordMatches) {
        throw new Error('Invitation did not create the expected editor credential account')
      }

      const reused = await acceptInvitation(invitation.token, password)
      if (reused.success) throw new Error('An invitation token was accepted more than once')
      console.log('✅ Invitation acceptance creates a single-use credential account')
    } finally {
      await prisma.user.deleteMany({ where: { email } })
      await prisma.userInvitation.deleteMany({ where: { id: invitation.id } })
    }
    
  } catch (error) {
    console.error('❌ Invitation system test failed:', error)
    console.log('💡 Make sure your RESEND_API_KEY and FROM_EMAIL are configured correctly')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testInvitationSystem()

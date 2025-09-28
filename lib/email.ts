import { Resend } from 'resend'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface InvitationEmailData {
  recipientName: string
  recipientEmail: string
  inviterName: string
  inviteToken: string
  role: 'ADMIN' | 'EDITOR'
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailTemplate): Promise<boolean> {
  try {
    const response = await resend.emails.send({
      from: env.FROM_EMAIL,
      to,
      subject,
      html,
      text,
    })

    if (response.error) {
      console.error('Email sending failed:', response.error)
      return false
    }

    console.log('Email sent successfully:', response.data?.id)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Generate HTML template for user invitation
 */
export function generateInvitationEmailHtml({
  recipientName,
  inviterName,
  inviteToken,
  role,
}: InvitationEmailData): string {
  const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${inviteToken}`
  const roleDisplay = role === 'ADMIN' ? 'Administrator' : 'Editor'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Annlin Church Website</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .role-badge {
                display: inline-block;
                background-color: #dbeafe;
                color: #1e40af;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                margin: 0 4px;
            }
            .cta-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
                text-align: center;
            }
            .cta-button:hover {
                background-color: #1d4ed8;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
                text-align: center;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Annlin Gemeente</div>
                <h1 class="title">You're Invited!</h1>
            </div>
            
            <div class="content">
                <p>Hello ${recipientName},</p>
                
                <p>${inviterName} has invited you to join the Annlin Church website administration team as a <span class="role-badge">${roleDisplay}</span>.</p>
                
                <p>As a ${roleDisplay}, you'll be able to:</p>
                <ul>
                    ${role === 'ADMIN' ? `
                    <li>Manage all website content</li>
                    <li>Invite and manage other users</li>
                    <li>Access all administrative features</li>
                    <li>Configure system settings</li>
                    ` : `
                    <li>Create and edit news articles</li>
                    <li>Manage service groups information</li>
                    <li>Update calendar events</li>
                    <li>Upload and manage reading materials</li>
                    `}
                </ul>
                
                <div style="text-align: center;">
                    <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> This invitation link will expire in 7 days. If you don't accept the invitation within this time, please contact ${inviterName} for a new invitation.
                </div>
                
                <p>If you have any questions about using the system or need help getting started, please don't hesitate to reach out.</p>
                
                <p>Blessings,<br>The Annlin Church Website Team</p>
            </div>
            
            <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>This email was sent from the Annlin Church Website Administration System.</p>
            </div>
        </div>
    </body>
    </html>
  `
}

/**
 * Generate plain text version of invitation email
 */
export function generateInvitationEmailText({
  recipientName,
  inviterName,
  inviteToken,
  role,
}: InvitationEmailData): string {
  const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${inviteToken}`
  const roleDisplay = role === 'ADMIN' ? 'Administrator' : 'Editor'

  return `
Annlin Gemeente - You're Invited!

Hello ${recipientName},

${inviterName} has invited you to join the Annlin Church website administration team as a ${roleDisplay}.

As a ${roleDisplay}, you'll be able to:
${role === 'ADMIN' ? `
- Manage all website content
- Invite and manage other users
- Access all administrative features
- Configure system settings
` : `
- Create and edit news articles
- Manage service groups information
- Update calendar events
- Upload and manage reading materials
`}

To accept your invitation, please visit:
${inviteUrl}

IMPORTANT: This invitation link will expire in 7 days. If you don't accept the invitation within this time, please contact ${inviterName} for a new invitation.

If you have any questions about using the system or need help getting started, please don't hesitate to reach out.

Blessings,
The Annlin Church Website Team

---
If you didn't expect this invitation, you can safely ignore this email.
This email was sent from the Annlin Church Website Administration System.
  `.trim()
}

/**
 * Send user invitation email
 */
export async function sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  const html = generateInvitationEmailHtml(data)
  const text = generateInvitationEmailText(data)
  
  return sendEmail({
    to: data.recipientEmail,
    subject: `Invitation to join Annlin Church Website (${data.role === 'ADMIN' ? 'Administrator' : 'Editor'})`,
    html,
    text,
  })
}

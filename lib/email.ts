import { Resend } from 'resend'
import { env } from './env'

const resend = new Resend(env.server.RESEND_API_KEY)

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
      from: env.server.FROM_EMAIL,
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
  const inviteUrl = `${env.server.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${inviteToken}`
  const roleDisplay = role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'

  return `
    <!DOCTYPE html>
    <html lang="af">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Uitnodiging na Annlin Kerk Webwerf</title>
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
                <h1 class="title">Jy is Genooi!</h1>
            </div>
            
            <div class="content">
                <p>Hallo ${recipientName},</p>
                
                <p>${inviterName} het jou genooi om by die Annlin Gemeente webwerf administrasie span aan te sluit as 'n <span class="role-badge">${roleDisplay}</span>.</p>
                
                <p>As 'n ${roleDisplay}, sal jy kan:</p>
                <ul>
                    ${role === 'ADMIN' ? `
                    <li>Bestuur alle webwerf inhoud</li>
                    <li>Nooi en bestuur ander gebruikers</li>
                    <li>Toegang tot alle administratiewe funksies</li>
                    <li>Konfigureer sisteem instellings</li>
                    ` : `
                    <li>Skep en redigeer nuus artikels</li>
                    <li>Bestuur diensgroepe inligting</li>
                    <li>Opdateer kalender gebeurtenisse</li>
                    <li>Laai op en bestuur leesstof</li>
                    `}
                </ul>
                
                <div style="text-align: center;">
                    <a href="${inviteUrl}" class="cta-button">Aanvaar Uitnodiging</a>
                </div>
                
                <div class="warning">
                    <strong>Belangrik:</strong> Hierdie uitnodiging skakel sal verval in 7 dae. As jy nie die uitnodiging binne hierdie tyd aanvaar nie, kontak asseblief ${inviterName} vir 'n nuwe uitnodiging.
                </div>
                
                <p>As jy enige vrae het oor die gebruik van die sisteem of hulp nodig het om te begin, moet asseblief nie huiwer om uit te reik nie.</p>
                
                <p>Seëninge,<br>Die Annlin Gemeente Webwerf Span</p>
            </div>
            
            <div class="footer">
                <p>As jy nie hierdie uitnodiging verwag het nie, kan jy hierdie e-pos veilig ignoreer.</p>
                <p>Hierdie e-pos is gestuur vanaf die Annlin Gemeente Webwerf Administrasie Sisteem.</p>
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
  const inviteUrl = `${env.server.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${inviteToken}`
  const roleDisplay = role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'

  return `
Annlin Gemeente - Jy is Genooi!

Hallo ${recipientName},

${inviterName} het jou genooi om by die Annlin Gemeente webwerf administrasie span aan te sluit as 'n ${roleDisplay}.

As 'n ${roleDisplay}, sal jy kan:
${role === 'ADMIN' ? `
- Bestuur alle webwerf inhoud
- Nooi en bestuur ander gebruikers
- Toegang tot alle administratiewe funksies
- Konfigureer sisteem instellings
` : `
- Skep en redigeer nuus artikels
- Bestuur diensgroepe inligting
- Opdateer kalender gebeurtenisse
- Laai op en bestuur leesstof
`}

Om jou uitnodiging te aanvaar, besoek asseblief:
${inviteUrl}

BELANGRIK: Hierdie uitnodiging skakel sal verval in 7 dae. As jy nie die uitnodiging binne hierdie tyd aanvaar nie, kontak asseblief ${inviterName} vir 'n nuwe uitnodiging.

As jy enige vrae het oor die gebruik van die sisteem of hulp nodig het om te begin, moet asseblief nie huiwer om uit te reik nie.

Seëninge,
Die Annlin Gemeente Webwerf Span

---
As jy nie hierdie uitnodiging verwag het nie, kan jy hierdie e-pos veilig ignoreer.
Hierdie e-pos is gestuur vanaf die Annlin Gemeente Webwerf Administrasie Sisteem.
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
    subject: `Uitnodiging om by Annlin Gemeente Webwerf aan te sluit (${data.role === 'ADMIN' ? 'Administrateur' : 'Redigeerder'})`,
    html,
    text,
  })
}

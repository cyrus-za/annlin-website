import { env } from './env'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface InvitationEmailData {
  recipientName: string
  recipientEmail: string
  inviterName: string
  inviteToken: string
  role: 'ADMIN' | 'EDITOR'
}

export interface ContactSubmissionEmailData {
  id: string
  name: string
  email: string
  phone?: string | null
  subject: string
  type: 'GENERAL' | 'SERVICE_GROUP' | 'SPECIFIC'
  serviceGroupName?: string | null
}

export interface PasswordResetEmailData {
  recipientName: string
  recipientEmail: string
  resetUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function contactTypeLabel(type: ContactSubmissionEmailData['type']): string {
  if (type === 'SERVICE_GROUP') return 'Diensgroep-navraag'
  if (type === 'SPECIFIC') return 'Ander navraag'
  return 'Algemene navraag'
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text, replyTo }: EmailTemplate): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!response.ok) {
      console.error('Email sending failed:', await response.text())
      return false
    }

    const data = await response.json()
    console.log('Email sent successfully:', data.id)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export async function sendPasswordResetEmail({
  recipientName,
  recipientEmail,
  resetUrl,
}: PasswordResetEmailData): Promise<boolean> {
  const safeName = escapeHtml(recipientName)
  const safeUrl = escapeHtml(resetUrl)

  const html = `
    <!DOCTYPE html>
    <html lang="af">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Herstel jou Annlin-webwerfwagwoord</title>
      </head>
      <body style="margin:0;background:#f7f7f5;color:#2f2925;font-family:Arial,sans-serif;line-height:1.6;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e7e2dc;border-radius:8px;padding:28px;">
            <p style="margin:0 0 8px;color:#8a5d3b;font-size:14px;font-weight:700;">Annlin Gemeente</p>
            <h1 style="margin:0 0 20px;font-size:24px;">Herstel jou wagwoord</h1>
            <p>Hallo ${safeName},</p>
            <p>Ons het 'n versoek ontvang om jou bestuurderwagwoord te herstel. Die skakel hieronder is vir een uur geldig.</p>
            <p style="margin:24px 0;">
              <a href="${safeUrl}" style="display:inline-block;background:#875a39;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">Kies 'n nuwe wagwoord</a>
            </p>
            <p style="font-size:14px;color:#6b625c;">Indien jy nie hierdie versoek gerig het nie, kan jy die boodskap ignoreer. Jou huidige wagwoord bly onveranderd.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = [
    `Hallo ${recipientName},`,
    '',
    "Ons het 'n versoek ontvang om jou Annlin-webwerf se bestuurderwagwoord te herstel.",
    'Die volgende skakel is vir een uur geldig:',
    resetUrl,
    '',
    'Indien jy nie hierdie versoek gerig het nie, kan jy die boodskap ignoreer.',
  ].join('\n')

  return sendEmail({
    to: recipientEmail,
    subject: 'Herstel jou Annlin-webwerfwagwoord',
    html,
    text,
  })
}

/**
 * Notify the church office that a public contact form was submitted.
 * The database remains the source of truth if email delivery is unavailable.
 */
export async function sendContactSubmissionNotification(
  submission: ContactSubmissionEmailData,
): Promise<boolean> {
  const recipient = env.NEXT_PUBLIC_CONTACT_EMAIL

  if (!recipient) {
    console.error('Contact notification skipped: NEXT_PUBLIC_CONTACT_EMAIL is not configured')
    return false
  }

  const adminUrl = new URL(
    `/admin/indienings/${encodeURIComponent(submission.id)}`,
    env.NEXT_PUBLIC_APP_URL,
  ).toString()
  const typeLabel = contactTypeLabel(submission.type)
  const safeName = escapeHtml(submission.name)
  const safeEmail = escapeHtml(submission.email)
  const safePhone = submission.phone ? escapeHtml(submission.phone) : null
  const safeSubject = escapeHtml(submission.subject)
  const safeServiceGroup = submission.serviceGroupName
    ? escapeHtml(submission.serviceGroupName)
    : null

  const html = `
    <!DOCTYPE html>
    <html lang="af">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuwe webwerfnavraag</title>
      </head>
      <body style="margin:0;background:#f7f7f5;color:#2f2925;font-family:Arial,sans-serif;line-height:1.6;">
        <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e7e2dc;border-radius:8px;padding:28px;">
            <p style="margin:0 0 8px;color:#8a5d3b;font-size:14px;font-weight:700;">${typeLabel}</p>
            <h1 style="margin:0 0 24px;font-size:24px;">${safeSubject}</h1>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top;">Naam</td><td style="padding:6px 0;">${safeName}</td></tr>
              <tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top;">E-pos</td><td style="padding:6px 0;">${safeEmail}</td></tr>
              ${safePhone ? `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top;">Telefoon</td><td style="padding:6px 0;">${safePhone}</td></tr>` : ''}
              ${safeServiceGroup ? `<tr><td style="padding:6px 12px 6px 0;font-weight:700;vertical-align:top;">Diensgroep</td><td style="padding:6px 0;">${safeServiceGroup}</td></tr>` : ''}
            </table>
            <p style="margin:24px 0 0;">
              <a href="${adminUrl}" style="display:inline-block;background:#875a39;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:6px;font-weight:700;">Lees en verwerk navraag</a>
            </p>
          </div>
          <p style="margin:16px 0 0;color:#6b625c;font-size:13px;">Die volledige boodskap word veilig in die webwerf se bestuurderpaneel gehou.</p>
        </div>
      </body>
    </html>
  `

  const text = [
    'Nuwe webwerfnavraag',
    '',
    `Tipe: ${typeLabel}`,
    `Onderwerp: ${submission.subject}`,
    `Naam: ${submission.name}`,
    `E-pos: ${submission.email}`,
    submission.phone ? `Telefoon: ${submission.phone}` : null,
    submission.serviceGroupName ? `Diensgroep: ${submission.serviceGroupName}` : null,
    '',
    `Lees en verwerk die navraag: ${adminUrl}`,
  ].filter((line): line is string => line !== null).join('\n')

  return sendEmail({
    to: recipient,
    replyTo: submission.email,
    subject: `Nuwe webwerfnavraag: ${submission.subject}`,
    html,
    text,
  })
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
                    <li>Konfigureer webwerf-verstellings</li>
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
  const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${inviteToken}`
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
- Konfigureer webwerf-verstellings
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

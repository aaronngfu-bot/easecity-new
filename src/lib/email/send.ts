import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface SendContactEmailParams {
  name: string
  email: string
  company?: string
  subject: string
  message: string
}

export async function sendContactEmail(params: SendContactEmailParams) {
  const resend = getResend()
  const { name, email, company, subject, message } = params
  const toEmail = process.env.CONTACT_EMAIL_TO || 'hello@easecity.com'

  const { data, error } = await resend.emails.send({
    from: 'easecity Contact <onboarding@resend.dev>',
    to: [toEmail],
    replyTo: email,
    subject: `[Contact] ${subject} — ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22d3ee; border-bottom: 2px solid #22d3ee; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #666; width: 120px;">Name</td>
            <td style="padding: 8px 12px;">${escapeHtml(name)}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #666;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
          </tr>
          ${company ? `
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #666;">Company</td>
            <td style="padding: 8px 12px;">${escapeHtml(company)}</td>
          </tr>` : ''}
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #666;">Subject</td>
            <td style="padding: 8px 12px;">${escapeHtml(subject)}</td>
          </tr>
        </table>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="white-space: pre-wrap; color: #555; line-height: 1.6;">${escapeHtml(message)}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Sent from easecity contact form
        </p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

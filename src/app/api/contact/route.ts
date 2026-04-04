import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { contactSchema } from '@/lib/validations/contact'
import { sendContactEmail } from '@/lib/email/send'
import { prisma } from '@/lib/db'

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const { allowed, resetIn } = rateLimit(`contact:${ip}`, 3, 60_000)

  if (!allowed) {
    return apiError(
      'RATE_LIMITED',
      `Too many requests. Please try again in ${Math.ceil(resetIn / 1000)} seconds.`,
      429
    )
  }

  const body = await req.json()
  const data = contactSchema.parse(body)

  await prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company || null,
      subject: data.subject,
      message: data.message,
      ipAddress: ip,
    },
  })

  if (process.env.RESEND_API_KEY) {
    try {
      await sendContactEmail(data)
    } catch (emailError) {
      console.error('[Email Error]', emailError)
      // Submission is saved; email failure is non-blocking
    }
  }

  return apiSuccess({ message: 'Contact form submitted successfully' }, 201)
})

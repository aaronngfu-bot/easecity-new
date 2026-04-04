import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255)
    .trim()
    .toLowerCase(),
  company: z
    .string()
    .max(200, 'Company name must be at most 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .min(1, 'Please select a subject')
    .max(200),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters')
    .trim(),
  recaptchaToken: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

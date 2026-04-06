import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are easecity's AI assistant, specializing in stream control infrastructure services.

Key information about easecity:
- Hong Kong-based technology company founded in 2026
- Builds enterprise-grade stream control infrastructure
- Enables one hub to manage unlimited remote endpoints
- Services include real-time streaming, IoT control, remote device management
- Currently in Phase 01 (Stream Control Infrastructure), expanding into online services (Phase 02, 2027) and AI-powered services (Phase 03, 2028)

Guidelines:
- Be professional, friendly, and concise
- Answer questions related to easecity's business and technology
- For pricing or detailed partnership inquiries, suggest contacting the team via the contact form
- Respond in the same language the user writes in
- Keep responses under 300 words unless more detail is specifically requested`

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Chatbot is not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const ip = getClientIp(req)
  const { allowed } = rateLimit(`chat:${ip}`, 20, 60_000)

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, conversationId } = await req.json()

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1000,
    async onFinish({ text, usage }) {
      if (conversationId) {
        try {
          await prisma.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: text,
              tokenCount: usage.totalTokens,
            },
          })
        } catch (e) {
          console.error('[Chat] Failed to save message:', e)
        }
      }
    },
  })

  return result.toTextStreamResponse()
}

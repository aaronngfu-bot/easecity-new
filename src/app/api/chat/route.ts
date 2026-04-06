import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const maxDuration = 30

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
})

const SYSTEM_PROMPT = `You are easecity's AI assistant, specializing in stream control infrastructure services.

Key information about easecity:
- Hong Kong-based technology company founded in 2026
- Builds enterprise-grade stream control infrastructure
- Enables one hub to manage unlimited remote endpoints
- Services include real-time streaming, IoT control, remote device management
- Currently in Phase 01 (Stream Control Infrastructure), expanding into online services (Phase 02, 2027) and AI-powered services (Phase 03, 2028)
- Pricing plans: Starter ($49/mo), Professional ($149/mo), Business ($399/mo), Enterprise (custom)

Guidelines:
- Be professional, friendly, and concise
- Answer questions related to easecity's business and technology
- For pricing or detailed partnership inquiries, suggest contacting the team via the contact form
- Respond in the same language the user writes in
- Keep responses under 300 words unless more detail is specifically requested`

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
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

  try {
    const { messages, conversationId } = await req.json()

    const result = streamText({
      model: deepseek('deepseek-chat'),
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
  } catch (err) {
    console.error('[Chat] API error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

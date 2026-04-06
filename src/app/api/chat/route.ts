import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const maxDuration = 30

const provider = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
})

const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-coder:free',
  'google/gemma-3-27b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-3-12b-it:free',
]

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
  if (!process.env.OPENROUTER_API_KEY) {
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

    let responseText = ''
    let totalTokens = 0

    for (const modelId of FREE_MODELS) {
      try {
        const result = await generateText({
          model: provider(modelId),
          system: SYSTEM_PROMPT,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          maxOutputTokens: 1000,
          maxRetries: 1,
        })
        responseText = result.text
        totalTokens = result.usage?.totalTokens ?? 0
        break
      } catch (err) {
        console.error(`[Chat] ${modelId} failed:`, err instanceof Error ? err.message : err)
        continue
      }
    }

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: 'All AI models are temporarily busy. Please try again in a moment.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (conversationId) {
      try {
        await prisma.message.create({
          data: { conversationId, role: 'assistant', content: responseText, tokenCount: totalTokens },
        })
      } catch (e) {
        console.error('[Chat] Failed to save message:', e)
      }
    }

    return new Response(
      JSON.stringify({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responseText,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[Chat] API error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to get AI response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

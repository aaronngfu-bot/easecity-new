import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  let dbStatus = 'ok'
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
  } catch {
    dbStatus = 'error'
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latency: Date.now() - start,
    services: {
      database: dbStatus,
      email: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
      payment: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      chatbot: process.env.OPENROUTER_API_KEY ? 'configured' : 'not_configured',
    },
  })
}

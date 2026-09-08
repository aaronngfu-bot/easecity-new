import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { signAgentToken } from '@/lib/support'
import { SupportConsole } from '@/components/support/SupportConsole'
import Link from 'next/link'

/**
 * Admin view of one support conversation. Server-mints the agent token for
 * the session — same console component and API as the emailed magic link,
 * just without needing an email round-trip.
 */
export default async function AdminSupportSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }
  const { sessionId } = await params

  const exists = await prisma.supportSession.findUnique({ where: { id: sessionId }, select: { id: true } })
  if (!exists) notFound()

  const token = signAgentToken(sessionId)

  // Serializable copy of the canned templates for the client component.
  const { CANNED_TEMPLATES } = await import('@/lib/support')
  const templates = CANNED_TEMPLATES.map((t) => ({
    id: t.id,
    label: { en: t.label.en, zh: t.label.zh, 'zh-CN': t.label['zh-CN'] },
    body: { en: t.body.en, zh: t.body.zh, 'zh-CN': t.body['zh-CN'] },
  }))

  return (
    <div className="space-y-4">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-signal">
        ← Live support inbox
      </Link>
      <SupportConsole templates={templates} sessionToken={token} sessionOverride={sessionId} />
    </div>
  )
}

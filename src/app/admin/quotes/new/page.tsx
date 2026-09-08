import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { QuoteForm } from '@/components/admin/QuoteForm'

export default async function NewQuotePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.QUOTES</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">New quote</h1>
        <p className="mt-1 text-sm text-text-secondary">The client gets a magic link — no login needed to view or confirm.</p>
      </div>
      <div className="rounded-lg border border-border bg-bg-surface p-6">
        <QuoteForm />
      </div>
    </div>
  )
}

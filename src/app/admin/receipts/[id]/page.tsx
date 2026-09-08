import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { ReceiptView } from '@/components/commerce/ReceiptView'

/** Admin view of a receipt (admin check; renders the shared receipt view). */
export default async function AdminReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }
  const { id } = await params

  const receipt = await prisma.receipt.findUnique({ where: { id } })
  if (!receipt) notFound()

  return (
    <div className="space-y-4">
      <ReceiptView
        receipt={{
          number: receipt.number,
          clientName: receipt.clientName,
          clientEmail: receipt.clientEmail,
          amount: receipt.amount,
          currency: receipt.currency,
          source: receipt.source,
          issuedAt: receipt.issuedAt.toISOString(),
          quoteId: receipt.quoteId,
        }}
        language="en"
      />
    </div>
  )
}

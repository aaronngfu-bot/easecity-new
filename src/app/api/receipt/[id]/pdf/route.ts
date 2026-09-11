import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { buildReceiptPdf } from '@/lib/pdf-docs'

export const dynamic = 'force-dynamic'

/**
 * GET /api/receipt/[id]/pdf?token=…
 * Serves the receipt as a generated PDF. Auth: access token OR admin session
 * OR logged-in client whose email matches.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = new URL(req.url).searchParams.get('token')

  const receipt = await prisma.receipt.findUnique({ where: { id } })
  if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let authed = !!token && token === receipt.accessToken
  if (!authed) {
    const session = await getServerSession(authOptions)
    authed = (!!session?.user && isAdmin(session.user.role)) ||
      (!!session?.user?.email && session.user.email === receipt.clientEmail)
  }
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Item listing: from the linked quote when present, else the order JSON.
  let items: { description: string; qty: number; unitPrice: number }[] = []
  let quoteNumber: string | null = null
  if (receipt.quoteId) {
    const quote = await prisma.quote.findUnique({ where: { id: receipt.quoteId } })
    if (quote) {
      items = JSON.parse(quote.items)
      quoteNumber = quote.number
    }
  } else if (receipt.orderId) {
    const order = await prisma.order.findUnique({ where: { id: receipt.orderId } })
    if (order?.items) {
      try {
        const parsed = JSON.parse(order.items)
        items = Array.isArray(parsed) ? parsed : []
      } catch { items = [] }
    }
  }

  // Payment method from meta (manual receipts record how money arrived).
  let paymentMethod: string | null = null
  if (receipt.meta) {
    try { paymentMethod = JSON.parse(receipt.meta).paymentMethod ?? null } catch {}
  }
  const pdf = await buildReceiptPdf({
    // PDFs are English-only by default; pass language explicitly when a
    // client specifically asks for another language version.
    // Chop version (&chop=1): stamps the scanned company chop.
    withChop: new URL(req.url).searchParams.get('chop') === '1',
    number: receipt.number,
    clientName: receipt.clientName,
    clientEmail: receipt.clientEmail,
    currency: receipt.currency,
    items,
    notes: null,
    issuedAt: receipt.issuedAt,
    validUntil: null,
    source: receipt.source,
    paymentMethod: (paymentMethod || 'bank') as never,
    quoteNumber,
  })

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${receipt.number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}

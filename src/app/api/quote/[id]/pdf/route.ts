import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { buildQuotePdf } from '@/lib/pdf-docs'

export const dynamic = 'force-dynamic'

/**
 * GET /api/quote/[id]/pdf?token=…
 * Serves the quote as a generated PDF. Auth: magic-link token OR admin
 * session. Signed quotes embed the customer's hand-drawn signature.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = new URL(req.url).searchParams.get('token')

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let authed = !!token && token === quote.quoteToken
  if (!authed) {
    const session = await getServerSession(authOptions)
    authed = !!session?.user && isAdmin(session.user.role)
  }
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pdf = await buildQuotePdf({
    number: quote.number,
    clientName: quote.clientName,
    clientEmail: quote.clientEmail,
    currency: quote.currency,
    items: JSON.parse(quote.items),
    notes: quote.notes,
    issuedAt: quote.createdAt,
    validUntil: quote.validUntil,
    signature: quote.signaturePng && quote.signerName && quote.signedAt
      ? { pngDataUri: quote.signaturePng, signerName: quote.signerName, signedAt: quote.signedAt }
      : null,
  })

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}

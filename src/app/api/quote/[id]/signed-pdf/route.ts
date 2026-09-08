import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/quote/[id]/signed-pdf?token=…
 * Customer returns their print-and-signed PDF. Auth: magic-link token.
 * Stores the file on Vercel Blob and records it on the quote; notifies the
 * team by email so they know a signed copy is back.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = new URL(req.url).searchParams.get('token')

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote || !token || token !== quote.quoteToken) {
    return NextResponse.json({ error: 'Invalid quote link' }, { status: 401 })
  }
  if (['cancelled'].includes(quote.status)) {
    return NextResponse.json({ error: 'Quote was cancelled' }, { status: 409 })
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 415 })
  }

  try {
    // Explicit token: the SDK's default auth order prefers VERCEL_OIDC_TOKEN
    // when present, and the stale copy in .env.local fails locally (same trap
    // as blob-upload.ts — see its comment).
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const blob = await put(`signed-quotes/${quote.number}-${Date.now()}.pdf`, file, {
      access: 'public',
      contentType: 'application/pdf',
      ...(token && { token }),
    })

    await prisma.quote.update({
      where: { id: quote.id },
      data: { signedPdfUrl: blob.url, signedPdfName: file.name.slice(0, 200) },
    })

    // Notify the team (best-effort).
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'
        const to = process.env.SUPPORT_EMAIL_TO || process.env.CONTACT_EMAIL_TO || 'admin@easecity.hk'
        const lang = quote.language || 'en'
        const subject = lang === 'en' ? `Signed quote returned — ${quote.number}` : `已簽報價單已回傳 — ${quote.number}`
        await resend.emails.send({
          from: fromEmail,
          to: [to],
          subject,
          html: `<p>Client <strong>${quote.clientName}</strong> (${quote.clientEmail ?? 'no email'}) returned a signed PDF for quote <strong>${quote.number}</strong>.</p><p><a href="${blob.url}">Download signed PDF</a> · <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/quotes/${quote.id}">Open in admin</a></p>`,
        })
      } catch (e) {
        console.error('[signed-pdf] notify failed:', e)
      }
    }

    return NextResponse.json({ success: true, url: blob.url })
  } catch (e) {
    console.error('[signed-pdf] upload failed:', e)
    return NextResponse.json({ error: 'Upload failed — try again' }, { status: 500 })
  }
}

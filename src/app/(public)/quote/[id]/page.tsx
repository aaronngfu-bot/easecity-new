import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Language } from '@/i18n/translations'
import { ConfirmQuoteButton } from '@/components/commerce/ConfirmQuoteButton'
import { PdfButton } from '@/components/commerce/PdfButtons'
import { SignedPdfUpload } from '@/components/commerce/SignedPdfUpload'

/**
 * Customer-facing quote page. Two access paths:
 *  1. Magic link  /quote/{id}?token=…  (emailed, no login)
 *  2. Logged-in   /quote/{id}          (only when session user email matches)
 * Rendered in the quote's own language (set when the quote was created).
 */

const T = {
  en: {
    quote: 'Quotation', validUntil: 'Valid until', item: 'Item', qty: 'Qty', amount: 'Amount',
    total: 'Total', notes: 'Notes', confirm: 'Confirm & sign', confirming: 'Confirming…',
    offlineDone: 'Quote confirmed — we will send the countersigned PDF by email shortly.',
    signedDone: 'Signed — the countersigned PDF will be emailed to you and our team.',
    confirmed: 'Confirmed', paid: 'Paid — thank you', cancelled: 'Cancelled', expired: 'Expired',
    payOnline: 'Pay online', statusLine: 'Status', from: 'Prepared for', noAccess: 'This quote link is invalid.',
    thanks: 'Thank you for your business.',
    draw: 'Sign here with your finger or mouse', clear: 'Clear',
    signerName: 'Full name of signer', signHint: 'Your signature and name will be written into the PDF copy.',
    skipSignature: 'Confirm without signing', addSignature: '✍ Add a signature', signedBy: 'Signed by',
    downloadPdf: 'Download PDF', pdfQuote: 'Download quote PDF',
    uploadTitle: 'Prefer to sign on paper?', uploadHint: 'Print the PDF below, sign it, then upload your scanned copy here — we are notified as soon as it arrives.', uploadChoose: 'Upload signed PDF', uploading: 'Uploading…', uploadDone: 'Signed PDF received — thank you!', uploadError: 'Upload failed',
  },
  zh: {
    quote: '報價單', validUntil: '有效期至', item: '項目', qty: '數量', amount: '金額',
    total: '合計', notes: '備註', confirm: '確認並簽署', confirming: '確認中…',
    offlineDone: '已確認報價，我們會盡快把已簽署的 PDF 電郵給你。',
    signedDone: '已簽署——已簽署的 PDF 會電郵給你和本團隊。',
    confirmed: '已確認', paid: '已付款 — 謝謝', cancelled: '已取消', expired: '已過期',
    payOnline: '線上付款', statusLine: '狀態', from: '客戶', noAccess: '此報價連結無效。',
    thanks: '感謝你的支持。',
    draw: '用手指或滑鼠在此簽名', clear: '清除',
    signerName: '簽署人姓名', signHint: '你的簽名和姓名會寫入 PDF 版本。',
    skipSignature: '唔簽名直接確認', addSignature: '✍ 加入簽名', signedBy: '簽署人',
    downloadPdf: '下載 PDF', pdfQuote: '下載報價單 PDF',
    uploadTitle: '想簽紙版？', uploadHint: '下載下方 PDF，列印簽名後，將掃描本上傳到這裡——我們一收到就會有通知。', uploadChoose: '上傳已簽 PDF', uploading: '上傳中…', uploadDone: '已收到你的簽署 PDF，謝謝！', uploadError: '上傳失敗',
  },
  'zh-CN': {
    quote: '报价单', validUntil: '有效期至', item: '项目', qty: '数量', amount: '金额',
    total: '合计', notes: '备注', confirm: '确认并签署', confirming: '确认中…',
    offlineDone: '已确认报价，我们会尽快把已签署的 PDF 电邮给你。',
    signedDone: '已签署——已签署的 PDF 会电邮给你和本团队。',
    confirmed: '已确认', paid: '已付款 — 谢谢', cancelled: '已取消', expired: '已过期',
    payOnline: '在线付款', statusLine: '状态', from: '客户', noAccess: '此报价链接无效。',
    thanks: '感谢你的支持。',
    draw: '用手指或鼠标在此签名', clear: '清除',
    signerName: '签署人姓名', signHint: '你的签名和姓名会写入 PDF 版本。',
    skipSignature: '不签名直接确认', addSignature: '✍ 添加签名', signedBy: '签署人',
    downloadPdf: '下载 PDF', pdfQuote: '下载报价单 PDF',
    uploadTitle: '想签纸质版？', uploadHint: '下载下方 PDF，打印签名后，将扫描件上传到这里——我们一收到就会有通知。', uploadChoose: '上传已签 PDF', uploading: '上传中…', uploadDone: '已收到你的签署 PDF，谢谢！', uploadError: '上传失败',
  },
} as const

const fmtDate = (d: Date, lang: string) =>
  d.toLocaleDateString(lang === 'zh' || lang === 'zh-CN' ? 'zh-HK' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string; payment?: string }>
}) {
  const { id } = await params
  const { token, payment } = await searchParams

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) notFound()

  // Auth: token match OR logged-in user with matching email.
  let authed = !!token && token === quote.quoteToken
  if (!authed) {
    const session = await getServerSession(authOptions)
    authed = !!session?.user?.email && session.user.email === quote.clientEmail
  }
  if (!authed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-text-muted">
        {T.en.noAccess}
      </div>
    )
  }

  const lang = (quote.language || 'en') as Language
  const t = T[lang] ?? T.en
  const items = JSON.parse(quote.items) as { description: string; qty: number; unitPrice: number }[]
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  const money = (c: number) => (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const isExpired = quote.validUntil && quote.validUntil < new Date()
  const confirmable = ['draft', 'sent'].includes(quote.status) && !isExpired

  const statusText: Record<string, string> = {
    draft: t.confirmed, sent: t.statusLine, confirmed: t.confirmed, converted: t.confirmed,
    paid: t.paid, cancelled: t.cancelled, expired: t.expired,
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-10">
        {/* header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold text-signal">
              Ease<span className="text-signal-light">City</span>
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-text-muted">{quote.number}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{t.quote}</p>
            <p className="mt-1 text-sm text-text-primary">{quote.clientName}</p>
            {quote.clientEmail && <p className="text-xs text-text-muted">{quote.clientEmail}</p>}
          </div>
        </div>

        {/* status band */}
        {quote.status === 'paid' && (
          <div className="mb-6 rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-status-success">
            {t.paid}
          </div>
        )}
        {(quote.status === 'cancelled' || isExpired) && (
          <div className="mb-6 rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-muted">
            {quote.status === 'cancelled' ? t.cancelled : t.expired}
          </div>
        )}
        {payment === 'cancelled' && (
          <div className="mb-6 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
            {lang === 'en' ? 'Payment was not completed — you can try again below.' : lang === 'zh-CN' ? '付款未完成——可在下方重試。' : '付款未完成——可在下方重試。'}
          </div>
        )}

        {/* items */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.item}</th>
              <th className="py-2 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.qty}</th>
              <th className="py-2 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((it, i) => (
              <tr key={i}>
                <td className="py-3 pr-4 text-sm leading-relaxed text-text-primary">{it.description}</td>
                <td className="py-3 text-right text-sm text-text-secondary">{it.qty}</td>
                <td className="py-3 text-right text-sm text-text-primary">{money(it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-sm font-semibold text-text-primary">{t.total}</td>
              <td className="pt-4 text-right font-display text-lg font-bold text-signal">
                {money(totalCents)} <span className="text-xs font-medium text-text-secondary">{quote.currency.toUpperCase()}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* validity + notes */}
        <div className="mt-6 space-y-2 text-xs text-text-muted">
          {quote.validUntil && <p>{t.validUntil}: {fmtDate(quote.validUntil, quote.language)}</p>}
          {quote.notes && (
            <div className="rounded-lg border border-border/60 bg-bg-base/40 p-3">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{t.notes}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* confirm */}
        {confirmable && (
          <div className="mt-8 space-y-4 border-t border-border pt-6">
            <ConfirmQuoteButton
              quoteId={quote.id}
              token={token || ''}
              labels={{
                confirm: t.confirm, confirming: t.confirming,
                offlineDone: t.offlineDone, signedDone: t.signedDone,
                draw: t.draw, clear: t.clear, signerName: t.signerName,
                signHint: t.signHint, skipSignature: t.skipSignature, addSignature: t.addSignature,
              }}
            />
            {/* print-and-sign path: upload the scanned, hand-signed PDF */}
            <div className="border-t border-border/50 pt-4">
              <SignedPdfUpload
                quoteId={quote.id}
                token={token || ''}
                labels={{
                  title: t.uploadTitle, hint: t.uploadHint, choose: t.uploadChoose,
                  uploading: t.uploading, done: t.uploadDone, error: t.uploadError,
                }}
              />
            </div>
            <p className="text-center text-xs text-text-muted">{t.thanks}</p>
          </div>
        )}
        {(quote.status === 'confirmed' || quote.status === 'converted') && !isExpired && (
          <div className="mt-8 space-y-3 border-t border-border pt-6">
            <div className="text-center text-sm text-status-warning">{t.confirmed}</div>
            {quote.signaturePng && quote.signerName && (
              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                {t.signedBy}: <span className="font-medium text-text-primary">{quote.signerName}</span>
                {quote.signedAt && <span>· {new Date(quote.signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
              </div>
            )}
            {quote.paymentMode === 'stripe' && quote.status === 'confirmed' && (
              <p className="text-center text-xs text-text-muted">{t.payOnline}</p>
            )}
            <PdfButton quoteId={quote.id} token={token || ''} label={t.pdfQuote} />
            {/* signed PDF may also arrive after confirmation (paper path) */}
            {!quote.signedPdfUrl && (
              <div className="border-t border-border/50 pt-4">
                <SignedPdfUpload
                  quoteId={quote.id}
                  token={token || ''}
                  labels={{
                    title: t.uploadTitle, hint: t.uploadHint, choose: t.uploadChoose,
                    uploading: t.uploading, done: t.uploadDone, error: t.uploadError,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {quote.status === 'paid' && (
          <div className="mt-8 border-t border-border pt-6">
            <PdfButton quoteId={quote.id} token={token || ''} label={t.pdfQuote} />
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { Mail, Globe, Phone, Building2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ConfirmQuoteButton } from '@/components/commerce/ConfirmQuoteButton'
import { PdfButton } from '@/components/commerce/PdfButtons'
import { SignedPdfUpload } from '@/components/commerce/SignedPdfUpload'

/**
 * Customer-facing quote document view (client): all copy follows the SITE's
 * live language via useLanguage(), so the header toggle switches this page
 * instantly. Data (items, notes, client name) is rendered as stored.
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
    signerName: 'Full name of signer', signerTitle: 'Job title / capacity (optional — for company signatories)',
    signHint: 'Your signature and name will be written into the PDF copy.',
    skipSignature: 'Confirm without signing', addSignature: '✍ Add a signature', signedBy: 'Signed by',
    downloadPdf: 'Download PDF', pdfQuote: 'Download quote PDF',
    uploadTitle: 'Prefer to sign on paper?', uploadHint: 'Print the PDF below, sign it, then upload your scanned copy here — we are notified as soon as it arrives.', uploadChoose: 'Upload signed PDF', uploading: 'Uploading…', uploadDone: 'Signed PDF received — thank you!', uploadError: 'Upload failed',
    viewReceipt: 'View receipt',
    paymentCancelled: 'Payment was not completed — you can try again below.',
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
    signerName: '簽署人姓名', signerTitle: '職銜／簽署身份（選填——公司簽署人適用）',
    signHint: '你的簽名和姓名會寫入 PDF 版本。',
    skipSignature: '唔簽名直接確認', addSignature: '✍ 加入簽名', signedBy: '簽署人',
    downloadPdf: '下載 PDF', pdfQuote: '下載報價單 PDF',
    uploadTitle: '想簽紙版？', uploadHint: '下載下方 PDF，列印簽名後，將掃描本上傳到這裡——我們一收到就會有通知。', uploadChoose: '上傳已簽 PDF', uploading: '上傳中…', uploadDone: '已收到你的簽署 PDF，謝謝！', uploadError: '上傳失敗',
    viewReceipt: '查看收據',
    paymentCancelled: '付款未完成——可在下方重試。',
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
    signerName: '签署人姓名', signerTitle: '职衔／签署身份（选填——公司签署人适用）',
    signHint: '你的签名和姓名会写入 PDF 版本。',
    skipSignature: '不签名直接确认', addSignature: '✍ 添加签名', signedBy: '签署人',
    downloadPdf: '下载 PDF', pdfQuote: '下载报价单 PDF',
    uploadTitle: '想签纸质版？', uploadHint: '下载下方 PDF，打印签名后，将扫描件上传到这里——我们一收到就会有通知。', uploadChoose: '上传已签 PDF', uploading: '上传中…', uploadDone: '已收到你的签署 PDF，谢谢！', uploadError: '上传失败',
    viewReceipt: '查看收据',
    paymentCancelled: '付款未完成——可在下方重试。',
  },
} as const

export interface QuoteViewData {
  id: string
  number: string
  clientName: string
  clientEmail: string | null
  status: string
  currency: string
  items: { description: string; qty: number; unitPrice: number }[]
  notes: string | null
  validUntil: string | null // ISO
  paymentMode: string
  signaturePng: string | null
  signerName: string | null
  signedAt: string | null
  signedPdfUrl: string | null
}

export function QuoteView({
  quote,
  token,
  paymentCancelled,
  receiptForQuote,
}: {
  quote: QuoteViewData
  token: string
  paymentCancelled: boolean
  receiptForQuote: { id: string; accessToken: string } | null
}) {
  const { language } = useLanguage()
  const t = T[language] ?? T.en
  const money = (c: number) => (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(language === 'en' ? 'en-GB' : 'zh-HK', { day: 'numeric', month: 'short', year: 'numeric' })

  const totalCents = quote.items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date()
  const confirmable = ['draft', 'sent'].includes(quote.status) && !isExpired
  const validUntil = quote.validUntil ? new Date(quote.validUntil) : null
  const signedAt = quote.signedAt ? new Date(quote.signedAt) : null

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4 sm:pb-16 sm:pt-8">
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
        {paymentCancelled && (
          <div className="mb-6 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
            {t.paymentCancelled}
          </div>
        )}

        {/* items */}
        <div className="overflow-hidden rounded-xl border border-border bg-bg-base/40">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-base/70">
                <th className="py-3 pl-4 pr-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.item}</th>
                <th className="px-3 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.qty}</th>
                <th className="py-3 pl-3 pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {quote.items.map((it, i) => (
                <tr key={i} className="transition-colors hover:bg-bg-base/60">
                  <td className="py-3.5 pl-4 pr-3 text-sm leading-relaxed text-text-primary">{it.description}</td>
                  <td className="px-3 py-3.5 text-right text-sm tabular-nums text-text-secondary">{it.qty}</td>
                  <td className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold tabular-nums text-text-primary">{money(it.qty * it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td colSpan={2} className="py-4 pl-4 pr-3 text-sm font-semibold text-text-primary">{t.total}</td>
                <td className="py-4 pl-3 pr-4 text-right">
                  <span className="font-display text-lg font-bold tabular-nums text-signal">{money(totalCents)}</span>{' '}
                  <span className="text-xs font-medium text-text-secondary">{quote.currency.toUpperCase()}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* validity + notes */}
        <div className="mt-6 space-y-2 text-xs text-text-muted">
          {validUntil && <p>{t.validUntil}: {fmtDate(validUntil)}</p>}
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
              token={token}
              labels={{
                confirm: t.confirm, confirming: t.confirming,
                offlineDone: t.offlineDone, signedDone: t.signedDone,
                draw: t.draw, clear: t.clear, signerName: t.signerName, signerTitle: t.signerTitle,
                signHint: t.signHint, skipSignature: t.skipSignature, addSignature: t.addSignature,
              }}
            />
            {/* print-and-sign path: download the quote PDF, sign it, upload the scan */}
            <div className="border-t border-border/50 pt-4">
              <PdfButton quoteId={quote.id} token={token} label={t.downloadPdf} />
              <SignedPdfUpload
                quoteId={quote.id}
                token={token}
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
                {signedAt && <span>· {fmtDate(signedAt)}</span>}
              </div>
            )}
            {quote.paymentMode === 'stripe' && quote.status === 'confirmed' && (
              <p className="text-center text-xs text-text-muted">{t.payOnline}</p>
            )}
            <PdfButton quoteId={quote.id} token={token} label={t.pdfQuote} />
            {/* signed PDF may also arrive after confirmation (paper path) */}
            {!quote.signedPdfUrl && (
              <div className="border-t border-border/50 pt-4">
                <SignedPdfUpload
                  quoteId={quote.id}
                  token={token}
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
          <div className="mt-8 space-y-3 border-t border-border pt-6">
            <p className="text-center text-sm font-medium text-status-success">{t.paid}</p>
            {receiptForQuote ? (
              <a
                href={`/receipt/${receiptForQuote.id}?token=${encodeURIComponent(receiptForQuote.accessToken)}`}
                className="mx-auto block w-full rounded-lg bg-signal px-5 py-2.5 text-center text-sm font-semibold text-bg-base transition-transform hover:scale-[1.01] active:scale-[0.98]"
              >
                {t.viewReceipt}
              </a>
            ) : (
              <PdfButton quoteId={quote.id} token={token} label={t.pdfQuote} />
            )}
          </div>
        )}
        {/* footer contact row — mirrors the PDF footer */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-signal" aria-hidden />
            EaseCity Technologies Limited
          </span>
          <a href="https://easecity.hk" className="inline-flex items-center gap-1.5 transition-colors hover:text-signal">
            <Globe className="h-3.5 w-3.5 text-signal" aria-hidden />
            https://easecity.hk
          </a>
          <a href="tel:+85239971396" className="inline-flex items-center gap-1.5 transition-colors hover:text-signal">
            <Phone className="h-3.5 w-3.5 text-signal" aria-hidden />
            3997 1396
          </a>
          <a href="mailto:admin@easecity.hk" className="inline-flex items-center gap-1.5 transition-colors hover:text-signal">
            <Mail className="h-3.5 w-3.5 text-signal" aria-hidden />
            admin@easecity.hk
          </a>
        </div>
      </div>
    </div>
  )
}

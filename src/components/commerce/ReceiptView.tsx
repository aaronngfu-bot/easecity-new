'use client'

import { useReducedMotion } from 'framer-motion'
import { Globe, Mail, Phone, Building2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/i18n/translations'

/**
 * Shared customer-facing receipt document. Used by /receipt/[id] (public,
 * tokened) and the admin receipt view. Print-optimised: the browser print
 * dialog turns this into the PDF the client keeps.
 */

export interface ReceiptViewData {
  id: string
  number: string
  clientName: string
  clientEmail: string | null
  amount: number
  currency: string
  source: string
  issuedAt: string
  quoteId?: string | null
  orderNumber?: string | null
}

const T = {
  en: {
    receipt: 'Receipt', number: 'Number', issued: 'Date issued', billed: 'Billed to',
    amount: 'Amount paid', method: 'Method', online: 'Online (Stripe)', offline: 'Bank transfer / offline',
    print: 'Print / Save PDF', thanks: 'Thank you for your business.', quote: 'Quotation',
    downloadPdf: 'Download PDF receipt',
  },
  zh: {
    receipt: '收據', number: '編號', issued: '發出日期', billed: '付款人',
    amount: '已收金額', method: '收款方式', online: '線上付款（Stripe）', offline: '銀行轉帳／線下',
    print: '列印／儲存 PDF', thanks: '感謝你的支持。', quote: '報價單',
    downloadPdf: '下載收據 PDF',
  },
  'zh-CN': {
    receipt: '收据', number: '编号', issued: '发出日期', billed: '付款人',
    amount: '已收金额', method: '收款方式', online: '在线付款（Stripe）', offline: '银行转账／线下',
    print: '打印／保存 PDF', thanks: '感谢你的支持。', quote: '报价单',
    downloadPdf: '下载收据 PDF',
  },
} as const

export function ReceiptView({ receipt, token, language: languageProp }: { receipt: ReceiptViewData; token?: string; language?: Language }) {
  // Live site language wins; the prop (server-resolved) is only a fallback
  // for the first paint before the context mounts.
  const { language } = useLanguage()
  const lang: Language = language ?? languageProp ?? 'en'
  const t = T[lang] ?? T.en
  const money = (receipt.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="receipt-print receipt-sheet rounded-2xl border border-border bg-bg-surface p-6 sm:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold text-signal">
              Ease<span className="text-signal-light">City</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">EaseCity Technologies Limited</p>
            <p className="text-xs text-text-muted">admin@easecity.hk</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{t.receipt}</p>
            <p className="mt-1 font-mono text-xs text-text-primary">{receipt.number}</p>
            <p className="mt-1 text-xs text-text-muted">
              {t.issued}: {new Date(receipt.issuedAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'zh-HK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{t.billed}</p>
          <p className="mt-1 text-sm font-medium text-text-primary">{receipt.clientName}</p>
          {receipt.clientEmail && <p className="text-xs text-text-muted">{receipt.clientEmail}</p>}
        </div>

        <div className="rounded-xl border border-border bg-bg-base/50 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{t.amount}</p>
          <p className="mt-1 font-display text-3xl font-bold text-signal">
            {money} <span className="text-sm font-medium text-text-secondary">{receipt.currency.toUpperCase()}</span>
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {t.method}: {receipt.source === 'stripe' ? t.online : t.offline}
          </p>
        </div>

        <p className="mt-8 border-t border-border pt-4 text-center text-xs text-text-muted">{t.thanks}</p>

        {/* footer contact row — mirrors the PDF footer */}
        <div className="receipt-noprint mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-text-muted">
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

      <button
        type="button"
        onClick={() => window.print()}
        className="receipt-noprint mx-auto mt-6 block rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-bg-base transition-transform hover:scale-[1.01] active:scale-[0.98]"
      >
        {t.print}
      </button>

      {token && (
        <a
          href={`/api/receipt/${receipt.id}/pdf?token=${encodeURIComponent(token)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="receipt-noprint mx-auto mt-3 block rounded-lg border border-signal/40 bg-signal/10 px-5 py-2.5 text-center text-sm font-medium text-signal transition-colors hover:bg-signal/20"
        >
          {t.downloadPdf}
        </a>
      )}
    </div>
  )
}

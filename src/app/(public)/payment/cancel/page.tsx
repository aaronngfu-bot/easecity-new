'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function PaymentCancelPage() {
  const { t } = useLanguage()

  return (
    <div className="section-padding pt-24">
      <div className="container-max flex min-h-[60vh] items-center justify-center">
        <div className="signal-panel max-w-md p-8 text-center md:p-10">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-md border border-status-danger/30 bg-status-danger/10">
            <XCircle size={36} className="text-status-danger" />
          </div>
          <div className="label-mono mb-3 !text-status-danger">TRANSACTION.CANCELED</div>
          <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.04em] text-text-primary">{t.payment.cancelTitle}</h1>
          <p className="mb-8 text-sm leading-relaxed text-text-secondary">{t.payment.cancelDesc}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/services" className="signal-cta">
              {t.payment.tryAgain}
            </Link>
            <Link href="/contact" className="signal-secondary">
              {t.payment.contactSupport}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

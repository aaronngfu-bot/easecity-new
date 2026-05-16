'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function PaymentSuccessPage() {
  const { t } = useLanguage()

  return (
    <div className="section-padding pt-24">
      <div className="container-max flex min-h-[60vh] items-center justify-center">
        <div className="signal-panel-highlight max-w-md p-8 text-center md:p-10">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
            <CheckCircle2 size={36} className="text-signal" />
          </div>
          <div className="label-mono mb-3 text-signal">TRANSACTION.SUCCESS</div>
          <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.04em] text-text-primary">{t.payment.successTitle}</h1>
          <p className="mb-8 text-sm leading-relaxed text-text-secondary">{t.payment.successDesc}</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/orders" className="signal-cta">
              {t.payment.viewOrders}
            </Link>
            <Link href="/" className="signal-secondary">
              {t.payment.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

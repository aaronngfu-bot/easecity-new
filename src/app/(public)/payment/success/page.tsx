'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function PaymentSuccessPage() {
  const { t } = useLanguage()

  return (
    <div className="section-padding pt-24">
      <div className="container-max flex items-center justify-center min-h-[60vh]">
        <div className="glass-prominent text-center max-w-md p-8 md:p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-panel !rounded-2xl !border-signal/30 mb-6">
            <CheckCircle2 size={36} className="text-signal" />
          </div>
          <div className="label-mono text-signal/70 mb-3">TRANSACTION.SUCCESS</div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-3">{t.payment.successTitle}</h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">{t.payment.successDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/orders" className="glass-cta">
              {t.payment.viewOrders}
            </Link>
            <Link href="/" className="glass-ghost">
              {t.payment.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function PaymentCancelPage() {
  const { t } = useLanguage()

  return (
    <div className="section-padding pt-24">
      <div className="container-max flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel text-center max-w-md p-8 md:p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-panel !rounded-2xl !border-red-500/30 mb-6">
            <XCircle size={36} className="text-red-400" />
          </div>
          <div className="label-mono !text-red-400/70 mb-3">TRANSACTION.CANCELED</div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-3">{t.payment.cancelTitle}</h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">{t.payment.cancelDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/services" className="glass-cta">
              {t.payment.tryAgain}
            </Link>
            <Link href="/contact" className="glass-ghost">
              {t.payment.contactSupport}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

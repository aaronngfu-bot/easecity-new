import type { Metadata } from 'next'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Cancelled',
}

export default function PaymentCancelPage() {
  return (
    <div className="section-padding">
      <div className="container-max flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/25 mb-8">
            <XCircle size={36} className="text-red-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-3">
            Payment Cancelled
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Your payment was not completed. No charges were made. You can try
            again or contact support if you need assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-secondary font-medium text-sm rounded-xl hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

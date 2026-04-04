import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Successful',
}

export default function PaymentSuccessPage() {
  return (
    <div className="section-padding">
      <div className="container-max flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/25 mb-8">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-3">
            Payment Successful
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Thank you for your purchase. Your order has been confirmed and you
            will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all shadow-glow-cyan-sm hover:shadow-glow-cyan"
            >
              View Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-text-secondary font-medium text-sm rounded-xl hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

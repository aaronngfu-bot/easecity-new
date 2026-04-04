'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function PricingHero() {
  return (
    <section
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, #22d3ee10, transparent),
          radial-gradient(ellipse 50% 40% at 20% 80%, #a855f706, transparent),
          #09090b
        `,
      }}
    >
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-20%] left-[10%] w-[500px] h-[400px] bg-accent-cyan rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container-max relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/8 mb-8"
          >
            <Zap size={12} className="text-accent-cyan" />
            <span className="text-accent-cyan text-xs font-mono tracking-wider">
              TRANSPARENT PRICING
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-text-primary">Infrastructure that </span>
            <span className="text-gradient-primary">scales with you</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            From startups to enterprise — choose the plan that fits your
            operational needs. Every plan includes core stream control
            capabilities with zero hidden fees.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-text-muted"
          >
            {[
              'No setup fees',
              '14-day free trial',
              'Cancel anytime',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

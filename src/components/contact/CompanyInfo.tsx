'use client'

import { motion } from 'framer-motion'
import { MapPin, Mail, Clock, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function CompanyInfo() {
  const { t } = useLanguage()

  const infoItems = [
    { icon: MapPin, label: t.companyInfo.locLabel, value: t.companyInfo.locValue, sub: t.companyInfo.locSub },
    { icon: Mail, label: t.companyInfo.emailLabel, value: t.companyInfo.emailValue, sub: t.companyInfo.emailSub },
    { icon: Clock, label: t.companyInfo.timeLabel, value: t.companyInfo.timeValue, sub: t.companyInfo.timeSub },
    { icon: MessageSquare, label: t.companyInfo.entLabel, value: t.companyInfo.entValue, sub: t.companyInfo.entSub },
  ]

  const faqs = [
    { q: t.companyInfo.q1, a: t.companyInfo.a1 },
    { q: t.companyInfo.q2, a: t.companyInfo.a2 },
    { q: t.companyInfo.q3, a: t.companyInfo.a3 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-2xl border border-border bg-bg-surface space-y-5">
        <h3 className="font-display text-sm font-semibold text-text-primary">{t.companyInfo.title}</h3>
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3.5">
            <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-muted">
              <item.icon size={16} />
            </div>
            <div>
              <p className="text-text-muted text-xs mb-0.5">{item.label}</p>
              <p className="text-text-primary text-sm font-medium">{item.value}</p>
              <p className="text-text-muted text-xs">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-accent-cyan/15 bg-accent-cyan/4 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse-slow flex-shrink-0" />
        <div>
          <p className="text-accent-cyan text-sm font-medium">{t.companyInfo.statusTitle}</p>
          <p className="text-text-muted text-xs">{t.companyInfo.statusSub}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">{t.companyInfo.faqTitle}</h3>
        {faqs.map((faq, i) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="p-4 rounded-xl border border-border bg-bg-surface"
          >
            <p className="text-text-primary text-xs font-medium mb-1.5">{faq.q}</p>
            <p className="text-text-secondary text-xs leading-relaxed">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

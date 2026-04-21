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
      className="space-y-5"
    >
      <div className="glass-panel p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
            <h3 className="label-mono text-signal/80">{t.companyInfo.title}</h3>
          </div>
          <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
            META
          </span>
        </div>
        {infoItems.map((item, i) => (
          <div key={item.label} className="flex items-start gap-3.5 group">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-bg-base/40 border border-border group-hover:border-signal/25 group-hover:text-signal flex items-center justify-center text-text-muted transition-colors">
              <item.icon size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="label-mono">{item.label}</p>
                <span className="font-mono text-[10px] text-text-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="text-text-primary text-sm font-medium">{item.value}</p>
              <p className="text-text-muted text-xs">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-prominent p-4 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-signal animate-signal-pulse flex-shrink-0" />
        <div>
          <p className="text-signal text-sm font-medium">{t.companyInfo.statusTitle}</p>
          <p className="text-text-muted text-xs font-mono">{t.companyInfo.statusSub}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
          <h3 className="label-mono text-signal/80">{t.companyInfo.faqTitle}</h3>
        </div>
        {faqs.map((faq, i) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="glass-panel p-4"
          >
            <div className="flex items-start gap-2 mb-1.5">
              <span className="font-mono text-[10px] text-text-muted tracking-wider mt-0.5 flex-shrink-0">
                Q{String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-text-primary text-xs font-medium">{faq.q}</p>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed pl-7">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

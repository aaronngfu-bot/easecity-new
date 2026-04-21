'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  company: string
  subject: string
  message: string
}

export function ContactForm() {
  const { t } = useLanguage()
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    subject: t.contactForm.subjects[0],
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || 'Something went wrong')
      }

      setFormState('success')
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-prominent h-full min-h-[480px] flex flex-col items-center justify-center text-center p-10"
      >
        <div className="w-16 h-16 rounded-full glass-panel !rounded-full flex items-center justify-center mb-6 border border-signal/30">
          <CheckCircle2 size={30} className="text-signal" />
        </div>
        <div className="label-mono text-signal/70 mb-3">TRANSMISSION.COMPLETE</div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
          {t.contactForm.successTitle}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm mb-6">
          {t.contactForm.successDesc}
        </p>
        <button
          onClick={() => {
            setFormState('idle')
            setData({ name: '', email: '', company: '', subject: t.contactForm.subjects[0], message: '' })
          }}
          className="glass-ghost"
        >
          {t.contactForm.successReset}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
        <span className="label-mono text-signal/80">TRANSMISSION.FORM</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="label-mono block mb-2">
              {t.contactForm.nameLabel} <span className="text-signal">{t.contactForm.required}</span>
            </label>
            <input
              id="name" name="name" type="text" required
              value={data.name} onChange={handleChange}
              placeholder={t.contactForm.namePlaceholder}
              className="glass-input"
            />
          </div>
          <div>
            <label htmlFor="email" className="label-mono block mb-2">
              {t.contactForm.emailLabel} <span className="text-signal">{t.contactForm.required}</span>
            </label>
            <input
              id="email" name="email" type="email" required
              value={data.email} onChange={handleChange}
              placeholder={t.contactForm.emailPlaceholder}
              className="glass-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className="label-mono block mb-2">
            {t.contactForm.companyLabel}
          </label>
          <input
            id="company" name="company" type="text"
            value={data.company} onChange={handleChange}
            placeholder={t.contactForm.companyPlaceholder}
            className="glass-input"
          />
        </div>

        <div>
          <label htmlFor="subject" className="label-mono block mb-2">
            {t.contactForm.subjectLabel} <span className="text-signal">{t.contactForm.required}</span>
          </label>
          <select
            id="subject" name="subject" required
            value={data.subject} onChange={handleChange}
            className={cn('glass-input appearance-none cursor-pointer')}
          >
            {t.contactForm.subjects.map((opt) => (
              <option key={opt} value={opt} className="bg-bg-surface">{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="label-mono block mb-2">
            {t.contactForm.messageLabel} <span className="text-signal">{t.contactForm.required}</span>
          </label>
          <textarea
            id="message" name="message" required rows={6}
            value={data.message} onChange={handleChange}
            placeholder={t.contactForm.messagePlaceholder}
            className={cn('glass-input resize-none')}
          />
        </div>

        {formState === 'error' && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/25 bg-red-500/8 text-red-400 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            {errorMessage || t.contactForm.errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={formState === 'loading'}
          className={cn(
            'glass-cta w-full',
            formState === 'loading' && 'opacity-60 cursor-not-allowed'
          )}
        >
          {formState === 'loading' ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.contactForm.sending}
            </>
          ) : (
            <>
              <Send size={16} />
              {t.contactForm.submit}
            </>
          )}
        </button>

        <p className="text-text-muted text-xs text-center font-mono">{t.contactForm.footerNote}</p>
      </form>
    </motion.div>
  )
}

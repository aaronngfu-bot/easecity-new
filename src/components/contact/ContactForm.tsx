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
        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/5"
      >
        <div className="w-14 h-14 rounded-full bg-accent-cyan/15 flex items-center justify-center mb-5">
          <CheckCircle2 size={28} className="text-accent-cyan" />
        </div>
        <h3 className="font-display text-xl font-bold text-text-primary mb-3">
          {t.contactForm.successTitle}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
          {t.contactForm.successDesc}
        </p>
        <button
          onClick={() => {
            setFormState('idle')
            setData({ name: '', email: '', company: '', subject: t.contactForm.subjects[0], message: '' })
          }}
          className="mt-6 text-accent-cyan text-sm font-medium hover:text-accent-cyan-light transition-colors"
        >
          {t.contactForm.successReset}
        </button>
      </motion.div>
    )
  }

  const inputClass = cn(
    'w-full px-4 py-3 rounded-xl border bg-bg-surface text-text-primary text-sm',
    'placeholder:text-text-muted',
    'border-border focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30',
    'transition-all duration-200'
  )

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-text-secondary mb-1.5">
            {t.contactForm.nameLabel} <span className="text-accent-cyan">{t.contactForm.required}</span>
          </label>
          <input
            id="name" name="name" type="text" required
            value={data.name} onChange={handleChange}
            placeholder={t.contactForm.namePlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
            {t.contactForm.emailLabel} <span className="text-accent-cyan">{t.contactForm.required}</span>
          </label>
          <input
            id="email" name="email" type="email" required
            value={data.email} onChange={handleChange}
            placeholder={t.contactForm.emailPlaceholder}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-xs font-medium text-text-secondary mb-1.5">
          {t.contactForm.companyLabel}
        </label>
        <input
          id="company" name="company" type="text"
          value={data.company} onChange={handleChange}
          placeholder={t.contactForm.companyPlaceholder}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-medium text-text-secondary mb-1.5">
          {t.contactForm.subjectLabel} <span className="text-accent-cyan">{t.contactForm.required}</span>
        </label>
        <select
          id="subject" name="subject" required
          value={data.subject} onChange={handleChange}
          className={cn(inputClass, 'appearance-none cursor-pointer')}
        >
          {t.contactForm.subjects.map((opt) => (
            <option key={opt} value={opt} className="bg-bg-surface">{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-text-secondary mb-1.5">
          {t.contactForm.messageLabel} <span className="text-accent-cyan">{t.contactForm.required}</span>
        </label>
        <textarea
          id="message" name="message" required rows={6}
          value={data.message} onChange={handleChange}
          placeholder={t.contactForm.messagePlaceholder}
          className={cn(inputClass, 'resize-none')}
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
          'group w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5',
          'bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl',
          'hover:bg-accent-cyan-light transition-all duration-200',
          'shadow-glow-cyan-sm hover:shadow-glow-cyan',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-accent-cyan'
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

      <p className="text-text-muted text-xs text-center">{t.contactForm.footerNote}</p>
    </motion.form>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE_OUT } from '@/lib/motion'
import { X, ArrowLeft, ArrowRight, Send, CheckCircle2, AlertCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { copyKey } from '@/i18n/translations'
import { getQuestionnaire, defaultQuestionnaire, type Question } from '@/lib/questionnaires'

interface QuoteModalProps {
  open: boolean
  onClose: () => void
  serviceSlug?: string
  serviceTitle?: string
}

type Answers = Record<string, string | string[]>

export function QuoteModal({ open, onClose, serviceSlug, serviceTitle }: QuoteModalProps) {
  const { t, language } = useLanguage()
  const c = t.contactForm
  const q = serviceSlug ? getQuestionnaire(serviceSlug) : defaultQuestionnaire
  const questionnaire = q ?? defaultQuestionnaire

  const questions: Question[] = [
    ...questionnaire.questions.filter((x) => x.id !== 'budget' && x.id !== 'timeline'),
    ...questionnaire.questions.filter((x) => x.id === 'budget' || x.id === 'timeline'),
  ]

  /**
   * Questions, then contact details, then the confirmation. The confirmation
   * counts: it is the step the progress bar has to be able to fill. Before, it
   * was counted but never reached, because submitting went straight to the
   * success state without advancing the step. So the bar topped out one segment
   * short and the label read "step 6 of 7" on a screen that said the request had
   * been sent.
   */
  const TOTAL = questions.length + 2
  const DONE_STEP = questions.length + 1

  const [step, setStep] = useState(0) // 0..questions.length-1 = questions, then contact, then done
  const [answers, setAnswers] = useState<Answers>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const reset = useCallback(() => {
    setStep(0)
    setAnswers({})
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setState('idle')
    setErrorMsg('')
  }, [])

  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const isQuestionStep = step < questions.length
  const isContactStep = step === questions.length

  /** Steps the visitor has reached, counting the one they are on. */
  const reached = Math.min(step + 1, TOTAL)

  const curQ = isQuestionStep ? questions[step] : null

  const toggleOption = (qid: string, opt: string, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qid]
      if (!multi) return { ...prev, [qid]: opt }
      const arr = Array.isArray(cur) ? (cur as string[]) : []
      return {
        ...prev,
        [qid]: arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt],
      }
    })
  }

  const answerLabel = (qid: string): string => {
    const val = answers[qid]
    if (val == null) return ''
    const opts = questions.find((x) => x.id === qid)?.options ?? []
    const list = Array.isArray(val) ? val : [val]
    return list
      .map((v) => opts.find((o) => o.en === v || o.zh === v)?.[copyKey(language)] ?? v)
      .join(', ')
  }

  /**
   * An empty array counts as unanswered. Checking the value for truthiness is
   * not enough: tick an option on a multi-select and untick it again and you are
   * left with `[]`, which would let a required question through unanswered.
   */
  const answered = (qid: string): boolean => {
    const val = answers[qid]
    if (Array.isArray(val)) return val.length > 0
    return typeof val === 'string' ? val.trim().length > 0 : false
  }

  const curValid = () => {
    if (isContactStep) {
      return name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    return true
  }

  const next = () => {
    if (isQuestionStep) setStep((s) => s + 1)
    else if (isContactStep && curValid()) setStep((s) => s + 1)
  }

  const buildMessage = (): string => {
    const parts: string[] = []
    if (serviceTitle) parts.push(`Service: ${serviceTitle}`)
    for (const q of questions) {
      const label = q.label[copyKey(language)]
      const ans = answerLabel(q.id)
      if (ans) parts.push(`${label}: ${ans}`)
    }
    if (company.trim()) parts.push(`${c.companyLabel}: ${company.trim()}`)
    return parts.join('\n')
  }

  const submit = async () => {
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          company: company || undefined,
          subject: serviceTitle ?? 'General enquiry',
          message: buildMessage(),
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error?.message || 'Something went wrong')
      setState('success')
      setStep(DONE_STEP)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error')
      setState('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={c.quoteTitle}>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* panel */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl sm:rounded-2xl"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4">
          <div>
            <span className="label-mono text-[var(--signal)]">{c.quoteEyebrow}</span>
            {serviceTitle && (
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{serviceTitle}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]" aria-label={c.closeModal}>
            <X size={18} />
          </button>
        </div>

        {/* progress */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <span className={cn('label-mono', state === 'success' ? 'text-[var(--signal)]' : 'text-[var(--text-muted)]')}>
              {state === 'success'
                ? c.stepAllDone
                : c.stepOf.replace('{n}', String(reached)).replace('{total}', String(TOTAL))}
            </span>
            <span className={cn('text-xs font-medium', state === 'success' ? 'text-[var(--signal)]' : 'text-[var(--text-muted)]')}>
              {Math.round((reached / TOTAL) * 100)}%
            </span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i < reached ? 'bg-[var(--signal)]' : 'bg-[var(--border-color)]')} />
            ))}
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-md border border-[var(--signal)]/30 bg-[var(--signal)]/10">
                  <CheckCircle2 size={30} className="text-[var(--signal)]" />
                </div>
                <div className="label-mono mb-3 text-[var(--signal)]/70">TRANSMISSION.COMPLETE</div>
                <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">{c.successTitle}</h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">{c.successDesc}</p>
                <button onClick={onClose} className="signal-cta mt-6">{t.footer.linkTouch}</button>
              </motion.div>
            ) : isQuestionStep && curQ ? (
              <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18, ease: EASE_OUT }}>
                {step === 0 && <p className="mb-4 text-sm text-[var(--text-secondary)]">{questionnaire.intro[copyKey(language)]}</p>}
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{curQ.label[copyKey(language)]}</h3>

                {curQ.type === 'single' && curQ.options && (
                  <div className="mt-4 grid gap-2">
                    {curQ.options.map((opt) => (
                      <button
                        key={opt.en}
                        type="button"
                        onClick={() => toggleOption(curQ.id, opt[copyKey(language)], false)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                          answers[curQ.id] === opt[copyKey(language)]
                            ? 'border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--text-primary)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--signal)]'
                        )}
                      >
                        {opt[copyKey(language)]}
                        {answers[curQ.id] === opt[copyKey(language)] && <CheckCircle2 size={16} className="text-[var(--signal)]" />}
                      </button>
                    ))}
                  </div>
                )}

                {curQ.type === 'multi' && curQ.options && (
                  <div className="mt-4 grid gap-2">
                    {curQ.options.map((opt) => {
                      const selected = (answers[curQ.id] as string[] | undefined)?.includes(opt[copyKey(language)])
                      return (
                        <button
                          key={opt.en}
                          type="button"
                          onClick={() => toggleOption(curQ.id, opt[copyKey(language)], true)}
                          className={cn(
                            'flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                            selected
                              ? 'border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--text-primary)]'
                              : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--signal)]'
                          )}
                        >
                          {opt[copyKey(language)]}
                          {selected && <CheckCircle2 size={16} className="text-[var(--signal)]" />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {(curQ.type === 'text' || curQ.type === 'textarea') && (
                  <div className="mt-4">
                    {curQ.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        value={(answers[curQ.id] as string) ?? ''}
                        onChange={(e) => setAnswers((p) => ({ ...p, [curQ.id]: e.target.value }))}
                        placeholder={curQ.placeholder?.[copyKey(language)]}
                        className="glass-input resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(answers[curQ.id] as string) ?? ''}
                        onChange={(e) => setAnswers((p) => ({ ...p, [curQ.id]: e.target.value }))}
                        placeholder={curQ.placeholder?.[copyKey(language)]}
                        className="glass-input"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            ) : isContactStep ? (
              <motion.div key="contact" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18, ease: EASE_OUT }}>
                <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{c.step3Title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{c.step3Desc}</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="qm-name" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      {c.nameLabel} <span className="text-[var(--signal)]">{c.required}</span>
                    </label>
                    <input id="qm-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePlaceholder} className="glass-input" />
                  </div>
                  <div>
                    <label htmlFor="qm-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      {c.emailLabel} <span className="text-[var(--signal)]">{c.required}</span>
                    </label>
                    <input id="qm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.emailPlaceholder} className="glass-input" />
                  </div>
                  <div>
                    <label htmlFor="qm-phone" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{c.phoneLabel}</label>
                    <div className="relative">
                      <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                      <input id="qm-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={c.phonePlaceholder} className="glass-input pl-9" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="qm-company" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">{c.companyLabel}</label>
                    <input id="qm-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={c.companyPlaceholder} className="glass-input" />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {state === 'error' && (
            <div role="alert" className="mt-4 flex items-center gap-2.5 rounded-md border border-status-danger/25 bg-status-danger/10 p-3 text-sm text-status-danger">
              <AlertCircle size={15} className="flex-shrink-0" />
              {errorMsg || c.errorMsg}
            </div>
          )}
        </div>

        {/* footer nav */}
        {state !== 'success' && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-color)] px-5 py-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors', step === 0 ? 'invisible' : 'text-[var(--text-secondary)] hover:text-[var(--signal)]')}
            >
              <ArrowLeft size={15} />
              {c.back}
            </button>

            {isQuestionStep ? (
              <button
                type="button"
                onClick={next}
                disabled={curQ?.required && !answered(curQ.id)}
                className="signal-cta disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {c.next}
                <ArrowRight size={15} />
              </button>
            ) : isContactStep ? (
              <button type="button" onClick={submit} disabled={state === 'loading' || !curValid()} className="signal-cta disabled:opacity-50 disabled:cursor-not-allowed">
                {state === 'loading' ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Send size={15} />
                )}
                {state === 'loading' ? c.sending : c.done}
              </button>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  )
}
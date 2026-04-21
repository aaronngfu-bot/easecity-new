'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!turnstileToken) {
      setError('請完成人機驗證')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turnstileToken }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        setError(result.error?.message || 'Registration failed')
        setLoading(false)
        return
      }
      const signInResult = await signIn('credentials', { email, password, redirect: false })
      if (signInResult?.error) {
        router.push('/login')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError(t.auth.unexpectedError)
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <div className="relative w-11 h-11 glass-panel flex items-center justify-center !rounded-xl">
            <svg viewBox="0 0 36 36" className="w-8 h-8">
              <circle cx="18" cy="6" r="1.2" fill="#52525b" />
              <circle cx="30" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="30" r="1.2" fill="#52525b" />
              <circle cx="6" cy="18" r="1.2" fill="#52525b" />
              <line x1="18" y1="6" x2="18" y2="14" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="30" y1="18" x2="22" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="18" y1="30" x2="18" y2="22" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="6" y1="18" x2="14" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <circle cx="18" cy="18" r="3.5" fill="#22ff88" opacity="0.3" />
              <circle cx="18" cy="18" r="2" fill="#22ff88" />
            </svg>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="label-mono text-signal/70">AUTH.REGISTER</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary tracking-tight">{t.auth.createAccount}</h1>
        <p className="text-text-secondary text-sm mt-2">{t.auth.getStarted}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/25 bg-red-500/8 text-red-400 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label-mono block mb-2">{t.auth.nameLabel}</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.auth.namePlaceholder} className="glass-input" />
        </div>

        <div>
          <label htmlFor="email" className="label-mono block mb-2">{t.auth.emailLabel}</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="glass-input" />
        </div>

        <div>
          <label htmlFor="password" className="label-mono block mb-2">{t.auth.passwordLabel}</label>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.passwordPlaceholder} className="glass-input" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-signal transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-2 font-mono">{t.auth.passwordHint}</p>
        </div>

        <div className="flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => {
              setTurnstileToken(null)
              setError('人機驗證失敗，請重新整理頁面再試。')
            }}
            options={{ theme: 'dark', language: 'zh-TW' }}
          />
        </div>

        <button type="submit" disabled={loading || !turnstileToken} className={cn('glass-cta w-full', (loading || !turnstileToken) && 'opacity-60 cursor-not-allowed')}>
          {loading ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <UserPlus size={16} />
          )}
          {loading ? t.auth.creatingAccount : t.auth.createBtn}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        {t.auth.haveAccount}{' '}
        <Link
          href={callbackUrl !== '/dashboard' ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
          className="text-signal hover:text-signal-light transition-colors underline underline-offset-2"
        >
          {t.auth.signIn}
        </Link>
      </p>
    </motion.div>
  )
}

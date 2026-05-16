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
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'
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

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    await signIn('google', { callbackUrl })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="text-center">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
            <svg viewBox="0 0 36 36" className="w-8 h-8">
              <circle cx="18" cy="6" r="1.2" fill="#52525b" />
              <circle cx="30" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="30" r="1.2" fill="#52525b" />
              <circle cx="6" cy="18" r="1.2" fill="#52525b" />
              <line x1="18" y1="6" x2="18" y2="14" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="30" y1="18" x2="22" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="18" y1="30" x2="18" y2="22" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <line x1="6" y1="18" x2="14" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
              <circle cx="18" cy="18" r="3.5" fill="#00e5cc" opacity="0.3" />
              <circle cx="18" cy="18" r="2" fill="#00e5cc" />
            </svg>
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="label-mono text-signal/70">AUTH.REGISTER</span>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-text-primary">{t.auth.createAccount}</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{t.auth.getStarted}</p>
      </div>

      <form onSubmit={handleSubmit} className="signal-panel space-y-5 p-6 md:p-8">
        {error && (
          <div role="alert" className="flex items-center gap-2.5 rounded-md border border-status-danger/25 bg-status-danger/10 p-3 text-sm text-status-danger">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {googleAuthEnabled && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="signal-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark />
              {t.auth.continueWithGoogle}
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="label-mono text-text-muted">{t.auth.orContinueWith}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-text-secondary">{t.auth.nameLabel}</label>
          <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t.auth.namePlaceholder} className="glass-input" />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-secondary">{t.auth.emailLabel}</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="glass-input" />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-secondary">{t.auth.passwordLabel}</label>
          <div className="relative">
            <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.auth.passwordPlaceholder} className="glass-input" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-signal transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
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

        <button type="submit" disabled={loading || !turnstileToken} className={cn('signal-cta w-full', (loading || !turnstileToken) && 'opacity-60 cursor-not-allowed')}>
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

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

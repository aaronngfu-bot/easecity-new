'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = cn(
    'w-full px-4 py-3 rounded-xl border bg-bg-surface text-text-primary text-sm',
    'placeholder:text-text-muted',
    'border-border focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30',
    'transition-all duration-200'
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="10" r="3" fill="white" />
              <line x1="10" y1="2" x2="10" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="13" x2="10" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Link>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Welcome back
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-border bg-bg-surface space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/25 bg-red-500/8 text-red-400 text-sm">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
            Email
          </label>
          <input
            id="email" type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password" type={showPassword ? 'text' : 'password'} required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2.5 px-6 py-3',
            'bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl',
            'hover:bg-accent-cyan-light transition-all duration-200',
            'shadow-glow-cyan-sm hover:shadow-glow-cyan',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <LogIn size={16} />
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-accent-cyan hover:text-accent-cyan-light transition-colors">
          Sign up
        </Link>
      </p>
    </motion.div>
  )
}

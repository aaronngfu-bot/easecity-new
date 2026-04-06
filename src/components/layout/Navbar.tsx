'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

function LangToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-bg-surface text-xs font-medium">
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2.5 py-1 rounded-md transition-all duration-200',
          language === 'en'
            ? 'bg-accent-cyan text-bg-base shadow-glow-cyan-sm'
            : 'text-text-muted hover:text-text-secondary'
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('zh')}
        className={cn(
          'px-2.5 py-1 rounded-md transition-all duration-200',
          language === 'zh'
            ? 'bg-accent-cyan text-bg-base shadow-glow-cyan-sm'
            : 'text-text-muted hover:text-text-secondary'
        )}
        aria-label="切換至中文"
      >
        中文
      </button>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg-base/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="container-max">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-accent-cyan/20 group-hover:bg-accent-cyan/30 transition-colors duration-300" />
              <div className="absolute inset-[3px] rounded-md bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <circle cx="10" cy="10" r="3" fill="white" />
                  <line x1="10" y1="2" x2="10" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="10" y1="13" x2="10" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-text-primary group-hover:text-accent-cyan transition-colors duration-300">
              easecity
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    pathname === link.href
                      ? 'text-accent-cyan'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {pathname === link.href && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: Lang Toggle + Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <AuthButtons />
          </div>

          {/* Mobile: Lang Toggle + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LangToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-bg-base/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container-max py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                      pathname === link.href
                        ? 'text-accent-cyan bg-accent-cyan/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-3 border-t border-border mt-2 space-y-2">
                <MobileAuthButtons />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function AuthButtons() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()

  if (status === 'loading') {
    return (
      <div className="w-20 h-9 rounded-lg bg-bg-elevated animate-pulse" />
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {t.auth.dashboard}
          </span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {t.auth.signIn}
      </Link>
      <Link
        href="/contact"
        className="px-5 py-2.5 text-sm font-medium bg-accent-cyan text-bg-base rounded-lg hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm hover:shadow-glow-cyan"
      >
        {t.nav.cta}
      </Link>
    </div>
  )
}

function MobileAuthButtons() {
  const { data: session } = useSession()
  const { t } = useLanguage()

  if (session) {
    return (
      <>
        <Link
          href="/dashboard"
          className="block w-full text-center px-5 py-3 text-sm font-medium bg-accent-cyan text-bg-base rounded-lg hover:bg-accent-cyan-light transition-colors"
        >
          {t.auth.dashboard}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="block w-full text-center px-5 py-3 text-sm font-medium text-red-400 border border-red-500/25 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          {t.auth.signOut}
        </button>
      </>
    )
  }

  return (
    <>
      <Link
        href="/login"
        className="block w-full text-center px-5 py-3 text-sm font-medium border border-border text-text-secondary rounded-lg hover:text-text-primary hover:bg-bg-elevated transition-colors"
      >
        {t.auth.signIn}
      </Link>
      <Link
        href="/contact"
        className="block w-full text-center px-5 py-3 text-sm font-medium bg-accent-cyan text-bg-base rounded-lg hover:bg-accent-cyan-light transition-colors"
      >
        {t.nav.cta}
      </Link>
    </>
  )
}

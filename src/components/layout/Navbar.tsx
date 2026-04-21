'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

function LangToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="relative flex items-center text-[11px] font-mono tracking-wider">
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2.5 py-1 transition-colors duration-200 relative z-10',
          language === 'en' ? 'text-signal' : 'text-text-muted hover:text-text-secondary'
        )}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-text-faint">/</span>
      <button
        onClick={() => setLanguage('zh')}
        className={cn(
          'px-2.5 py-1 transition-colors duration-200 relative z-10',
          language === 'zh' ? 'text-signal' : 'text-text-muted hover:text-text-secondary'
        )}
        aria-label="切換至中文"
      >
        ZH
      </button>
    </div>
  )
}

function EasecityLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="easecity home">
      <div className="relative w-9 h-9">
        {/* Glass base */}
        <div className="absolute inset-0 rounded-lg glass-panel opacity-100" />
        {/* Signal dot — the one live node */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full">
            {/* satellite nodes */}
            <circle cx="18" cy="6" r="1.2" fill="#52525b" />
            <circle cx="30" cy="18" r="1.2" fill="#52525b" />
            <circle cx="18" cy="30" r="1.2" fill="#52525b" />
            <circle cx="6" cy="18" r="1.2" fill="#52525b" />
            {/* connection lines */}
            <line x1="18" y1="6" x2="18" y2="14" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <line x1="30" y1="18" x2="22" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <line x1="18" y1="30" x2="18" y2="22" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            <line x1="6" y1="18" x2="14" y2="18" stroke="#52525b" strokeWidth="0.8" opacity="0.6" />
            {/* central signal node */}
            <circle cx="18" cy="18" r="3.5" fill="#22ff88" opacity="0.3" className="group-hover:opacity-60 transition-opacity">
              <animate attributeName="r" values="3.5;4.5;3.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="18" cy="18" r="2" fill="#22ff88" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-bold text-base tracking-tight text-text-primary group-hover:text-signal transition-colors duration-300">
          easecity
        </span>
        <span className="label-mono text-[9px] text-text-muted group-hover:text-signal/70 transition-colors duration-300">
          STREAM.CONTROL
        </span>
      </div>
    </Link>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const navLinks = [
    { href: '/', label: t.nav.home, num: '01' },
    { href: '/services', label: t.nav.services, num: '02' },
    { href: '/pricing', label: t.nav.pricing, num: '03' },
    { href: '/about', label: t.nav.about, num: '04' },
    { href: '/contact', label: t.nav.contact, num: '05' },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled ? 'glass-nav' : 'bg-transparent'
      )}
    >
      {/* Scroll progress rail — sits flush at the bottom of the navbar */}
      <motion.div
        style={{ width: progressWidth }}
        className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-signal to-signal-light pointer-events-none"
      />

      <div className="container-max">
        <nav className="flex items-center justify-between h-16 md:h-20">
          <EasecityLogo />

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-200 flex items-center gap-1.5',
                      isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-signal/8 border border-signal/20"
                        transition={{ type: 'spring', duration: 0.45, bounce: 0.18 }}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 font-mono text-[10px] tracking-wider transition-colors',
                        isActive ? 'text-signal' : 'text-text-muted'
                      )}
                    >
                      {link.num}
                    </span>
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop right cluster */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <div className="w-px h-5 bg-border" />
            <AuthButtons />
          </div>

          {/* Mobile cluster */}
          <div className="md:hidden flex items-center gap-2">
            <LangToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-signal hover:bg-signal/5 transition-colors duration-200"
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
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden glass-nav"
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
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
                      pathname === link.href
                        ? 'text-text-primary bg-signal/8 border border-signal/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50 border border-transparent'
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-wider',
                        pathname === link.href ? 'text-signal' : 'text-text-muted'
                      )}
                    >
                      {link.num}
                    </span>
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
    return <div className="w-24 h-9 rounded-lg bg-bg-elevated/50 animate-pulse" />
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg border border-border text-text-secondary hover:text-signal hover:border-signal/30 transition-colors"
        >
          <User size={13} />
          {t.auth.dashboard}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {t.auth.signIn}
      </Link>
      <Link
        href="/contact"
        className="glass-cta !py-2 !px-4 !text-[13px]"
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
        <Link href="/dashboard" className="glass-cta w-full">
          {t.auth.dashboard}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="block w-full text-center px-5 py-3 text-sm font-medium text-red-400 border border-red-500/25 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          {t.auth.signOut}
        </button>
      </>
    )
  }

  return (
    <>
      <Link href="/login" className="glass-ghost w-full">
        {t.auth.signIn}
      </Link>
      <Link href="/contact" className="glass-cta w-full">
        {t.nav.cta}
      </Link>
    </>
  )
}

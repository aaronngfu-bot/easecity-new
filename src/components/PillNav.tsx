'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ChevronRight, LayoutDashboard, LogOut } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BrandMark } from '@/components/brand/BrandMark'
import './PillNav.css'

interface NavItem {
  href: string
  labelKey?: string
  label?: string
  ariaLabel?: string
}

interface PillNavProps {
  items: NavItem[]
  className?: string
}

export default function PillNav({ items, className = '' }: PillNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])

  // Lock body scroll while the sheet is open, so the page behind doesn't move.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Nav stays pinned & visible — no hide-on-scroll-down behavior.
  const authed = status === 'authenticated'

  const getItemLabel = (item: NavItem) =>
    item.labelKey ? (t.nav[item.labelKey as keyof typeof t.nav] ?? item.label) : item.label

  const isActive = (href: string) => pathname === href

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label={t.a11y.primaryNav}>
        <Link className="pill-logo" href="/" aria-label={t.nav.home}>
          <BrandMark size={28} />
          <span className="pill-wordmark">
            <span className="pill-wordmark-brand">EaseCity</span>
          </span>
        </Link>

        <div className="pill-nav-items desktop-only">
          <ul className="pill-list">
            {items.map((item, i) => {
              const label = getItemLabel(item)
              const active = isActive(item.href)
              return (
                <li key={item.href || `item-${i}`}>
                  <Link
                    href={item.href}
                    className={`pill ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    aria-label={item.ariaLabel || label}
                  >
                    <span className="label-stack">
                      <span className="pill-label">{label}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="pill-language-toggle desktop-only" aria-label={t.a11y.language}>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'is-active' : ''}
            aria-label={t.a11y.switchToEnglish}
            aria-pressed={language === 'en'}
          >
            EN
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={language === 'zh' ? 'is-active' : ''}
            aria-label={t.a11y.switchToChinese}
            aria-pressed={language === 'zh'}
          >
            繁中
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => setLanguage('zh-CN')}
            className={language === 'zh-CN' ? 'is-active' : ''}
            aria-label={t.a11y.switchToSimplified}
            aria-pressed={language === 'zh-CN'}
          >
            简体
          </button>
        </div>

        <ThemeToggle className="desktop-only" />

        {!authed && (
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="pill-sign-in desktop-only"
          >
            <span>{t.nav.signIn}</span>
          </button>
        )}

        {!authed && (
          <button
            type="button"
            onClick={() => router.push('/signup')}
            className="pill-cta desktop-only"
          >
            {t.nav.cta}
          </button>
        )}

        {authed && (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="pill-auth desktop-only"
            aria-label={t.auth.dashboard}
          >
            <LayoutDashboard size={15} />
            <span>{t.auth.dashboard}</span>
          </button>
        )}
        {authed && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="pill-sign-in desktop-only"
            aria-label={t.auth.signOut}
          >
            <LogOut size={14} />
            <span>{t.auth.signOut}</span>
          </button>
        )}

        <button
          type="button"
          className={`mobile-menu-button mobile-only ${mobileMenuOpen ? 'is-open' : ''}`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu-sheet"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {/* Always-mounted right sheet. `is-open` drives scrim opacity and the
          panel's translateX; pointer-events keeps the closed sheet untouchable.
          Exit plays by the same transition (no mount/unmount race). */}
      <div
        className={`mobile-menu-scrim mobile-only ${mobileMenuOpen ? 'is-visible' : ''}`}
        aria-hidden="true"
        onClick={closeMobileMenu}
      />
      <aside
        id="mobile-menu-sheet"
        className={`mobile-menu-sheet mobile-only ${mobileMenuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.a11y.primaryNav}
        aria-hidden={!mobileMenuOpen}
      >
        <nav className="mobile-menu-body" aria-label={t.a11y.primaryNav}>
          <ol className="mobile-menu-list">
            {items.map((item, i) => {
              const label = getItemLabel(item)
              const active = isActive(item.href)
              return (
                <li key={item.href || `m-item-${i}`}>
                  <Link
                    href={item.href}
                    className={`mobile-menu-link ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={closeMobileMenu}
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    <span className="mobile-menu-label">{label}</span>
                    <ChevronRight
                      size={16}
                      className={`mobile-menu-chevron ${active ? 'is-active' : ''}`}
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ol>

          {!authed && (
            <div className="mobile-menu-auth">
              <button
                type="button"
                className="mobile-menu-signin"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => {
                  router.push('/login')
                  closeMobileMenu()
                }}
              >
                {t.nav.signIn}
              </button>
              <button
                type="button"
                className="mobile-menu-cta"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => {
                  router.push('/signup')
                  closeMobileMenu()
                }}
              >
                {t.nav.cta}
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          )}

          {authed && (
            <div className="mobile-menu-auth">
              <Link
                href="/dashboard"
                className="mobile-menu-account"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={16} />
                {t.auth.dashboard}
              </Link>
              <button
                type="button"
                className="mobile-menu-signout"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => {
                  signOut({ callbackUrl: '/' })
                  closeMobileMenu()
                }}
              >
                <LogOut size={15} />
                {t.auth.signOut}
              </button>
            </div>
          )}
        </nav>

        <div className="mobile-menu-foot">
          <div className="mobile-seg" role="group" aria-label={t.a11y.language}>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'is-active' : ''}
              aria-label={t.a11y.switchToEnglish}
              aria-pressed={language === 'en'}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('zh')}
              className={language === 'zh' ? 'is-active' : ''}
              aria-label={t.a11y.switchToChinese}
              aria-pressed={language === 'zh'}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              繁中
            </button>
            <button
              type="button"
              onClick={() => setLanguage('zh-CN')}
              className={language === 'zh-CN' ? 'is-active' : ''}
              aria-label={t.a11y.switchToSimplified}
              aria-pressed={language === 'zh-CN'}
              tabIndex={mobileMenuOpen ? 0 : -1}
            >
              简体
            </button>
          </div>
          <div className="mobile-menu-theme">
            <ThemeToggle />
            <span className="text-sm text-text-muted">{t.a11y.theme}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, LogOut } from 'lucide-react'
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
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-popover mobile-only">
          <ul className="mobile-menu-list">
            <li>
              <div className="mobile-language-toggle" aria-label={t.a11y.language}>
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
              </div>
            </li>
            <li>
              <div className="flex items-center gap-2 py-1">
                <ThemeToggle />
                <span className="text-sm text-text-muted">{t.a11y.theme}</span>
              </div>
            </li>
            {items.map((item, i) => {
              const label = getItemLabel(item)
              return (
                <li key={item.href || `mobile-item-${i}`}>
                  <Link
                    href={item.href}
                    className={`mobile-menu-link ${isActive(item.href) ? 'is-active' : ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
            {!authed && (
              <>
                <li>
                  <button
                    type="button"
                    className="mobile-menu-link w-full text-left"
                    onClick={() => {
                      router.push('/login')
                      setMobileMenuOpen(false)
                    }}
                  >
                    {t.nav.signIn}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-menu-link w-full text-left font-semibold text-[var(--signal)]"
                    onClick={() => {
                      router.push('/signup')
                      setMobileMenuOpen(false)
                    }}
                  >
                    {t.nav.cta}
                  </button>
                </li>
              </>
            )}
            {authed && (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="mobile-menu-link flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    {t.auth.dashboard}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-menu-link flex w-full items-center gap-2 text-left"
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut size={16} />
                    {t.auth.signOut}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

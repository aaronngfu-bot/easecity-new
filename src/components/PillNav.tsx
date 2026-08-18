'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getItemLabel = (item: NavItem) =>
    item.labelKey ? (t.nav[item.labelKey as keyof typeof t.nav] ?? item.label) : item.label

  const isActive = (href: string) => pathname === href

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary">
        <Link className="pill-logo" href="/" aria-label="Home">
          <BrandMark size={24} />
          <span className="pill-wordmark">
            <span className="pill-wordmark-brand">easecity</span>
          </span>
        </Link>

        <div className="pill-nav-items desktop-only">
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const label = getItemLabel(item)
              return (
                <li key={item.href || `item-${i}`} role="none">
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={`pill ${isActive(item.href) ? 'is-active' : ''}`}
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

        <div className="pill-language-toggle desktop-only" aria-label="Language switcher">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'is-active' : ''}
            aria-label="Switch to English"
          >
            EN
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={language === 'zh' ? 'is-active' : ''}
            aria-label="切換至中文"
          >
            繁中
          </button>
        </div>

        <ThemeToggle className="desktop-only" />

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="pill-sign-in desktop-only"
        >
          <span>{t.nav.signIn}</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/signup')}
          className="pill-cta desktop-only"
        >
          {t.nav.cta}
        </button>

        <button
          className={`mobile-menu-button mobile-only ${mobileMenuOpen ? 'is-open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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
              <div className="mobile-language-toggle" aria-label="Language switcher">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'is-active' : ''}
                >
                  EN
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() => setLanguage('zh')}
                  className={language === 'zh' ? 'is-active' : ''}
                >
                  繁中
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center gap-2 py-1">
                <ThemeToggle />
                <span className="text-sm text-text-muted">主題切換</span>
              </div>
            </li>
            {items.map((item, i) => {
              const label = getItemLabel(item)
              return (
                <li key={item.href || `mobile-item-${i}`}>
                  <Link
                    href={item.href}
                    className={`mobile-menu-link ${isActive(item.href) ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
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
                className="mobile-menu-link w-full text-left"
                onClick={() => {
                  router.push('/signup')
                  setMobileMenuOpen(false)
                }}
              >
                {t.nav.cta}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

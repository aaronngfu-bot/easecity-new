'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    [t.footer.groupCompany]: [
      { label: t.footer.linkHome, href: '/' },
      { label: t.footer.linkAbout, href: '/about' },
      { label: t.footer.linkServices, href: '/services' },
      { label: t.footer.linkContact, href: '/about#contact' },
    ],
    [t.footer.groupServices]: [
      { label: t.footer.linkStream, href: '/services' },
      { label: t.footer.linkRemote, href: '/services' },
      { label: t.footer.linkAI, href: '/services#future' },
      { label: t.footer.linkOnline, href: '/services#future' },
    ],
    [t.footer.groupConnect]: [
      { label: t.footer.linkTouch, href: '/about#contact' },
      { label: t.footer.linkPartner, href: '/about#contact' },
      { label: t.footer.linkEnterprise, href: '/about#contact' },
    ],
  }

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-void">
      <div className="absolute inset-0 control-grid opacity-20" />
      <div className="container-max relative z-10 pb-8 pt-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="group mb-4 inline-flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
                <svg viewBox="0 0 36 36" className="w-full h-full">
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
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold tracking-[-0.03em] text-text-primary">easecity</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Control Plane</span>
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
              {t.footer.brandDesc}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-signal/25 bg-signal/10 px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-signal animate-signal-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                {t.footer.statusOnline}
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-text-secondary transition-colors duration-200 hover:text-signal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} easecity. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/legal/privacy" className="text-xs text-text-muted transition-colors hover:text-signal">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-xs text-text-muted transition-colors hover:text-signal">
              Terms of Service
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">v1.0.0</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-signal/60" />
              <span className="text-xs text-text-muted">{t.footer.builtIn}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

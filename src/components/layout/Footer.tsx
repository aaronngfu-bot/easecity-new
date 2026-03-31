'use client'

import Link from 'next/link'
import { HKSkyline } from '@/components/shared/HKSkyline'
import { useLanguage } from '@/context/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    [t.footer.groupCompany]: [
      { label: t.footer.linkHome, href: '/' },
      { label: t.footer.linkAbout, href: '/about' },
      { label: t.footer.linkServices, href: '/services' },
      { label: t.footer.linkContact, href: '/contact' },
    ],
    [t.footer.groupServices]: [
      { label: t.footer.linkStream, href: '/services' },
      { label: t.footer.linkRemote, href: '/services' },
      { label: t.footer.linkAI, href: '/services#future' },
      { label: t.footer.linkOnline, href: '/services#future' },
    ],
    [t.footer.groupConnect]: [
      { label: t.footer.linkTouch, href: '/contact' },
      { label: t.footer.linkPartner, href: '/contact' },
      { label: t.footer.linkEnterprise, href: '/contact' },
    ],
  }

  return (
    <footer className="relative border-t border-border overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 opacity-20 pointer-events-none select-none">
        <HKSkyline />
      </div>

      <div className="container-max relative z-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                  <circle cx="10" cy="10" r="3" fill="white" />
                  <line x1="10" y1="2" x2="10" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="10" y1="13" x2="10" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-text-primary">
                easecity
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              {t.footer.brandDesc}
            </p>
            <div className="mt-6 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-slow" />
              <span className="text-xs text-text-muted font-mono">
                {t.footer.statusOnline}
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                {group}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} easecity. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-muted font-mono">v1.0.0</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60" />
              <span className="text-xs text-text-muted">{t.footer.builtIn}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

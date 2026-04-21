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
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="relative w-9 h-9 rounded-lg glass-panel flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full">
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
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-base text-text-primary">easecity</span>
                <span className="label-mono text-[9px] text-text-muted">STREAM.CONTROL</span>
              </div>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              {t.footer.brandDesc}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-signal animate-signal-pulse" />
              <span className="text-xs text-signal/80 font-mono tracking-wider uppercase">
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
            <Link href="/legal/privacy" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Terms of Service
            </Link>
            <span className="text-xs text-text-muted font-mono tracking-wider">v1.0.0</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-signal/60" />
              <span className="text-xs text-text-muted">{t.footer.builtIn}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

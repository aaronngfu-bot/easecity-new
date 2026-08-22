'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { BrandMark } from '@/components/brand/BrandMark'

export function Footer() {
  const { t } = useLanguage()
  const f = t.footer

  // Four columns: Brand / Services / Company / Legal. Service links resolve to
  // their real detail routes; contact routes stay on the shared contact block.
  const footerLinks = {
    [f.groupServices]: [
      { label: f.linkStream, href: '/services/system-development' },
      { label: f.linkRemote, href: '/services/web-platforms' },
      { label: f.linkAI, href: '/services/ui-ux-design' },
      { label: f.linkOnline, href: '/services/advertising' },
    ],
    [f.groupCompany]: [
      { label: f.linkHome, href: '/' },
      { label: f.linkAbout, href: '/about' },
      { label: f.linkBlog, href: '/blog' },
      { label: f.linkContact, href: '/about#contact' },
    ],
    [f.groupLegal]: [
      { label: f.linkPrivacy, href: '/legal/privacy' },
      { label: f.linkTerms, href: '/legal/terms' },
      { label: f.linkTouch, href: '/about#contact' },
    ],
  }

  return (
    <footer className="relative overflow-hidden border-t border-border bg-bg-void">
      <div className="absolute inset-0 control-grid opacity-20" />
      <div className="container-max relative z-10 pb-8 pt-16">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="group mb-4 inline-flex items-center gap-2.5">
              <BrandMark size={36} />
              <div className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold tracking-[-0.03em] text-text-primary">EaseCity</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">Technologies Limited</span>
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-text-secondary">
              {f.brandDesc}
            </p>
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

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} EaseCity Technologies Limited. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">{f.craftedIn}</p>
        </div>
      </div>
    </footer>
  )
}

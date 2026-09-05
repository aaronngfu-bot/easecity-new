'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Mail, Plus } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { copyKey } from '@/i18n/translations'
import { Scrub } from '@/components/ui/Scrub'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { QuoteModal } from '@/components/contact/QuoteModal'
import { services as catalog } from '@/lib/services'
import type { AllSiteImages } from '@/lib/site-images'
import { QuoteGlyph } from './QuoteGlyph'
import s from './atelier.module.css'

export function ServicesPageClient({ images: allImages }: { images: AllSiteImages }) {
  const { t, language } = useLanguage()
  // Live per-language image set: swaps the moment the toggle flips.
  const images = allImages[language]
  const c = t.servicesPage as Record<string, string>
  const [open, setOpen] = useState<string | null>(catalog[0]?.slug ?? null)
  const [quoteOpen, setQuoteOpen] = useState(false)

  const practices = catalog.map((item) => ({
    slug: item.slug,
    icon: item.icon,
    title: c[item.titleKey],
    body: c[item.bodyKey],
    tags: item.tags[copyKey(language)],
    bullets: item.bullets[copyKey(language)],
  }))

  const stages = [
    [c.p1Title, c.p1Desc],
    [c.p2Title, c.p2Desc],
    [c.p3Title, c.p3Desc],
    [c.p4Title, c.p4Desc],
  ]

  const cases = [
    {
      src: images.servicesCaseEcShare,
      tag: c.case1Tag,
      title: c.case1Title,
      body: c.case1Desc,
      href: '/ec-share',
    },
    {
      src: images.servicesCaseWeb,
      tag: c.case2Tag,
      title: c.case2Title,
      body: c.case2Desc,
      href: '/dashboard',
    },
    {
      src: images.servicesCaseDesign,
      tag: c.case3Tag,
      title: c.case3Title,
      body: c.case3Desc,
      href: '/about',
    },
  ]

  /** Hero contents row: open the practice, then go to it. */
  const openPractice = (slug: string) => {
    setOpen(slug)
    document.getElementById('practices')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const quoteSteps = [
    [c.quoteStep1Title, c.quoteStep1Desc],
    [c.quoteStep2Title, c.quoteStep2Desc],
    [c.quoteStep3Title, c.quoteStep3Desc],
  ]

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={`container-max ${s.heroInner}`}>
          <p className={`${s.enter} ${s.d1} ${s.eyebrow} font-mono`}>{c.heroEyebrow}</p>
          <h1 className={`${s.enter} ${s.d2} ${s.title} font-display`}>
            {c.heroHeading}
            <span className={s.accent}>{c.heroHighlight}</span>
          </h1>
          <div className={s.heroBand}>
            <p className={`${s.enter} ${s.d3} ${s.lede}`}>{c.heroLede}</p>
            <div className={`${s.enter} ${s.d4} ${s.actions}`}>
              <button type="button" onClick={() => setQuoteOpen(true)} className={s.primary}>
                {c.requestQuote}
              </button>
              <Link href="/ec-share" className={s.ghost}>
                {c.case1Title}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div className={`${s.shotEnter} ${s.heroPlate}`}>
          <Image src={images.servicesHero} alt={c.s1Title} fill priority sizes="100vw" />
        </div>
        <div className="container-max">
          <nav className={`${s.enter} ${s.d5} ${s.heroIndex}`} aria-label={c.servicesTitle}>
            {practices.map((p) => (
              <button
                key={p.slug}
                type="button"
                className={s.heroIndexItem}
                onClick={() => openPractice(p.slug)}
              >
                <ServiceIcon icon={p.icon} size={15} />
                <span>{p.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Practices. The left column holds still while the index is worked
          through, so the reader never loses what they are reading about. */}
      <Scrub pace="early">
        <section id="practices" className={`section-padding ${s.anchored}`}>
          <div className="container-max">
            <div className={s.split}>
              <aside className={s.splitAside}>
                <div className={s.sticky}>
                  <h2 className={`${s.scrubbed} ${s.colTitle} font-display`}>{c.servicesTitle}</h2>
                  <p className={`${s.scrubbed} ${s.colSub}`}>{c.servicesSubtitle}</p>
                  <dl className={`${s.scrubbed} ${s.meta}`}>
                    <div className={s.metaRow}>
                      <dt className={`${s.metaKey} font-mono`}>{c.metaTeam}</dt>
                      <dd className={s.metaVal}>{c.metaTeamValue}</dd>
                    </div>
                  </dl>
                </div>
              </aside>

              <div className={s.splitMain}>
                <div className={s.list}>
                  {practices.map((p, i) => {
                    const isOpen = open === p.slug
                    return (
                      <div
                        key={p.slug}
                        className={`${s.scrubbed} ${s.item} ${isOpen ? s.itemOpen : ''}`}
                        style={{ ['--i' as string]: i }}
                      >
                        <button
                          type="button"
                          className={s.itemBtn}
                          aria-expanded={isOpen}
                          aria-controls={`practice-${p.slug}`}
                          onClick={() => setOpen(isOpen ? null : p.slug)}
                        >
                          <span className={s.itemIcon}>
                            <ServiceIcon icon={p.icon} size={18} />
                          </span>
                          <span>
                            <span className={`${s.itemName} font-display`}>{p.title}</span>
                            <span className={s.itemCopy}>{p.body}</span>
                          </span>
                          <Plus size={18} className={s.plus} aria-hidden />
                        </button>

                        <div
                          id={`practice-${p.slug}`}
                          className={`${s.panel} ${isOpen ? s.panelOpen : ''}`}
                        >
                          <div className={s.panelClip}>
                            <div className={s.panelBody}>
                              <ul className={s.bullets}>
                                {p.bullets.map((b) => (
                                  <li key={b} className={s.bullet}>
                                    <span aria-hidden className={s.dash} />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className={s.panelSide}>
                                <div className={s.tags}>
                                  {p.tags.map((tag) => (
                                    <span key={tag} className={`${s.tag} font-mono`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <Link href={`/services/${p.slug}`} className={s.detail}>
                                  {c.viewDetails}
                                  <ArrowUpRight size={15} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Scrub>

      <Scrub pace="early">
        <section className={`section-padding ${s.band}`}>
          <div className="container-max">
            <div className={s.bandHead}>
              <h2 className={`${s.scrubbed} ${s.colTitle} font-display`}>{c.processTitle}</h2>
              <p className={`${s.scrubbed} ${s.colSub}`}>{c.processSubtitle}</p>
            </div>
            <ol className={s.stages}>
              <span aria-hidden className={`${s.scrubbed} ${s.track}`} />
              {stages.map(([title, desc], i) => (
                <li
                  key={title}
                  className={`${s.scrubbed} ${s.stage}`}
                  style={{ ['--i' as string]: i }}
                >
                  <span className={`${s.stageNo} font-mono`}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={`${s.stageName} font-display`}>{title}</h3>
                  <p className={s.stageCopy}>{desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Scrub>

      <Scrub pace="early">
        <section className="section-padding">
          <div className="container-max">
            <div className={s.casesHead}>
              <p className={`${s.scrubbed} ${s.badge} font-mono`}>{c.casesBadge}</p>
              <h2 className={`${s.scrubbed} ${s.colTitle} font-display`}>{c.casesTitle}</h2>
              <p className={`${s.scrubbed} ${s.colSub}`}>{c.casesSubtitle}</p>
            </div>

            <div className={s.cases}>
              <Link
                href={cases[0].href}
                className={`${s.scrubbed} ${s.case} ${s.caseLead}`}
                style={{ ['--i' as string]: 0 }}
              >
                <div className={s.caseShot}>
                  <Image
                    src={cases[0].src}
                    alt={cases[0].title}
                    fill
                    sizes="(max-width: 1023px) 100vw, 55vw"
                  />
                </div>
                <p className={`${s.caseTag} font-mono`}>{cases[0].tag}</p>
                <h3 className={`${s.caseName} font-display`}>{cases[0].title}</h3>
                <p className={s.caseCopy}>{cases[0].body}</p>
                <span className={s.caseLink}>
                  {c.viewDetails}
                  <ArrowRight size={14} />
                </span>
              </Link>

              {/* Only the mirroring case has somewhere to go. The other two are
                  articles, not links: a card that lifts on hover and lands on
                  an unrelated route is worse than one that never invited the
                  click. They come back as links when their write-ups exist. */}
              <div className={s.caseRest}>
                {cases.slice(1).map((cs, i) => (
                  <article
                    key={cs.tag}
                    className={`${s.scrubbed} ${s.case} ${s.caseStatic}`}
                    style={{ ['--i' as string]: i + 1 }}
                  >
                    <div className={s.caseShot}>
                      <Image
                        src={cs.src}
                        alt={cs.title}
                        fill
                        sizes="(max-width: 1023px) 100vw, 40vw"
                      />
                    </div>
                    <p className={`${s.caseTag} font-mono`}>{cs.tag}</p>
                    <h3 className={`${s.caseName} font-display`}>{cs.title}</h3>
                    <p className={s.caseCopy}>{cs.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Scrub>

      <Scrub pace="last">
        <section className="section-padding">
          <div className="container-max">
            <div className={s.closer}>
              <div className={s.closerLeft}>
                <h2 className={`${s.scrubbed} ${s.closerTitle} font-display`}>{c.quoteTitle}</h2>
                <p className={`${s.scrubbed} ${s.closerSub}`}>{c.quoteSubtitle}</p>
                <div className={`${s.scrubbed} ${s.closerActions}`}>
                  <button type="button" onClick={() => setQuoteOpen(true)} className={s.primary}>
                    {c.requestQuote}
                  </button>
                  <a href="mailto:admin@easecity.hk" className={s.mail}>
                    <Mail size={15} />
                    {c.contactEmailHint} admin@easecity.hk
                  </a>
                </div>
              </div>
              <ol className={`${s.scrubbed} ${s.steps} ${s.closerRight}`}>
                {quoteSteps.map(([title, desc], i) => (
                  <li key={title} className={s.step} style={{ ['--i' as string]: i }}>
                    <QuoteGlyph step={i} />
                    <div>
                      <p className={`${s.stepNo} font-mono`}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <h3 className={`${s.stepName} font-display`}>{title}</h3>
                      <p className={s.stepCopy}>{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </Scrub>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { Scrub } from '@/components/ui/Scrub'
import type { SiteImages } from '@/lib/site-images'
import { FeatureGlyph } from './FeatureGlyph'
import { StepGlyph } from './StepGlyph'
import s from './editorial.module.css'

const FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const
const STEPS = ['w1', 'w2', 'w3', 'w4'] as const

export function EcSharePageClient({
  images,
  iconIsPlaceholder,
}: {
  images: SiteImages
  /** The shipped company mark bleeds to its edges and its dark half vanishes on
   *  a dark surface, so it needs the white plate. A real app icon uploaded from
   *  the admin does not, and would be inset inside a white square if it kept
   *  it. */
  iconIsPlaceholder: boolean
}) {
  const { t } = useLanguage()
  const c = t.ecSharePage as Record<string, string>

  /* Home and work, alternating, because the product is the same either way and
     a reader who came for one should meet the other. Order is also the mosaic's
     order: the geometry is carried by position in the grid, so these do not get
     rearranged without looking at the layout. */
  const scenes = [
    { src: images.ecShareSceneDesk, label: c.scene1Title, text: c.scene1Desc },
    { src: images.ecShareSceneTogether, label: c.scene2Title, text: c.scene2Desc },
    { src: images.ecShareSceneQueue, label: c.scene3Title, text: c.scene3Desc },
    { src: images.ecShareGalleryRemote, label: c.scene4Title, text: c.scene4Desc },
    { src: images.ecShareGalleryLab, label: c.scene5Title, text: c.scene5Desc },
    { src: images.ecShareSceneRoom, label: c.scene6Title, text: c.scene6Desc },
  ]

  return (
    <div className={s.page}>
      <div aria-hidden className={s.field} />

      {/* Arrival. Load-driven, because this section is already on screen when
          the route opens and a scroll-scrubbed entrance would start finished. */}
      <section className={s.hero}>
        <span aria-hidden className={s.spill} />
        <div className="container-max">
          <div className={s.top}>
            <div className={s.topLeft}>
              <div className={s.lead}>
                <span
                  aria-hidden
                  className={`${s.enter} ${s.d1} ${s.appIcon} ${
                    iconIsPlaceholder ? s.appIconPlaceholder : ''
                  }`}
                >
                  <Image src={images.ecShareAppIcon} alt="" fill sizes="160px" />
                </span>
                <p className={`${s.enter} ${s.d1} ${s.eyebrow} font-mono`}>{c.heroPlatforms}</p>
                <h1 className={`${s.enter} ${s.d2} ${s.title} font-display`}>
                  {c.heroTitle}
                  <span className={s.accent}>{c.heroHighlight}</span>
                </h1>
              </div>
            </div>
            <div className={s.topRight}>
              <p className={`${s.enter} ${s.d3} ${s.sub}`}>{c.heroSubtitle}</p>
              <div className={`${s.enter} ${s.d4} ${s.ctas}`}>
                <Link href="/signup" className={s.primary}>
                  {c.heroCtaPrimary}
                </Link>
                <Link href="/pricing" className={s.textLink}>
                  {c.heroCtaSecondary}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className={`${s.plateEnter} ${s.heroPlate}`}>
            {/* The plate lives inside `container-max`, capped at 1360px content
                width, and never grows past that — `100vw` told Next.js to fetch
                a full-viewport-wide image on anything wider, which this plate
                can never actually render at. */}
            <Image
              src={images.ecShareHero}
              alt={`${c.heroTitle} ${c.heroHighlight}`}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 1360px"
            />
          </div>

          <dl className={`${s.enter} ${s.d4} ${s.figures}`}>
            {[
              [c.heroStat1, c.heroStat1Value],
              [c.heroStat2, c.heroStat2Value],
              [c.heroStat3, c.heroStat3Value],
            ].map(([k, v]) => (
              <div key={k} className={s.figure}>
                <dd className={`${s.figureVal} font-display`}>{v}</dd>
                <dt className={`${s.figureKey} font-mono`}>{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Capabilities read as an index: diagram, name, argument. */}
      <Scrub pace="early">
        <section className={`section-padding ${s.band}`}>
          <div className="container-max">
            <div className={s.head}>
              <h2 className={`${s.scrubbed} ${s.headTitle} font-display`}>{c.featuresTitle}</h2>
              <p className={`${s.scrubbed} ${s.headSub}`}>{c.featuresSubtitle}</p>
            </div>

            <div className={s.entries}>
              {FEATURES.map((id, i) => (
                <article
                  key={id}
                  className={`${s.scrubbed} ${s.entry}`}
                  style={{ ['--i' as string]: i }}
                >
                  <FeatureGlyph id={id} />
                  <h3 className={`${s.entryName} font-display`}>{c[`${id}Title`]}</h3>
                  <p className={s.entryCopy}>{c[`${id}Desc`]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Scrub>

      {/* The essay sits between the two lists on purpose: the capability index
          and the install sequence are both enumerations, and back to back they
          read as one long inventory. */}
      <Scrub pace="early">
        <section className="section-padding">
          <div className="container-max">
            <div className={s.head}>
              <h2 className={`${s.scrubbed} ${s.headTitle} font-display`}>{c.galleryTitle}</h2>
              <p className={`${s.scrubbed} ${s.headSub}`}>{c.gallerySubtitle}</p>
            </div>

            <div className={s.essay}>
              {scenes.map((p, i) => (
                <figure
                  key={p.label}
                  className={`${s.scrubbed} ${s.piece}`}
                  style={{ ['--i' as string]: i }}
                >
                  {/* Until a photograph exists for the scene, the frame is set
                      from type and carries the name, so the caption below is
                      just the scene. With a photograph the name moves to the
                      caption where it belongs. Either way the cell keeps its
                      shape, so uploading one does not move the mosaic. */}
                  {p.src ? (
                    <div className={`${s.pieceFrame} ${s.pieceShot}`}>
                      <Image
                        src={p.src}
                        alt={p.label}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                    </div>
                  ) : (
                    <div className={`${s.pieceFrame} ${s.piecePlate}`}>
                      <span className={`${s.plateName} font-display`}>{p.label}</span>
                    </div>
                  )}
                  <figcaption className={s.pieceCap}>
                    {p.src && <span className={`${s.pieceLabel} font-display`}>{p.label}</span>}
                    <p className={s.pieceText}>{p.text}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </Scrub>

      {/* Getting started reads last, right before the ask. */}
      <Scrub pace="early">
        <section className={`section-padding ${s.band}`}>
          <div className="container-max">
            <div className={s.head}>
              <h2 className={`${s.scrubbed} ${s.headTitle} font-display`}>{c.workflowTitle}</h2>
              <p className={`${s.scrubbed} ${s.headSub}`}>{c.workflowSubtitle}</p>
            </div>

              {/* Lagged past the last step, so the terminus that closes the
                  line arrives after the stop it follows. */}
              <ol
                className={`${s.scrubbed} ${s.narrative}`}
                style={{ ['--lag' as string]: 0.42 }}
              >
                {STEPS.map((id, i) => (
                  <li
                    key={id}
                    className={`${s.scrubbed} ${s.beat}`}
                    style={{ ['--i' as string]: i }}
                  >
                    <span className={`${s.beatNo} font-mono`} aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <StepGlyph id={id} />
                    <h3 className={`${s.beatName} font-display`}>{c[`${id}Title`]}</h3>
                    <p className={s.beatCopy}>{c[`${id}Desc`]}</p>
                  </li>
                ))}
              </ol>
          </div>
        </section>
      </Scrub>

      <Scrub pace="last">
        <section className={`section-padding ${s.closerSection}`}>
          <div className="container-max">
            <div className={s.closer}>
              <div className={s.closerLeft}>
                <h2 className={`${s.scrubbed} ${s.closerTitle} font-display`}>{c.ctaTitle}</h2>
                <p className={`${s.scrubbed} ${s.closerSub}`}>{c.ctaSubtitle}</p>
              </div>
              <div className={`${s.scrubbed} ${s.closerCta} ${s.closerRight}`}>
                <Link href="/download" className={s.primary}>
                  {c.ctaPrimary}
                </Link>
                <Link href="/about#contact" className={s.textLink}>
                  {c.ctaSecondary}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Scrub>
    </div>
  )
}

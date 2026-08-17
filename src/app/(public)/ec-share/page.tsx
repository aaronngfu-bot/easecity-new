'use client'

import { useLanguage } from '@/context/LanguageContext'
import { CTASection } from '@/components/home/CTASection'
import { ParallaxSection } from '@/components/ui/ParallaxSection'
import { TrustSection } from '@/components/sections/trust-section'
import CoreFeatures from '@/components/CoreFeatures'
import { FeatureSteps } from '@/components/ui/feature-steps'
import { FAQ } from '@/components/FAQ'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { MissionControlHero } from '@/components/hero/MissionControlHero'

export default function EcSharePage() {
  const { t } = useLanguage()

  return (
    <main className="relative min-h-screen">
      <MissionControlHero />

      <div aria-hidden className="pointer-events-none relative -mt-[1px] h-[180px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-[var(--bg-base)]/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_130%_at_50%_0%,var(--signal-soft),transparent_70%)]" />
      </div>

      <div id="learn-more" className="scroll-mt-24">
        <RevealSection>
          <TrustSection />
        </RevealSection>
      </div>

      <RevealSection>
        <CoreFeatures />
      </RevealSection>

      <RevealSection>
        <section id="how-to-use" className="py-24 md:py-32">
          <div className="mx-auto mb-14 max-w-6xl px-4 md:px-6">
            <SectionHeading
              badge="WORKFLOW"
              align="left"
              title={t.homePage.how.title}
              subtitle={t.homePage.how.sub}
            />
          </div>
          <FeatureSteps
            step1img="/images/ec-share-flow-install.jpg"
            step2img="/images/ec-share-screenshot.png"
            step3img="/images/ec-share-screenshot.png"
            step4img="/images/ec-share-screenshot.png"
            alt="EC-Share product workflow"
          />
        </section>
      </RevealSection>

      <RevealSection>
        <FAQ />
      </RevealSection>

      <div className="relative z-10">
        <ParallaxSection speed={0.12}>
          <CTASection />
        </ParallaxSection>
      </div>
    </main>
  )
}

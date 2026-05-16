import { SignalHero } from '@/components/home/SignalHero'
import { CompanyIntro } from '@/components/home/CompanyIntro'
import { CoreServices } from '@/components/home/CoreServices'
import { TechAdvantages } from '@/components/home/TechAdvantages'
import { RoadmapSection } from '@/components/home/RoadmapSection'
import { CTASection } from '@/components/home/CTASection'
import { ParallaxSection } from '@/components/ui/ParallaxSection'
import { TopologyRibbon } from '@/components/home/TopologyRibbon'
import { DeviceSyncShowcase } from '@/components/DeviceSyncShowcase'

export default function HomePage() {
  return (
    <>
      <TopologyRibbon />
      <SignalHero />
      <DeviceSyncShowcase />
      <ParallaxSection speed={0.15}>
        <CompanyIntro />
      </ParallaxSection>
      <CoreServices />
      <ParallaxSection speed={0.1}>
        <TechAdvantages />
      </ParallaxSection>
      <RoadmapSection />
      <ParallaxSection speed={0.12}>
        <CTASection />
      </ParallaxSection>
    </>
  )
}

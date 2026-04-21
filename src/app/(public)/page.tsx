import { Hero } from '@/components/home/Hero'
import { CompanyIntro } from '@/components/home/CompanyIntro'
import { CoreServices } from '@/components/home/CoreServices'
import { TechAdvantages } from '@/components/home/TechAdvantages'
import { RoadmapSection } from '@/components/home/RoadmapSection'
import { CTASection } from '@/components/home/CTASection'
import { ParallaxSection } from '@/components/ui/ParallaxSection'
import { TopologyRibbon } from '@/components/home/TopologyRibbon'

export default function HomePage() {
  return (
    <>
      <TopologyRibbon />
      <Hero />
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

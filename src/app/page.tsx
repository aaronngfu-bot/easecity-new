import { Hero } from '@/components/home/Hero'
import { CompanyIntro } from '@/components/home/CompanyIntro'
import { CoreServices } from '@/components/home/CoreServices'
import { TechAdvantages } from '@/components/home/TechAdvantages'
import { RoadmapSection } from '@/components/home/RoadmapSection'
import { CTASection } from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CompanyIntro />
      <CoreServices />
      <TechAdvantages />
      <RoadmapSection />
      <CTASection />
    </>
  )
}

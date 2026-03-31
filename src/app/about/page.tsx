import type { Metadata } from 'next'
import { Philosophy } from '@/components/about/Philosophy'
import { TechVision } from '@/components/about/TechVision'
import { Expansion } from '@/components/about/Expansion'
import { AboutHero } from '@/components/about/AboutHero'

export const metadata: Metadata = {
  title: 'About',
  description:
    'easecity is a Hong Kong-based technology company building the infrastructure layer for connected systems — starting with stream control, expanding into AI-powered services.',
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Philosophy />
      <TechVision />
      <Expansion />
    </>
  )
}

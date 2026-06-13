import type { Metadata } from 'next'
import { Philosophy } from '@/components/about/Philosophy'
import { TechVision } from '@/components/about/TechVision'
import { AboutHero } from '@/components/about/AboutHero'
import { ContactForm } from '@/components/contact/ContactForm'
import { CompanyInfo } from '@/components/contact/CompanyInfo'
import { ContactHero } from '@/components/contact/ContactHero'

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
      <div id="contact">
        <ContactHero embedded />
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
              <div className="lg:col-span-3">
                <ContactForm />
              </div>
              <div className="lg:col-span-2">
                <CompanyInfo />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

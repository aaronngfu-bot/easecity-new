import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { CompanyInfo } from '@/components/contact/CompanyInfo'
import { ContactHero } from '@/components/contact/ContactHero'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with easecity. Whether you are exploring our services, seeking a partnership, or building the future with us — we want to hear from you.',
}

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
            <div className="lg:col-span-2">
              <CompanyInfo />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

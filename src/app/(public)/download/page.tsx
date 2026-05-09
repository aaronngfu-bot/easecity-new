import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Download EC-Share',
  description:
    'Download EC-Share for Windows. Installer hosting and signed release artifacts are prepared for dl.easecity.hk.',
}

const requirements = [
  'Windows 10 version 2004 or later',
  'Windows 11 supported',
  'x64 machine with 4 GB RAM or more',
  'Android device with USB debugging enabled',
  'ADB-compatible USB cable or device network path',
]

export default function DownloadPage() {
  return (
    <>
      <PageHero
        serial="02"
        sectionCode="DOWNLOAD"
        eyebrow="Windows"
        heading="Download EC-Share"
        headingHighlight="for Windows."
        description="The first EC-Share release targets Windows. The final signed installer will be hosted on dl.easecity.hk once the M1 release channel is ready."
        meta={[
          { label: 'Platform', value: 'Windows x64' },
          { label: 'Channel', value: 'M1 pending' },
          { label: 'Signing', value: 'EV cert planned' },
        ]}
      />

      <section className="section-padding">
        <div className="container-max grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-prominent p-6 md:p-8">
            <p className="label-mono mb-4">Release status</p>
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">
              Installer coming after internal test feedback
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              The web backend is already preparing the account, licensing, and billing surfaces. The public installer link will appear here when the desktop app reaches M1.
            </p>
            <Link href="/signup" className="glass-cta inline-flex items-center justify-center">
              Start trial setup
            </Link>
          </div>

          <div className="glass-panel p-6 md:p-8">
            <p className="label-mono mb-4">System requirements</p>
            <ul className="space-y-3">
              {requirements.map((item) => (
                <li key={item} className="flex gap-3 text-text-secondary">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

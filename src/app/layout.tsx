import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono, Syne } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'easecity — Stream Control Infrastructure',
    template: '%s | easecity',
  },
  description:
    'easecity delivers enterprise-grade stream control infrastructure — enabling a single device to manage, monitor, and orchestrate unlimited remote endpoints with precision and scale.',
  keywords: [
    'easecity',
    'stream control',
    'remote device management',
    'streaming infrastructure',
    'IoT control',
    'tech company',
    'Hong Kong tech',
  ],
  authors: [{ name: 'easecity' }],
  creator: 'easecity',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://easecity.com',
    siteName: 'easecity',
    title: 'easecity — Stream Control Infrastructure',
    description:
      'Enterprise-grade stream control. One hub, unlimited endpoints. Built for the future of connected systems.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'easecity — Stream Control Infrastructure',
    description:
      'Enterprise-grade stream control. One hub, unlimited endpoints.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-base text-text-primary antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <SessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

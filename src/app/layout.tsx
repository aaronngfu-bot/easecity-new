import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono, Syne } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
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
    default: 'easecity — Technology for connected teams',
    template: '%s | easecity',
  },
  description:
    'EaseCity Technologies Limited builds tools and services for connected teams. Our first product, EC-Share, is Android device mirroring for teams.',
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
    url: 'https://easecity.hk',
    siteName: 'easecity',
    title: 'easecity — Technology for connected teams',
    description:
      'Enterprise-grade stream control. One hub, unlimited endpoints. Built for the future of connected systems.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'easecity — Technology for connected teams',
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
      <body className="bg-background text-foreground antialiased selection:bg-signal/20 selection:text-signal">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <SessionProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

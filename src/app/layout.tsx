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
    default: 'EaseCity — Web services, system architecture & AI',
    template: '%s | EaseCity',
  },
  description:
    'EaseCity Technologies Limited is a Hong Kong technology firm building web services, system architecture, and AI solutions. We also ship EC-Share, Android device mirroring for teams.',
  icons: {
    icon: [
      { url: '/images/easecity-favicon.png', type: 'image/png', sizes: '48x48', media: '(prefers-color-scheme: light)' },
      { url: '/images/easecity-favicon-dark.png', type: 'image/png', sizes: '48x48', media: '(prefers-color-scheme: dark)' },
      { url: '/images/easecity-favicon.ico', sizes: 'any' },
    ],
    apple: '/images/easecity-apple-touch-icon.png',
  },
  keywords: [
    'EaseCity',
    'EC-Share',
    'web services',
    'system architecture',
    'AI solutions',
    'Android device mirroring',
    'remote device management',
    'Hong Kong tech company',
  ],
  authors: [{ name: 'EaseCity Technologies Limited' }],
  creator: 'EaseCity',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://easecity.hk',
    siteName: 'EaseCity',
    title: 'EaseCity — Web services, system architecture & AI',
    description:
      'Hong Kong technology firm building web services, system architecture, and AI solutions — and the makers of EC-Share.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EaseCity — Web services, system architecture & AI',
    description:
      'Hong Kong technology firm building web services, system architecture, and AI solutions — and the makers of EC-Share.',
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

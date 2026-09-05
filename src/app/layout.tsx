import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, JetBrains_Mono, Syne } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { type Language, htmlLangFor } from '@/i18n/translations'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: 'EaseCity — Web services, system architecture & AI',
    template: '%s | EaseCity',
  },
  description:
    'EaseCity Technologies Limited is a Hong Kong technology firm building web services, system architecture, and AI solutions. We also ship EC-Share, Android device mirroring for teams.',
  icons: {
    icon: [
      { url: '/images/favicon-clean-48.png', type: 'image/png', sizes: '48x48', media: '(prefers-color-scheme: light)' },
      { url: '/images/favicon-clean-32.png', type: 'image/png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
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
    images: [
      {
        url: 'https://easecity.hk/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EaseCity — Web services, system architecture & AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EaseCity — Web services, system architecture & AI',
    description:
      'Hong Kong technology firm building web services, system architecture, and AI solutions — and the makers of EC-Share.',
    images: ['https://easecity.hk/images/og-image.png'],
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
  // Resolve the initial language server-side from the cookie so the SSR HTML
  // already matches what the client will render — eliminating the hydration
  // mismatch that previously surfaced as a "text content does not match" error
  // and a brief English→Chinese flash on refresh. `zh-CN` is the third
  // language; anything unknown falls back to en.
  let initialLang: Language = 'en'
  try {
    const v = cookies().get('easecity-lang')?.value
    if (v === 'zh' || v === 'zh-CN') initialLang = v
  } catch {
    /* cookies unavailable at build/prerender — default to en */
  }

  return (
    <html
      lang={htmlLangFor(initialLang)}
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
            <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

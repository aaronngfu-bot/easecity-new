import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LanguageProvider } from '@/context/LanguageContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg-base text-text-primary antialiased">
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}

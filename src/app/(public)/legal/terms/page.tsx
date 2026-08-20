import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { TermsContent } from '@/components/legal/TermsContent'

export async function generateMetadata(): Promise<Metadata> {
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
  return {
    title: lang === 'zh' ? '服務條款' : 'Terms of Service',
    description:
      lang === 'zh'
        ? 'easecity 服務條款 — 規範您使用我們的產品與服務平台的協議。'
        : 'easecity Terms of Service — the agreement governing your use of our products and services platform.',
    robots: { index: true, follow: true },
  }
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="container-max max-w-3xl">
        <TermsContent />
      </div>
    </div>
  )
}
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PrivacyContent } from '@/components/legal/PrivacyContent'

export async function generateMetadata(): Promise<Metadata> {
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
  return {
    title: lang === 'zh' ? '隱私權政策' : 'Privacy Policy',
    description:
      lang === 'zh'
        ? 'easecity 隱私權政策 — 我們如何收集、使用與保護您的個人資料。'
        : 'easecity Privacy Policy — how we collect, use, and protect your personal data.',
    robots: { index: true, follow: true },
  }
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-2 pb-24">
      <div className="container-max max-w-3xl">
        <PrivacyContent />
      </div>
    </div>
  )
}
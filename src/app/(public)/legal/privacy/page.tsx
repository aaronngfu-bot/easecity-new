import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { PrivacyContent } from '@/components/legal/PrivacyContent'

export async function generateMetadata(): Promise<Metadata> {
  const raw = cookies().get('easecity-lang')?.value
  const lang: 'en' | 'zh' | 'zh-CN' = raw === 'zh' || raw === 'zh-CN' ? raw : 'en'
  return {
    title: lang === 'zh-CN' ? '隐私政策' : lang === 'zh' ? '隱私權政策' : 'Privacy Policy',
    description:
      lang === 'zh'
        ? 'EaseCity 隐私政策 — 我们如何收集、使用与保护您的个人资料。'
        : 'EaseCity Privacy Policy — how we collect, use, and protect your personal data.',
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
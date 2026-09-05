import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { TermsContent } from '@/components/legal/TermsContent'

export async function generateMetadata(): Promise<Metadata> {
  const raw = cookies().get('easecity-lang')?.value
  const lang: 'en' | 'zh' | 'zh-CN' = raw === 'zh' || raw === 'zh-CN' ? raw : 'en'
  return {
    title: lang === 'zh-CN' ? '服务条款' : lang === 'zh' ? '服務條款' : 'Terms of Service',
    description:
      lang === 'zh'
        ? 'easecity 服务条款 — 规范您使用我们的产品与服务平台的协议。'
        : 'easecity Terms of Service — the agreement governing your use of our products and services platform.',
    robots: { index: true, follow: true },
  }
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-2 pb-24">
      <div className="container-max max-w-3xl">
        <TermsContent />
      </div>
    </div>
  )
}
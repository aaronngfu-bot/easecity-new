'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { MacbookScroll } from '@/components/ui/macbook-scroll'
import CyberneticBentoGrid from '@/components/ui/cybernetic-bento-grid'
import { ComparisonTable } from '@/components/ui/comparison-table'
import type { FeatureRow, Product } from '@/components/ui/comparison-table'

const LightRays = dynamic(
  () => import('@/components/LightRays/LightRays'),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
  }
)

const comparisonProducts: Product[] = [
  { id: 'ecshare', name: 'EC-Share', logo: 'EC', isPrimary: true },
  { id: 'vysor', name: 'Vysor' },
  { id: 'scrcpy', name: 'scrcpy' },
  { id: 'teamviewer', name: 'TeamViewer' },
]

const comparisonRows: FeatureRow[] = [
  {
    feature: '多裝置 Grid',
    description: '同時監看多台 Android 裝置',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'no', teamviewer: 'no' },
  },
  {
    feature: '低延遲鏡像',
    description: '即時畫面串流與操作回饋',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'yes', teamviewer: 'partial' },
  },
  {
    feature: '鍵鼠控制',
    description: '用桌面鍵盤滑鼠操作手機',
    support: { ecshare: 'yes', vysor: 'yes', scrcpy: 'yes', teamviewer: 'partial' },
  },
  {
    feature: 'Focus 模式',
    description: '從多裝置切換到單機深度操作',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'partial', teamviewer: 'partial' },
  },
  {
    feature: '截圖錄影',
    description: '保存 QA 證據與客服交接資料',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'partial', teamviewer: 'partial' },
  },
  {
    feature: '團隊分享',
    description: '分享觀看者與操作者權限',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'no', teamviewer: 'yes' },
  },
  {
    feature: '權限管理',
    description: '座位、角色與企業審計工作流',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'no', teamviewer: 'yes' },
  },
  {
    feature: 'LAN / 離線',
    description: '本地鏡像與離線寬限工作流',
    support: { ecshare: 'yes', vysor: 'partial', scrcpy: 'yes', teamviewer: 'partial' },
  },
]

export default function ProductPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-black">
      <section id="macbook-section" className="relative w-full overflow-hidden bg-black pt-28 md:pt-32">
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1}
            lightSpread={0.6}
            rayLength={2.5}
            pulsating={false}
            fadeDistance={1.2}
            saturation={1.0}
            followMouse={true}
            mouseInfluence={0.15}
            noiseAmount={0.05}
            distortion={0.02}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-black/60" />
        <div className="relative z-20">
          <MacbookScroll
            title={
              <span className="text-text-primary">
                EC-Share 讓你在一台桌面電腦上鏡像並控制多部 Android
                裝置。即時查看每個手機畫面、操作指定裝置，並讓 QA、客服與裝置團隊保持同步。
              </span>
            }
            src="/images/ec-share-screenshot.png"
            showGradient={true}
          />
        </div>
      </section>

      <CyberneticBentoGrid />

      <ComparisonTable
        eyebrow="COMPARISON"
        title="EC-Share vs. 其他工具"
        subtitle="為什麼團隊選擇 EC-Share？"
        products={comparisonProducts}
        rows={comparisonRows}
      />

      <div className="mx-auto max-w-6xl px-6 py-28 md:py-32">
        <h1 className="text-center font-display text-4xl font-bold tracking-[-0.04em] text-text-primary md:text-5xl">
          {t.product.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-text-secondary">
          {t.product.subtitle}
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Link
            href="/pricing"
            className="group block rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-white/30 hover:bg-white/10"
          >
            <h2 className="mb-3 text-2xl font-semibold text-text-primary">
              {t.product.pricing.title}
            </h2>
            <p className="mb-4 text-text-secondary">
              {t.product.pricing.desc}
            </p>
            <span className="inline-block text-sm text-signal transition group-hover:translate-x-1">
              {t.product.pricing.cta} →
            </span>
          </Link>

          <Link
            href="/download"
            className="group block rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-white/30 hover:bg-white/10"
          >
            <h2 className="mb-3 text-2xl font-semibold text-text-primary">
              {t.product.download.title}
            </h2>
            <p className="mb-4 text-text-secondary">
              {t.product.download.desc}
            </p>
            <span className="inline-block text-sm text-signal transition group-hover:translate-x-1">
              {t.product.download.cta} →
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}

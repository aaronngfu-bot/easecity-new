'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ArrowDown } from 'lucide-react'
import { CTASection } from '@/components/home/CTASection'
import { ParallaxSection } from '@/components/ui/ParallaxSection'
import { MacbookScroll } from '@/components/ui/macbook-scroll'

const Hyperspeed = dynamic(
  () => import('@/components/Hyperspeed/Hyperspeed'),
  { ssr: false }
)

const LightRays = dynamic(
  () => import('@/components/LightRays/LightRays'),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
  }
)

export default function HomePage() {
  const scrollToMacbook = () => {
    document.getElementById('macbook-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const hyperspeedOptions = useMemo(
    () => ({
      onSpeedUp: () => {},
      onSlowDown: () => {},
      distortion: 'turbulentDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [12, 80],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: {
        roadColor: 0x080808,
        islandColor: 0x0a0a0a,
        background: 0x000000,
        shoulderLines: 0xffffff,
        brokenLines: 0xffffff,
        leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
        rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
        sticks: 0x03b3c3,
      },
    }),
    []
  )

  return (
    <main className="relative min-h-screen bg-black">
      <section className="relative h-screen overflow-hidden bg-black">
        <div className="absolute inset-0">
          <Hyperspeed effectOptions={hyperspeedOptions} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.54)_58%,rgba(0,0,0,0.92)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/75 to-transparent" />

        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-signal/80">
            Hyperspeed Interface
          </p>
          <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-transparent md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-r from-white via-signal to-accent-purple bg-clip-text">
              進入未來
            </span>
            <span className="mx-3 hidden text-text-muted md:inline">/</span>
            <span className="block bg-gradient-to-r from-accent-purple via-signal to-white bg-clip-text md:inline">
              FUTURE AHEAD
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            以高速視覺、即時串流與智慧控制，打造面向下一代數位體驗的入口。
          </p>
          <button
            type="button"
            onClick={scrollToMacbook}
            className="pointer-events-auto mt-10 inline-flex items-center gap-3 rounded-full border border-signal/40 bg-signal px-6 py-3 text-sm font-semibold text-[#03100f] shadow-glow-signal-sm transition hover:bg-signal-light hover:shadow-glow-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            探索更多
            <ArrowDown size={17} />
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-text-muted">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]">Scroll</span>
          <span className="h-10 w-px overflow-hidden bg-white/10">
            <span className="block h-4 w-px animate-bounce bg-signal" />
          </span>
        </div>
      </section>

      <div className="relative z-10 bg-black">
        <section id="macbook-section" className="relative w-full overflow-hidden bg-black">
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
        <ParallaxSection speed={0.12}>
          <CTASection />
        </ParallaxSection>
      </div>
    </main>
  )
}

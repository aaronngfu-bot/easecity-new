'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useMotionEnabled } from '@/lib/motion-context'
import { Magnetic } from '@/components/ui/MagneticButton'
import { cn } from '@/lib/utils'

/* ───────────────────────── Device wall data ───────────────────────── */

interface FrameSpec {
  id: string
  kind: 'log' | 'eq'
  /** Entrance stagger order (center-out) — purely a load sequence. */
  order: number
  /** Activity loop duration (s) — varied per frame to avoid mechanical feel. */
  dur: number
  /** Grid column (l/c/r) — picks the fake-thickness direction at lg+. */
  col: 'l' | 'c' | 'r'
  /** Currently being operated from EC-Share (multi-select: two at once). */
  control?: boolean
  purple?: boolean
  /** Responsive visibility + desktop stagger offset. */
  className: string
}

/*
 * 3×3 grid, row-major. DV-05 and DV-07 are both "in control" (solid teal
 * frame, equal prominence) — devices have no sync relationship with each
 * other; each one just heartbeats its own EC-Share connection. On <lg only
 * the middle row (+ DV-07 from sm) renders as a flat horizontal strip.
 */
/*
 * Stagger offsets vs row gap（實際數值，唔好靠估）：
 * 垂直方向最大相對靠近量 = 上格向下 offset + 下格向上 offset。
 * 最差組合係右列 r0-r1：DV-03 (+18) 對 DV-06 (-4) → 22px。
 * row gap 需要 ≥ 22 + 5（側面厚度影）+ 1（心跳閃框 -inset-px）
 * + 8（buffer）= 36px → lg:gap-y-9。
 * 水平方向 offset 全部係 0 → col gap ≥ 0 + 5 + 1 + 8 = 14px →
 * 現有 16px（lg:gap-x-4）已夠。
 * Idle float 係成個 wall 一齊郁、mouse parallax 不存在（已 grep 證實），
 * 兩者對 frame 之間相對距離貢獻 = 0。
 */
const FRAMES: FrameSpec[] = [
  { id: 'DV-01', kind: 'log', order: 5, dur: 5.2, col: 'l', className: 'hidden lg:block lg:translate-y-1.5' },
  { id: 'DV-02', kind: 'eq', order: 1, dur: 1.15, col: 'c', className: 'hidden lg:block lg:-translate-y-2.5' },
  { id: 'DV-03', kind: 'log', order: 6, dur: 4.1, col: 'r', className: 'hidden lg:block lg:translate-y-[18px]' },
  { id: 'DV-04', kind: 'eq', order: 2, dur: 1.4, col: 'l', purple: true, className: 'lg:-translate-y-1.5' },
  { id: 'DV-05', kind: 'log', order: 0, dur: 5.8, col: 'c', control: true, className: 'lg:translate-y-1' },
  { id: 'DV-06', kind: 'log', order: 3, dur: 3.6, col: 'r', className: 'lg:-translate-y-1' },
  { id: 'DV-07', kind: 'eq', order: 7, dur: 0.95, col: 'l', control: true, className: 'hidden sm:block lg:translate-y-2.5' },
  { id: 'DV-08', kind: 'log', order: 4, dur: 4.7, col: 'c', purple: true, className: 'hidden lg:block lg:-translate-y-1.5' },
  { id: 'DV-09', kind: 'eq', order: 8, dur: 1.25, col: 'r', className: 'hidden lg:block lg:translate-y-2' },
]

/** Bar widths (%) for fake log lines — rotated per frame for variety. */
const LOG_WIDTHS = [88, 52, 70, 40, 92, 60, 76, 46, 64, 82, 56, 72, 38, 86, 58, 68]

/** Per-bar shape of the activity-monitor (eq) animation. */
const EQ_BARS = [
  { min: 0.2, max: 0.85, durMul: 1.0, delay: 0 },
  { min: 0.35, max: 1, durMul: 1.18, delay: 0.12 },
  { min: 0.25, max: 0.7, durMul: 0.86, delay: 0.3 },
  { min: 0.4, max: 0.95, durMul: 1.32, delay: 0.05 },
  { min: 0.2, max: 0.75, durMul: 1.1, delay: 0.22 },
  { min: 0.3, max: 1, durMul: 0.95, delay: 0.4 },
]

/** Fake telemetry pools — cycled by the sync tick so the readout "updates". */
const LATENCIES = [38, 41, 37, 43, 39, 36, 42, 40]
const DEVICE_COUNTS = [247, 246, 248, 247, 249, 245, 248, 246]

const EASE = [0.22, 1, 0.36, 1] as const

/* ───────────────────────── Small pieces ───────────────────────── */

function ReadoutValue({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.25, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="tabular inline-block text-foreground/80"
    >
      {value}
    </motion.span>
  )
}

interface DeviceFrameProps {
  frame: FrameSpec
  reduce: boolean
  entrance: Variants
  controlLabel: string
  syncedLabel: string
}

function DeviceFrame({ frame, reduce, entrance, controlLabel, syncedLabel }: DeviceFrameProps) {
  const { control, purple, kind, dur, order, id, col } = frame

  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (reduce) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        setPulse((p) => p + 1)
        schedule(3000 + Math.random() * 3000)
      }, delay)
    }
    schedule(1800 + Math.random() * 4200)
    return () => clearTimeout(timer)
  }, [reduce])

  const accentBar = purple
    ? 'bg-accent-purple/65'
    : control
      ? 'bg-signal-deep/70 dark:bg-signal/80'
      : 'bg-signal-deep/60 dark:bg-signal/70'
  const widths = [...LOG_WIDTHS.slice((order * 3) % 16), ...LOG_WIDTHS.slice(0, (order * 3) % 16)]

  const btnColor = control ? 'bg-signal-deep/60 dark:bg-signal/50' : 'bg-black/25 dark:bg-white/20'

  return (
    <div className={cn('relative min-w-0 max-w-[132px] flex-1 lg:max-w-none', frame.className)}>
      <motion.div
        variants={entrance}
        custom={order}
        initial="hidden"
        animate="show"
        className={cn(
          'frame-depth relative aspect-[9/19] w-full rounded-3xl',
          col === 'l' && 'frame-depth-l',
          col === 'r' && 'frame-depth-r',
          control
            ? 'frame-depth-control border-2 border-signal-deep bg-white dark:border-signal dark:bg-[#161c1c]'
            : 'border border-black/10 bg-white dark:border-white/[0.14] dark:bg-[#161c1c]'
        )}
      >
        {/* side buttons */}
        <span className={cn('absolute -right-[2px] top-[24%] z-[1] h-8 w-[2px] rounded-r-sm', btnColor)} />
        <span className={cn('absolute -left-[2px] top-[17%] z-[1] h-5 w-[2px] rounded-l-sm', btnColor)} />
        <span className={cn('absolute -left-[2px] top-[28%] z-[1] h-5 w-[2px] rounded-l-sm', btnColor)} />

        {/* inner bezel */}
        <div className="pointer-events-none absolute inset-[3px] z-[1] rounded-[1.35rem] ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.05]" />

        {/* punch-hole camera */}
        <span className="absolute left-1/2 top-2 z-[5] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black/80 ring-1 ring-black/15 dark:bg-black dark:ring-white/10" />

        {/* status row */}
        <div className="absolute inset-x-1.5 top-1.5 z-[2] flex items-center justify-between">
          {control ? (
            <span className="rounded-sm bg-signal-deep px-1 py-px font-mono text-[10px] font-semibold tracking-[0.12em] text-white dark:bg-signal dark:text-[#03100f]">
              {controlLabel}
            </span>
          ) : (
            <span className="font-mono text-[7px] tracking-[0.18em] text-black/35 dark:text-white/30">
              {id}
            </span>
          )}
          <span
            className={cn(
              'h-1 w-1 rounded-full',
              control ? 'bg-signal-deep dark:bg-signal' : 'bg-black/20 dark:bg-white/20'
            )}
          />
        </div>

        {/* fake activity */}
        {kind === 'log' ? (
          <div className="absolute inset-0 overflow-hidden rounded-3xl px-2 pb-2 pt-6">
            <div
              className="hero-log-scroll flex flex-col"
              style={reduce ? undefined : { animation: `heroLogScroll ${dur}s linear infinite` }}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="flex flex-col gap-[7px] pb-[7px]">
                  {widths.map((w, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-[3px] rounded-full',
                        i % 5 === 2 ? accentBar : 'bg-black/15 dark:bg-white/[0.14]'
                      )}
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-2 bottom-2 top-1/2 flex items-end gap-[3px]">
            {EQ_BARS.map((b, i) => (
              <div
                key={i}
                className={cn('hero-eq-bar h-full flex-1 origin-bottom rounded-[2px]', accentBar)}
                style={
                  reduce
                    ? ({ transform: `scaleY(${b.max * 0.7})` } as CSSProperties)
                    : ({
                        animation: `heroEqBar ${(dur * b.durMul).toFixed(2)}s ease-in-out ${b.delay}s infinite`,
                        '--eq-min': b.min,
                        '--eq-max': b.max,
                      } as CSSProperties)
                }
              />
            ))}
          </div>
        )}

        {/* sync heartbeat */}
        {pulse > 0 && (
          <>
            <motion.div
              key={`flash-${pulse}`}
              className="pointer-events-none absolute -inset-px z-[3] rounded-3xl border border-signal-deep/50 dark:border-signal/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.1, times: [0, 0.2, 1], ease: 'easeOut' }}
            />
            <motion.span
              key={`badge-${pulse}`}
              className="absolute right-1 top-4 z-[3] rounded border border-signal-deep/50 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold tracking-wide text-signal-deep shadow-sm dark:border-signal/50 dark:bg-[#0a1316] dark:text-signal"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -2] }}
              transition={{ duration: 2.4, times: [0, 0.08, 0.78, 1] }}
            >
              {syncedLabel}
            </motion.span>
          </>
        )}
      </motion.div>
    </div>
  )
}

/* ───────────────────────── Hero ───────────────────────── */

export function MissionControlHero() {
  const { t } = useLanguage()
  const hero = t.homePage.hero
  const { motionEnabled } = useMotionEnabled()
  const shouldReduce = useReducedMotion() || !motionEnabled
  const reduce = !!shouldReduce
  const [tick, setTick] = useState(0)

  /* Telemetry readout refresh — starts only after the entrance has finished. */
  useEffect(() => {
    if (reduce) return
    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(() => {
      setTick(1)
      interval = setInterval(() => setTick((v) => v + 1), 4000)
    }, 2100)
    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [reduce])

  const scrollToLearnMore = () => {
    document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })
  }

  const contentContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.05 } },
  }
  const contentItem: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }
  const frameEntrance: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }
    : {
        hidden: { opacity: 0, scale: 0.96 },
        show: (order: number) => ({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.5, ease: EASE, delay: 0.45 + order * 0.06 },
        }),
      }

  /* Fake telemetry, nudged on every readout tick. */
  const latency = LATENCIES[tick % LATENCIES.length]
  const deviceCount = DEVICE_COUNTS[tick % DEVICE_COUNTS.length]

  /* Headline with one highlighted keyword + hand-drawn underline. */
  const hlIndex = hero.headlineHighlight ? hero.headline.indexOf(hero.headlineHighlight) : -1
  const headline =
    hlIndex === -1 ? (
      hero.headline
    ) : (
      <>
        {hero.headline.slice(0, hlIndex)}
        <span className="relative inline text-signal-deep dark:text-signal md:whitespace-nowrap">
          {hero.headlineHighlight}
          <svg
            aria-hidden
            viewBox="0 0 200 9"
            preserveAspectRatio="none"
            className="absolute -bottom-[0.1em] left-0 h-[0.13em] w-full overflow-visible"
          >
            {reduce ? (
              <path
                d="M3 6.5C40 2.5 120 2 197 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                className="opacity-80"
              />
            ) : (
              <motion.path
                d="M3 6.5C40 2.5 120 2 197 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                className="opacity-80"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
              />
            )}
          </svg>
        </span>
        {hero.headline.slice(hlIndex + hero.headlineHighlight.length)}
      </>
    )

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#f5f8f8] dark:bg-[#030506]">
      {/* blueprint grid — 48px, 1px lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(7,16,15,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(7,16,15,0.05)_1px,transparent_1px)] bg-[size:48px_48px] dark:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] dark:block"
      />
      {/* corner crop marks */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-5 top-20 h-6 w-6 border-l border-t border-black/30 dark:border-white/25" />
        <span className="absolute right-5 top-20 h-6 w-6 border-r border-t border-black/30 dark:border-white/25" />
        <span className="absolute bottom-16 left-5 h-6 w-6 border-b border-l border-black/30 dark:border-white/25" />
        <span className="absolute bottom-16 right-5 h-6 w-6 border-b border-r border-black/30 dark:border-white/25" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-14 px-6 pb-16 pt-28 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:px-12 lg:py-10">
        {/* ── Left: content ── */}
        <motion.div
          variants={contentContainer}
          initial="hidden"
          animate="show"
          className="flex min-w-0 flex-col items-start lg:flex-1"
        >
          <motion.p
            variants={contentItem}
            className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.3em] text-foreground/70"
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full bg-signal-deep dark:bg-signal',
                !reduce && 'animate-pulse'
              )}
            />
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={contentItem}
            className="mt-6 whitespace-normal font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:whitespace-pre-line lg:text-[3.25rem] xl:text-[4.25rem]"
          >
            {headline}
          </motion.h1>

          <motion.p variants={contentItem} className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            {hero.sub}
          </motion.p>

          <motion.div variants={contentItem} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Magnetic>
              <Link
                href="/pricing"
                className="btn-sheen inline-flex items-center justify-center rounded-full bg-signal px-7 py-3 text-sm font-semibold text-[#03100f] shadow-glow-signal-sm transition hover:bg-signal-light hover:shadow-glow-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
              >
                {hero.ctaTrial}
              </Link>
            </Magnetic>
            <button
              type="button"
              onClick={scrollToLearnMore}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 px-6 py-3 font-mono text-sm text-foreground transition hover:border-signal-deep/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:border-signal/60 dark:focus-visible:ring-offset-black"
            >
              {hero.ctaExplore}
              <ArrowDown size={15} aria-hidden />
            </button>
          </motion.div>

          {/* fake telemetry readout */}
          <motion.p
            variants={contentItem}
            aria-hidden
            className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
          >
            <span>
              {hero.readoutLatency} <ReadoutValue value={`${latency}MS`} />
            </span>
            <span>·</span>
            <span>
              {hero.readoutDevices} <ReadoutValue value={String(deviceCount)} />
            </span>
            <span>·</span>
            <span>
              {hero.readoutUptime} <ReadoutValue value="99.98%" />
            </span>
          </motion.p>
        </motion.div>

        {/* ── Right: device wall ── */}
        <div aria-hidden className="lg:shrink-0">
          <motion.div
            animate={reduce ? undefined : { y: [6, -6] }}
            transition={reduce ? undefined : { duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            className="mx-auto w-full max-w-lg lg:w-[min(39vh,470px)] lg:max-w-none"
          >
            <div className="lg:[transform:perspective(1200px)_rotateY(-10deg)_rotateX(4deg)]">
              <div className="flex justify-center gap-3 lg:grid lg:grid-cols-3 lg:gap-x-4 lg:gap-y-9">
                {FRAMES.map((frame) => (
                  <DeviceFrame
                    key={frame.id}
                    frame={frame}
                    reduce={reduce}
                    entrance={frameEntrance}
                    controlLabel={hero.deviceControl}
                    syncedLabel={hero.deviceSynced}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom: event ticker ── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 1.5 }}
        className="relative z-10 flex h-10 items-center overflow-hidden border-t border-black/[0.07] font-mono text-[10px] uppercase tracking-wider text-muted-foreground dark:border-white/[0.06]"
      >
        <span className="relative z-10 flex h-full shrink-0 items-center border-r border-black/[0.08] bg-[#eaf0f0] pl-6 pr-4 text-foreground/70 dark:border-white/[0.08] dark:bg-[#0a1012]">
          {hero.tickerLabel}&nbsp;▸
        </span>
        <div className={cn('flex w-max', !reduce && 'animate-ticker')}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-12 pl-12">
              {hero.tickerEvents.map((event, i) => (
                <span key={i} className="whitespace-nowrap">
                  {event.pre}
                  {event.hl && <span className="text-signal-deep dark:text-signal">{event.hl}</span>}
                  {event.post}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

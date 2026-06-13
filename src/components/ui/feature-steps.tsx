"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/context/LanguageContext"

interface FeatureStepsProps {
  step1img: string
  step2img: string
  step3img: string
  step4img: string
  alt?: string
}

const AUTO_ADVANCE_MS = 5000

export function FeatureSteps({
  step1img,
  step2img,
  step3img,
  step4img,
  alt = "EC-Share 使用流程",
}: FeatureStepsProps) {
  const { t } = useLanguage()
  const how = t.homePage.how

  const steps = [
    { id: "1", name: how.step1Name, title: how.step1Title, description: how.step1Desc },
    { id: "2", name: how.step2Name, title: how.step2Title, description: how.step2Desc },
    { id: "3", name: how.step3Name, title: how.step3Title, description: how.step3Desc },
    { id: "4", name: how.step4Name, title: how.step4Title, description: how.step4Desc },
  ]

  const images = [step1img, step2img, step3img, step4img]

  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [inView, setInView] = useState(false)
  // 自動輪播：手動點擊或 prefers-reduced-motion 後停用
  const [autoEnabled, setAutoEnabled] = useState(true)

  const desktopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoEnabled(false)
    }
  }, [])

  useEffect(() => {
    const el = desktopRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const playing = autoEnabled && inView && !hovered

  useEffect(() => {
    if (!playing) return
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % steps.length),
      AUTO_ADVANCE_MS
    )
    return () => clearInterval(id)
  }, [playing, steps.length])

  const selectStep = (i: number) => {
    setCurrent(i)
    setAutoEnabled(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">

      {/* ── Desktop: left-right two columns ── */}
      <div
        ref={desktopRef}
        className="hidden md:flex md:items-start md:gap-14"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* Left column – sticky step list */}
        <div className="w-[42%] shrink-0 sticky top-[120px]">
          <div className="flex flex-col gap-2">
            {steps.map((step, i) => (
              <button
                key={step.id}
                type="button"
                onClick={() => selectStep(i)}
                aria-current={i === current ? "step" : undefined}
                className={[
                  "group relative w-full overflow-hidden text-left rounded-lg p-4 transition-all duration-300",
                  "ring-1 ring-border",
                  "border-l-[3px]",
                  i === current
                    ? "border-l-signal bg-signal/10"
                    : "border-l-transparent opacity-65 hover:opacity-80 hover:bg-card",
                ].join(" ")}
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                  {step.name}
                </p>
                <h3 className="mb-1.5 font-display text-lg font-bold text-foreground leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
                {/* autoplay progress — restarts each cycle, hides once autoplay is off */}
                {i === current && playing && (
                  <span
                    key={`progress-${current}`}
                    aria-hidden="true"
                    className="step-progress absolute bottom-0 left-0"
                    style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right column – fading image */}
        <div className="relative flex-1">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card aspect-video min-h-[320px]">
            {images.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={src}
                alt={`${alt} – ${steps[i].title}`}
                className={[
                  "absolute inset-0 h-full w-full object-cover",
                  "transition-opacity duration-500",
                  i === current
                    ? "opacity-100 ken-burns"
                    : "opacity-0 pointer-events-none",
                ].join(" ")}
                loading="lazy"
              />
            ))}
          </div>
          {/* mono step counter */}
          <p className="mt-3 text-right font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground tabular">
            {String(current + 1).padStart(2, "0")}
            <span className="text-muted-foreground/50"> / {String(steps.length).padStart(2, "0")}</span>
          </p>
        </div>
      </div>

      {/* ── Mobile: stacked, all steps fully expanded ── */}
      <div className="flex flex-col gap-8 md:hidden">
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col gap-4">
            <div className="rounded-r-xl border-l-[3px] border-signal bg-signal/10 px-5 py-4">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
                {step.name}
              </p>
              <h3 className="mb-1.5 font-display text-lg font-bold text-foreground leading-snug">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[i]}
                alt={`${alt} – ${step.title}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

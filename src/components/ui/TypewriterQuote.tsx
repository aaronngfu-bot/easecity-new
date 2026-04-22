'use client'

import { useEffect, useRef, useState } from 'react'

interface TypewriterQuoteProps {
  text: string
  /** Ms per character. Default 18. */
  speed?: number
  /** Delay before starting, in ms. */
  delay?: number
  className?: string
  /** If true, starts immediately; otherwise IntersectionObserver triggers on view. */
  immediate?: boolean
}

/**
 * Types out a string character by character when it scrolls into view
 * (or immediately if `immediate`). Shows a blinking caret while typing.
 *
 * Respects `prefers-reduced-motion` — skips the animation and shows
 * the full text instantly.
 */
export function TypewriterQuote({
  text,
  speed = 18,
  delay = 200,
  className,
  immediate = false,
}: TypewriterQuoteProps) {
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  // Respect reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text.length)
      setDone(true)
      setStarted(true)
    }
  }, [text])

  // Intersection trigger
  useEffect(() => {
    if (immediate) {
      setStarted(true)
      return
    }
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            setStarted(true)
            obs.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [immediate])

  // Typing effect
  useEffect(() => {
    if (!started || done) return
    let i = shown
    const startDelay = setTimeout(() => {
      const iv = setInterval(() => {
        i += 1
        setShown(i)
        if (i >= text.length) {
          clearInterval(iv)
          setDone(true)
        }
      }, speed)
      // cleanup on unmount
      return () => clearInterval(iv)
    }, shown === 0 ? delay : 0)
    return () => clearTimeout(startDelay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  return (
    <p ref={ref} className={className}>
      {text.slice(0, shown)}
      {!done && started && <span className="text-signal animate-blink">▌</span>}
    </p>
  )
}

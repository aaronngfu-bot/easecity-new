'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * CinematicSkyline — the "嘩 太酷了" hero-scale moment.
 *
 * A widescreen, architect-blueprint rendering of the Hong Kong skyline
 * viewed across Victoria Harbour. Silver / graphite monochrome with
 * THREE live data routes arcing between named landmarks — the only
 * green on the canvas.
 *
 * Composition (back to front):
 *   1. Sky — deep graphite gradient + a single moon + two faint stars
 *   2. Far ridge — Lantau mountain silhouette (distant parallax)
 *   3. Harbour — dashed reflection rules
 *   4. Skyline — two sides (Kowloon / HK Island), detailed roofline
 *   5. Landmark labels — thin leader lines + monospaced annotations
 *   6. Live routes — three curved arcs with traveling signal packets
 *   7. Scan line — one slow vertical sweep (radar feel)
 *
 * Motion:
 *   - Scroll-driven parallax on far ridge vs skyline (depth)
 *   - Scan line loops 18s
 *   - Signal packets 6-11s per arc, offset so they never sync
 *
 * Usage:
 *   <CinematicSkyline />
 *   // optional: `variant="compact"` to clip upper sky and use
 *   // only the lower 40% (used in sections below the fold)
 */
export function CinematicSkyline({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Far ridge drifts slower than skyline (parallax)
  const ridgeY = useTransform(scrollYProgress, [0, 1], [0, -30])
  const skyY = useTransform(scrollYProgress, [0, 1], [0, -10])
  const moonY = useTransform(scrollYProgress, [0, 1], [0, -40])

  const height = variant === 'compact' ? 'h-[40vh]' : 'h-[70vh] md:h-[82vh]'

  return (
    <div
      ref={ref}
      className={`relative w-full ${height} overflow-hidden ambient-motion pointer-events-none select-none`}
      aria-hidden="true"
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #05060a 0%, #07080c 45%, #0a0a10 70%, #09090b 100%)',
        }}
      />

      {/* Faint starfield */}
      <motion.div className="absolute inset-0" style={{ y: skyY }}>
        <StarField />
      </motion.div>

      {/* Moon — single soft white disc with faint ring */}
      <motion.div
        className="absolute"
        style={{
          right: '12%',
          top: variant === 'compact' ? '-10%' : '14%',
          y: moonY,
        }}
      >
        <Moon />
      </motion.div>

      {/* Far mountain ridge — parallax, slower */}
      <motion.svg
        viewBox="0 0 1920 140"
        preserveAspectRatio="xMidYMax slice"
        className="absolute left-0 right-0"
        style={{
          bottom: '28%',
          width: '100%',
          height: '18%',
          y: ridgeY,
        }}
      >
        <path
          d={`
            M 0 140 L 0 92
            L 120 78 L 220 96 L 340 72 L 460 88 L 580 60
            L 700 82 L 820 58 L 940 72 L 1060 48 L 1180 70
            L 1300 58 L 1420 78 L 1540 62 L 1660 84 L 1780 70 L 1900 92
            L 1920 88 L 1920 140 Z
          `}
          fill="#0c0d12"
          stroke="#6b7280"
          strokeWidth="0.7"
          strokeOpacity="0.28"
        />
      </motion.svg>

      {/* Main skyline + landmarks + signal routes */}
      <svg
        viewBox="0 0 1920 540"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="cityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="cityStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.5" />
          </linearGradient>
          {/* Signal packet glow for arcs */}
          <filter id="signalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Harbour reflection rules */}
        <g opacity="0.25">
          <line x1="500" y1="440" x2="740" y2="440" stroke="#a1a1aa" strokeWidth="0.6" strokeDasharray="8 6" />
          <line x1="520" y1="456" x2="720" y2="456" stroke="#a1a1aa" strokeWidth="0.5" strokeDasharray="5 9" />
          <line x1="540" y1="472" x2="700" y2="472" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="3 11" />
        </g>

        {/* ---- KOWLOON SIDE (left of harbour) ---- */}
        <path
          d={`
            M 0 540
            L 0 460 L 40 460 L 40 440
            L 80 440 L 80 420
            L 120 420 L 120 398
            L 150 398 L 150 366
            L 170 366 L 170 326
            L 185 326 L 185 282
            L 200 282 L 200 232
            L 210 232 L 210 180
            L 218 180 L 218 135
            L 224 135 L 224 96
            L 228 96  L 228 72
            L 232 72  L 232 56
            L 234 56  L 234 50
            L 236 50  L 236 72
            L 242 72  L 242 110
            L 252 110 L 252 150
            L 268 150 L 268 180
            L 290 180 L 290 220
            L 314 220 L 314 256
            L 338 256 L 338 288
            L 366 288 L 366 320
            L 400 320 L 400 346
            L 440 346 L 440 370
            L 490 370 L 490 398
            L 540 398 L 540 420
            L 580 420 L 580 440
            L 620 440 L 620 460
            L 680 460 L 680 540 Z
          `}
          fill="url(#cityFill)"
          stroke="url(#cityStroke)"
          strokeWidth="1.1"
        />

        {/* Victoria Harbour water lines */}
        <g stroke="#d4d4d8" strokeOpacity="0.15">
          <line x1="680" y1="475" x2="980" y2="475" strokeWidth="0.6" strokeDasharray="12 10" />
          <line x1="700" y1="492" x2="960" y2="492" strokeWidth="0.5" strokeDasharray="8 14" />
          <line x1="720" y1="508" x2="940" y2="508" strokeWidth="0.4" strokeDasharray="5 18" />
        </g>

        {/* ---- HK ISLAND SIDE (right of harbour) ---- */}
        <path
          d={`
            M 980 540
            L 980 470 L 1020 470 L 1020 450
            L 1060 450 L 1060 420
            L 1092 420 L 1092 388
            L 1120 388 L 1120 350
            L 1142 350 L 1142 310
            L 1162 310 L 1162 266
            L 1178 266 L 1178 220
            L 1192 220 L 1192 175
            L 1204 175 L 1204 132
            L 1212 132 L 1212 92
            L 1218 92  L 1218 62
            L 1222 62  L 1222 42
            L 1226 42  L 1226 28
            L 1230 28  L 1230 50
            L 1236 50  L 1236 90
            L 1246 90  L 1246 130
            L 1256 130 L 1256 168
            L 1266 168 L 1266 130
            L 1274 130 L 1274 92
            L 1280 92  L 1280 60
            L 1286 60  L 1286 94
            L 1292 94  L 1292 130
            L 1300 130 L 1300 168
            L 1310 168 L 1310 200
            L 1322 200 L 1322 236
            L 1338 236 L 1338 272
            L 1358 272 L 1358 306
            L 1382 306 L 1382 340
            L 1410 340 L 1410 370
            L 1446 370 L 1446 398
            L 1488 398 L 1488 422
            L 1530 422 L 1530 446
            L 1580 446 L 1580 462
            L 1636 462 L 1636 478
            L 1700 478 L 1700 492
            L 1760 492 L 1760 506
            L 1820 506 L 1820 518
            L 1880 518 L 1880 528
            L 1920 528 L 1920 540 Z
          `}
          fill="url(#cityFill)"
          stroke="url(#cityStroke)"
          strokeWidth="1.1"
        />

        {/* Antennas on ICC (Kowloon) and IFC/BoC (HK Island) */}
        <g stroke="#fafafa" strokeWidth="1" strokeOpacity="0.85">
          <line x1="236" y1="50" x2="236" y2="30" />
          <line x1="1230" y1="28" x2="1230" y2="10" />
          <line x1="1280" y1="60" x2="1280" y2="42" />
        </g>

        {/* Window lights — very sparse silver dots on tall towers */}
        <g fill="#e5e7eb">
          {[228, 232, 236, 240].map((x) =>
            [70, 92, 118, 144, 172, 200].map((y) => (
              <rect
                key={`icc-${x}-${y}`}
                x={x}
                y={y}
                width="1.6"
                height="1.2"
                fillOpacity={0.25 + ((x * y) % 5) * 0.08}
              />
            ))
          )}
          {[1218, 1222, 1226, 1230].map((x) =>
            [40, 70, 100, 130, 160, 190].map((y) => (
              <rect
                key={`ifc-${x}-${y}`}
                x={x}
                y={y}
                width="1.6"
                height="1.2"
                fillOpacity={0.2 + ((x + y) % 5) * 0.08}
              />
            ))
          )}
          {[1276, 1280, 1284].map((x) =>
            [70, 94, 118, 142].map((y) => (
              <rect
                key={`cp-${x}-${y}`}
                x={x}
                y={y}
                width="1.6"
                height="1.2"
                fillOpacity={0.2 + ((x * y) % 4) * 0.09}
              />
            ))
          )}
        </g>

        {/* ---- LANDMARK ANNOTATIONS ---- */}
        {/* ICC — Kowloon */}
        <Annotation x={236} y={50} labelX={80} labelY={30} code="ICC · 484M" side="left" />
        {/* IFC 2 — HK Island */}
        <Annotation x={1230} y={28} labelX={1420} labelY={70} code="IFC2 · 415M" side="right" />
        {/* Central Plaza */}
        <Annotation x={1280} y={60} labelX={1620} labelY={130} code="C.PLAZA · 374M" side="right" />
        {/* Bank of China */}
        <Annotation x={1338} y={236} labelX={1620} labelY={220} code="BOC · 367M" side="right" />

        {/* ---- LIVE SIGNAL ARCS (the only green on this canvas) ---- */}
        {/* Arc 1: ICC → IFC2 (over the harbour) */}
        <SignalArc
          from={{ x: 236, y: 50 }}
          to={{ x: 1230, y: 28 }}
          peak={-140}
          duration={7}
          delay={0}
        />
        {/* Arc 2: IFC2 → Central Plaza */}
        <SignalArc
          from={{ x: 1230, y: 28 }}
          to={{ x: 1280, y: 60 }}
          peak={-40}
          duration={4.5}
          delay={2.1}
        />
        {/* Arc 3: ICC → BoC (long diagonal across harbour) */}
        <SignalArc
          from={{ x: 236, y: 50 }}
          to={{ x: 1338, y: 236 }}
          peak={-80}
          duration={9.2}
          delay={3.8}
        />

        {/* ---- SCAN LINE (slow vertical radar sweep) ---- */}
        <g>
          <rect
            x="0"
            y="0"
            width="1920"
            height="540"
            fill="url(#scanGrad)"
            opacity="0.6"
          >
            <animate
              attributeName="y"
              from="-540"
              to="540"
              dur="18s"
              repeatCount="indefinite"
            />
          </rect>
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="45%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </g>
      </svg>

      {/* Horizon line + waterline marker */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          bottom: '11%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212,212,216,0.5) 30%, rgba(212,212,216,0.55) 70%, transparent 100%)',
        }}
      />

      {/* Bottom meta — harbour coordinate */}
      <div className="absolute bottom-3 left-6 font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted/60 flex items-center gap-2">
        <span>victoria.harbour</span>
        <span className="w-6 h-px bg-text-muted/40" />
        <span>22.293°N · 114.169°E</span>
      </div>
      <div className="absolute bottom-3 right-6 font-mono text-[9px] tracking-[0.35em] uppercase text-text-muted/60 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
        <span className="text-signal">3 ROUTES LIVE</span>
      </div>
    </div>
  )
}

// ─── Moon ──────────────────────────────────────────────────────────────────

function Moon() {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, rgba(250,250,250,0.95) 0%, rgba(250,250,250,0.88) 35%, rgba(250,250,250,0.25) 65%, transparent 80%)',
          boxShadow:
            '0 0 80px 20px rgba(250,250,250,0.08), 0 0 30px 8px rgba(250,250,250,0.12)',
        }}
      />
      {/* Lunar surface crater dots */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <span className="absolute w-1 h-1 rounded-full bg-text-muted/40" style={{ top: '38%', left: '42%' }} />
        <span className="absolute w-1.5 h-1.5 rounded-full bg-text-muted/30" style={{ top: '55%', left: '58%' }} />
        <span className="absolute w-0.5 h-0.5 rounded-full bg-text-muted/50" style={{ top: '30%', left: '62%' }} />
      </div>
      {/* Thin outer ring */}
      <div
        className="absolute -inset-6 rounded-full border border-white/5"
        style={{ animation: 'crosshairBreath 8s ease-in-out infinite' }}
      />
    </div>
  )
}

// ─── Starfield ─────────────────────────────────────────────────────────────

function StarField() {
  const stars = [
    { x: '6%', y: '12%', size: 1, opacity: 0.6 },
    { x: '14%', y: '28%', size: 0.5, opacity: 0.3 },
    { x: '22%', y: '8%', size: 0.8, opacity: 0.5 },
    { x: '38%', y: '18%', size: 0.5, opacity: 0.35 },
    { x: '52%', y: '6%', size: 0.8, opacity: 0.55 },
    { x: '68%', y: '22%', size: 0.5, opacity: 0.3 },
    { x: '80%', y: '10%', size: 1, opacity: 0.6 },
    { x: '92%', y: '30%', size: 0.5, opacity: 0.35 },
  ]
  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.x,
            top: s.y,
            width: `${s.size * 2}px`,
            height: `${s.size * 2}px`,
            opacity: s.opacity,
            boxShadow: s.size >= 1 ? `0 0 ${s.size * 4}px rgba(255,255,255,0.35)` : 'none',
          }}
        />
      ))}
    </>
  )
}

// ─── Annotation — architect blueprint label with leader line ─────────────

function Annotation({
  x,
  y,
  labelX,
  labelY,
  code,
  side,
}: {
  x: number
  y: number
  labelX: number
  labelY: number
  code: string
  side: 'left' | 'right'
}) {
  const anchor = side === 'right' ? 'start' : 'end'
  return (
    <g opacity="0.75">
      {/* Dot at tower tip */}
      <circle cx={x} cy={y} r="2.5" fill="none" stroke="#d4d4d8" strokeWidth="0.8" />
      <circle cx={x} cy={y} r="0.8" fill="#d4d4d8" />
      {/* Leader line */}
      <line
        x1={x}
        y1={y}
        x2={labelX}
        y2={labelY}
        stroke="#d4d4d8"
        strokeWidth="0.5"
        strokeDasharray="3 3"
        strokeOpacity="0.6"
      />
      {/* Label */}
      <text
        x={labelX + (side === 'right' ? 6 : -6)}
        y={labelY}
        textAnchor={anchor}
        fontSize="10"
        fontFamily="monospace"
        fill="#d4d4d8"
        fillOpacity="0.85"
        letterSpacing="1.5"
      >
        {code}
      </text>
    </g>
  )
}

// ─── Signal arc between two points with traveling packet ─────────────────

function SignalArc({
  from,
  to,
  peak,
  duration,
  delay,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  peak: number
  duration: number
  delay: number
}) {
  // Quadratic bezier control point: midpoint lifted by `peak`
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 + peak
  const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`

  return (
    <g filter="url(#signalGlow)">
      {/* Idle track */}
      <path
        d={d}
        fill="none"
        stroke="#22ff88"
        strokeWidth="0.9"
        strokeOpacity="0.18"
        strokeLinecap="round"
      />
      {/* Dashed traveling packet */}
      <path
        d={d}
        fill="none"
        stroke="#22ff88"
        strokeWidth="1.6"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeDasharray="8 120"
        style={{
          animation: `cityPacket ${duration}s linear infinite`,
          animationDelay: `${-delay}s`,
        }}
      />
      {/* Endpoint markers (breathing) */}
      <circle cx={from.x} cy={from.y} r="3.5" fill="#22ff88" fillOpacity="0.25">
        <animate attributeName="fill-opacity" values="0.15;0.55;0.15" dur={`${duration * 0.6}s`} repeatCount="indefinite" />
      </circle>
      <circle cx={to.x} cy={to.y} r="3.5" fill="#22ff88" fillOpacity="0.25">
        <animate attributeName="fill-opacity" values="0.15;0.55;0.15" dur={`${duration * 0.6}s`} repeatCount="indefinite" begin={`${duration * 0.5}s`} />
      </circle>
    </g>
  )
}

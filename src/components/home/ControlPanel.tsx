'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Endpoint {
  id: string
  label: string
  cx: number
  cy: number
}

const ENDPOINTS: Endpoint[] = [
  { id: '01', label: 'ENDPOINT_01', cx: 420, cy: 70 },
  { id: '02', label: 'ENDPOINT_02', cx: 470, cy: 180 },
  { id: '03', label: 'ENDPOINT_03', cx: 450, cy: 290 },
  { id: '04', label: 'ENDPOINT_04', cx: 380, cy: 380 },
  { id: '05', label: 'ENDPOINT_05', cx: 90, cy: 320 },
]

const HUB = { cx: 180, cy: 220 }

interface ControlPanelProps {
  activeId: string | null
  onActiveChange: (id: string | null) => void
  broadcastTick: number
  isMobile: boolean
}

export function ControlPanel({
  activeId,
  onActiveChange,
  broadcastTick,
  isMobile,
}: ControlPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [broadcasting, setBroadcasting] = useState(false)

  const nearestEndpoint = useCallback(
    (pt: { x: number; y: number }) => {
      let best: Endpoint | null = null
      let bestDist = Infinity
      for (const e of ENDPOINTS) {
        const d = (e.cx - pt.x) ** 2 + (e.cy - pt.y) ** 2
        if (d < bestDist) {
          bestDist = d
          best = e
        }
      }
      return best
    },
    []
  )

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 560
    const y = ((e.clientY - rect.top) / rect.height) * 440
    setCursor({ x, y })
    const nearest = nearestEndpoint({ x, y })
    if (nearest && nearest.id !== activeId) {
      onActiveChange(nearest.id)
    }
  }

  const handleLeave = () => {
    setCursor(null)
    onActiveChange(null)
  }

  useEffect(() => {
    if (!isMobile) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % ENDPOINTS.length
      onActiveChange(ENDPOINTS[i].id)
    }, 1800)
    return () => clearInterval(interval)
  }, [isMobile, onActiveChange])

  useEffect(() => {
    if (broadcastTick === 0) return
    setBroadcasting(true)
    const t = setTimeout(() => setBroadcasting(false), 900)
    return () => clearTimeout(t)
  }, [broadcastTick])

  const cablePath = (target: { cx: number; cy: number }) => {
    const midX = (HUB.cx + target.cx) / 2
    const midY = (HUB.cy + target.cy) / 2 - 24
    return `M ${HUB.cx} ${HUB.cy} Q ${midX} ${midY} ${target.cx} ${target.cy}`
  }

  return (
    <div className="relative w-full max-w-[560px] aspect-[560/440] select-none">
      {/* Frame label — corner ticks */}
      <div className="absolute inset-0 pointer-events-none">
        <CornerTicks />
      </div>

      {/* Rule bg */}
      <div className="absolute inset-4 bg-rule-grid opacity-30 rounded-lg pointer-events-none" />

      <svg
        ref={svgRef}
        viewBox="0 0 560 440"
        className="relative w-full h-full touch-none"
        onPointerMove={isMobile ? undefined : handlePointer}
        onPointerLeave={isMobile ? undefined : handleLeave}
        aria-label="Control panel diagram"
      >
        <defs>
          <filter id="cpGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="hubAura">
            <stop offset="0%" stopColor="#22ff88" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#22ff88" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cableActive" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22ff88" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#22ff88" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22ff88" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="cableIdle" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* ambient hub aura */}
        <circle cx={HUB.cx} cy={HUB.cy} r="80" fill="url(#hubAura)" />

        {/* Idle cables (always visible, low opacity) */}
        {ENDPOINTS.map((e) => (
          <path
            key={`cable-idle-${e.id}`}
            d={cablePath(e)}
            stroke="url(#cableIdle)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3 6"
          />
        ))}

        {/* Active cable — follows cursor or active endpoint */}
        {activeId && (
          <motion.path
            key={`active-${activeId}`}
            d={cablePath(ENDPOINTS.find((e) => e.id === activeId)!)}
            stroke="url(#cableActive)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#cpGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        )}

        {/* Cursor-to-hub phantom line */}
        {cursor && !isMobile && (
          <line
            x1={HUB.cx}
            y1={HUB.cy}
            x2={cursor.x}
            y2={cursor.y}
            stroke="#22ff88"
            strokeWidth="0.6"
            strokeOpacity="0.3"
            strokeDasharray="2 4"
          />
        )}

        {/* Hub */}
        <g>
          <circle
            cx={HUB.cx}
            cy={HUB.cy}
            r="42"
            fill="#09090b"
            stroke="#22ff8820"
            strokeWidth="1"
          />
          <circle
            cx={HUB.cx}
            cy={HUB.cy}
            r="30"
            fill="#0c0c10"
            stroke="#22ff88"
            strokeWidth="1.2"
            strokeOpacity={broadcasting ? 1 : 0.5}
            filter="url(#cpGlow)"
          />
          <circle
            cx={HUB.cx}
            cy={HUB.cy}
            r="5"
            fill="#22ff88"
            filter="url(#cpGlow)"
          >
            <animate
              attributeName="r"
              values="4;6;4"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={HUB.cx}
            y={HUB.cy + 56}
            textAnchor="middle"
            fill="#22ff88"
            fontSize="9"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            letterSpacing="0.15em"
          >
            HUB · DEVICE_A
          </text>
          <text
            x={HUB.cx}
            y={HUB.cy + 68}
            textAnchor="middle"
            fill="#52525b"
            fontSize="8"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            control.plane.v1
          </text>
          {/* Orbit ring */}
          <circle
            cx={HUB.cx}
            cy={HUB.cy}
            r="38"
            fill="none"
            stroke="#22ff8820"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${HUB.cx} ${HUB.cy}`}
              to={`360 ${HUB.cx} ${HUB.cy}`}
              dur="24s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Endpoints */}
        {ENDPOINTS.map((e, i) => {
          const isActive = e.id === activeId
          const isBroadcast = broadcasting
          const color = isActive || isBroadcast ? '#22ff88' : '#27272a'
          const labelColor = isActive ? '#fafafa' : '#52525b'
          return (
            <g key={e.id}>
              {/* Node outer ring */}
              <circle
                cx={e.cx}
                cy={e.cy}
                r="18"
                fill="#09090b"
                stroke={color}
                strokeWidth="0.8"
                strokeOpacity={isActive || isBroadcast ? 0.8 : 0.35}
              />
              {/* Node core */}
              <circle
                cx={e.cx}
                cy={e.cy}
                r="10"
                fill="#111116"
                stroke={color}
                strokeWidth={isActive || isBroadcast ? 1.4 : 0.8}
                strokeOpacity={isActive || isBroadcast ? 1 : 0.5}
              />
              {/* LED */}
              <circle
                cx={e.cx}
                cy={e.cy}
                r={isActive || isBroadcast ? 3.5 : 2}
                fill={color}
                filter={isActive || isBroadcast ? 'url(#cpGlow)' : undefined}
              >
                {(isActive || isBroadcast) && (
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              {/* Label */}
              <text
                x={e.cx}
                y={e.cy + 36}
                textAnchor="middle"
                fill={labelColor}
                fontSize="8"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                letterSpacing="0.1em"
                className="transition-all"
              >
                {e.label}
              </text>
              {/* Coord label (small, always there) */}
              <text
                x={e.cx}
                y={e.cy + 48}
                textAnchor="middle"
                fill="#3f3f46"
                fontSize="7"
                fontFamily="var(--font-mono), ui-monospace, monospace"
              >
                {`${Math.round(e.cx)},${Math.round(e.cy)}`}
              </text>
              {/* Broadcast flash ring */}
              {isBroadcast && (
                <motion.circle
                  cx={e.cx}
                  cy={e.cy}
                  r="18"
                  fill="none"
                  stroke="#22ff88"
                  strokeWidth="1"
                  initial={{ r: 18, opacity: 0.9 }}
                  animate={{ r: 32, opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                />
              )}
            </g>
          )
        })}

        {/* Corner coordinate readout — mission control vibe */}
        <text
          x="12"
          y="20"
          fill="#3f3f46"
          fontSize="8"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          letterSpacing="0.15em"
        >
          TOPOLOGY · {ENDPOINTS.length} NODES
        </text>
        <text
          x="548"
          y="20"
          textAnchor="end"
          fill="#3f3f46"
          fontSize="8"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          letterSpacing="0.15em"
        >
          {broadcasting ? 'BROADCAST' : activeId ? `SEL ${activeId}` : 'IDLE'}
        </text>
        <text
          x="12"
          y="432"
          fill="#3f3f46"
          fontSize="8"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          letterSpacing="0.15em"
        >
          stream.architecture.v1
        </text>
      </svg>
    </div>
  )
}

function CornerTicks() {
  return (
    <svg
      viewBox="0 0 560 440"
      className="w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* four corners */}
      {[
        { x: 0, y: 0, dx: 14, dy: 14 },
        { x: 560, y: 0, dx: -14, dy: 14 },
        { x: 0, y: 440, dx: 14, dy: -14 },
        { x: 560, y: 440, dx: -14, dy: -14 },
      ].map((c, i) => (
        <g key={i} stroke="#22ff88" strokeWidth="1" strokeOpacity="0.4">
          <line x1={c.x} y1={c.y} x2={c.x + c.dx} y2={c.y} />
          <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + c.dy} />
        </g>
      ))}
    </svg>
  )
}

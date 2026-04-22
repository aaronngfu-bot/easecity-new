'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio } from 'lucide-react'

type Device = {
  id: 1 | 2 | 3 | 4
  label: string
  endpoint: string
  x: number
  y: number
  future?: boolean
}

const DEVICES: readonly Device[] = [
  { id: 1, label: 'Device 1', endpoint: 'node-a.hk', x: 70, y: 70 },
  { id: 2, label: 'Device 2', endpoint: 'node-b.hk', x: 70, y: 160 },
  { id: 3, label: 'Device 3', endpoint: 'node-c.hk', x: 70, y: 250 },
  { id: 4, label: 'Device N', endpoint: 'node-n.hk', x: 70, y: 340, future: true },
] as const

type DeviceId = Device['id']

export function InteractiveArchDiagram({ termLabel }: { termLabel: string }) {
  const [active, setActive] = useState<Set<DeviceId>>(new Set())
  const [broadcastTick, setBroadcastTick] = useState(0)
  const [hoverId, setHoverId] = useState<DeviceId | null>(null)
  const [idleGhost, setIdleGhost] = useState<DeviceId | null>(null)
  const [log, setLog] = useState<{ id: number; text: string; type: 'info' | 'signal' | 'broadcast' | 'ambient' }[]>([
    { id: 0, text: '$ stream.ctrl.engine booted', type: 'info' },
    { id: 1, text: '  listening on hub.easecity.core', type: 'info' },
    { id: 2, text: '  idle → heartbeat mode', type: 'ambient' },
  ])
  const logIdRef = useRef(3)
  const logRef = useRef<HTMLDivElement>(null)

  /** Append to the log and auto-trim to last 8 lines. */
  const appendLog = useCallback((text: string, type: 'info' | 'signal' | 'broadcast' | 'ambient' = 'info') => {
    const id = logIdRef.current++
    setLog((prev) => {
      const next = [...prev, { id, text, type }]
      return next.length > 8 ? next.slice(next.length - 8) : next
    })
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  const toggleDevice = useCallback((id: DeviceId) => {
    const device = DEVICES.find((d) => d.id === id)
    if (!device || device.future) {
      appendLog(`✗ device-${id} offline — future endpoint`, 'info')
      return
    }
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        appendLog(`— disconnected ${device.endpoint}`, 'info')
      } else {
        next.add(id)
        appendLog(`↯ routed → ${device.endpoint}`, 'signal')
      }
      return next
    })
  }, [appendLog])

  const broadcastAll = useCallback(() => {
    const live = DEVICES.filter((d) => !d.future)
    setActive(new Set(live.map((d) => d.id)))
    setBroadcastTick((t) => t + 1)
    appendLog(`⚡ broadcast → ${live.length} endpoints`, 'broadcast')
  }, [appendLog])

  /** Idle ghost-flow: when no device has been toggled, quietly cycle
   *  through D1 → D2 → D3 to keep the diagram alive. This is a purely
   *  visual hint (different styling from a real active connection) so
   *  users glancing at the page still see "data is flowing." */
  useEffect(() => {
    if (active.size > 0) {
      setIdleGhost(null)
      return
    }
    // Cycle through live device ids every 2.4s
    const live = DEVICES.filter((d) => !d.future).map((d) => d.id)
    let i = 0
    setIdleGhost(live[0])
    const iv = setInterval(() => {
      i = (i + 1) % live.length
      setIdleGhost(live[i])
    }, 2400)
    return () => clearInterval(iv)
  }, [active.size])

  /** Keyboard: 1-4 toggle devices, B broadcasts. Only when this element is focused or hovered. */
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Only react when the diagram is roughly in view — we'll scope via visibility
      const root = containerRef.current
      if (!root) return
      const rect = root.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1
      if (!inView) return

      if (e.key >= '1' && e.key <= '4') {
        const n = Number(e.key) as DeviceId
        e.preventDefault()
        toggleDevice(n)
      } else if (e.key.toLowerCase() === 'b') {
        // Don't conflict with konami BA
        if (!e.repeat) {
          e.preventDefault()
          broadcastAll()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleDevice, broadcastAll])

  const liveCount = active.size
  const anyActive = liveCount > 0

  return (
    <div ref={containerRef} className="relative">
      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              anyActive ? 'bg-signal animate-signal-pulse' : 'bg-text-muted'
            }`}
          />
          <span className="label-mono text-signal/80">LIVE.TOPOLOGY</span>
          <span className="text-text-muted font-mono text-[10px] tracking-wider ml-1">
            · {liveCount} / {DEVICES.filter((d) => !d.future).length} active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={broadcastAll}
            className="glass-ghost !py-1.5 !px-3 !text-[11px] !rounded-md flex items-center gap-1.5 font-mono tracking-wider uppercase"
          >
            <Radio size={11} />
            Broadcast
            <span className="kbd !h-4 !min-w-4 !text-[9px]">B</span>
          </button>
          <span className="font-mono text-[10px] text-text-muted tracking-wider hidden sm:inline">
            {termLabel}
          </span>
        </div>
      </div>

      {/* SVG diagram */}
      <div className="relative aspect-[4/3]">
        <svg
          viewBox="0 0 560 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="Interactive stream control topology"
        >
          <defs>
            <linearGradient id="archGradActive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22ff88" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#22ff88" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="archGradData" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
            </linearGradient>
            <filter id="hubGlow">
              <feGaussianBlur stdDeviation={anyActive ? '4' : '2'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arrowSignalR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22ff88" fillOpacity="0.8" />
            </marker>
          </defs>

          {/* Ambient dot grid */}
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 10 }).map((_, c) => (
              <circle
                key={`bg-${r}-${c}`}
                cx={20 + c * 56}
                cy={20 + r * 70}
                r="1"
                fill="#22ff88"
                fillOpacity="0.04"
              />
            ))
          )}

          {/* Broadcast flash ring */}
          <AnimatePresence>
            {broadcastTick > 0 && (
              <motion.circle
                key={broadcastTick}
                cx={280}
                cy={210}
                r={20}
                fill="none"
                stroke="#22ff88"
                strokeWidth="1.5"
                initial={{ r: 20, opacity: 0.9 }}
                animate={{ r: 260, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* Hub */}
          <g>
            <rect
              x="218"
              y="166"
              width="124"
              height="88"
              rx="12"
              fill="#0d1117"
              stroke={anyActive ? '#22ff88' : '#2a2a30'}
              strokeWidth="1.5"
              filter="url(#hubGlow)"
              className="transition-all duration-300"
            />
            <rect
              x="228"
              y="176"
              width="104"
              height="68"
              rx="8"
              fill="#111116"
              stroke={anyActive ? '#22ff88' : '#2a2a30'}
              strokeWidth="0.6"
              strokeOpacity="0.4"
            />
            <text
              x="280"
              y="202"
              textAnchor="middle"
              fill={anyActive ? '#22ff88' : '#a1a1aa'}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              className="transition-colors duration-300"
            >
              HUB
            </text>
            <text
              x="280"
              y="218"
              textAnchor="middle"
              fill={anyActive ? '#22ff88' : '#52525b'}
              fontSize="9"
              fontFamily="monospace"
              opacity="0.85"
            >
              stream.ctrl
            </text>
            <text
              x="280"
              y="234"
              textAnchor="middle"
              fill={anyActive ? '#22ff88' : idleGhost ? '#22ff8888' : '#52525b'}
              fontSize="8"
              fontFamily="monospace"
              opacity="0.7"
            >
              {anyActive ? `routing ${liveCount}` : idleGhost ? 'heartbeat' : 'idle'}
            </text>
            <rect
              x="212"
              y="160"
              width="136"
              height="100"
              rx="15"
              fill="none"
              stroke={anyActive ? '#22ff88' : '#2a2a30'}
              strokeWidth="0.5"
              strokeOpacity={anyActive ? '0.4' : '0.15'}
              strokeDasharray="4 4"
            >
              {anyActive && (
                <animate
                  attributeName="stroke-opacity"
                  values="0.2;0.5;0.2"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Device endpoints — interactive buttons via <g> + foreignObject hit */}
          {DEVICES.map((dev) => {
            const isActive = active.has(dev.id)
            const isHover = hoverId === dev.id
            const isIdleGhost = !isActive && idleGhost === dev.id && active.size === 0
            const future = dev.future
            const fill = future ? '#52525b' : isActive ? '#22ff88' : '#a1a1aa'
            const strokeCol = future
              ? '#52525b'
              : isActive
                ? '#22ff88'
                : isHover
                  ? '#22ff88'
                  : isIdleGhost
                    ? '#22ff8855'
                    : '#27272a'

            return (
              <g
                key={dev.id}
                onClick={() => !future && toggleDevice(dev.id)}
                onMouseEnter={() => setHoverId(dev.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor: future ? 'not-allowed' : 'pointer' }}
              >
                {/* connection line */}
                {!future && (
                  <line
                    x1="170"
                    y1={dev.y}
                    x2="218"
                    y2="210"
                    stroke={
                      isActive
                        ? 'url(#archGradActive)'
                        : isHover
                          ? '#22ff88'
                          : isIdleGhost
                            ? '#22ff88'
                            : '#27272a'
                    }
                    strokeWidth={isActive ? 1.5 : isIdleGhost ? 1 : 1}
                    strokeOpacity={isActive ? 1 : isHover ? 0.5 : isIdleGhost ? 0.45 : 0.25}
                    strokeDasharray={
                      isActive ? '6 5' : isIdleGhost ? '2 6' : isHover ? '3 3' : undefined
                    }
                    markerEnd={isActive ? 'url(#arrowSignalR)' : undefined}
                    className="transition-all duration-500"
                  >
                    {isActive && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-66"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    )}
                    {isIdleGhost && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-48"
                        dur="2.4s"
                        repeatCount="indefinite"
                      />
                    )}
                  </line>
                )}
                {future && (
                  <line
                    x1="170"
                    y1={dev.y}
                    x2="218"
                    y2="210"
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeOpacity="0.2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Device box */}
                <rect
                  x="20"
                  y={dev.y - 22}
                  width="150"
                  height="44"
                  rx="8"
                  fill="#0d1117"
                  stroke={strokeCol}
                  strokeWidth={isActive ? 1.5 : 1}
                  strokeDasharray={future ? '4 3' : undefined}
                  className="transition-all duration-200"
                />

                {/* Keyboard hint badge */}
                {!future && (
                  <g>
                    <rect
                      x="26"
                      y={dev.y - 16}
                      width="16"
                      height="12"
                      rx="3"
                      fill={isActive ? '#22ff88' : '#1c1c22'}
                      stroke={isActive ? '#22ff88' : '#27272a'}
                      strokeWidth="0.5"
                    />
                    <text
                      x="34"
                      y={dev.y - 7}
                      textAnchor="middle"
                      fill={isActive ? '#07090a' : '#a1a1aa'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {dev.id}
                    </text>
                  </g>
                )}

                {/* Live dot */}
                {!future && isActive && (
                  <circle cx="155" cy={dev.y - 12} r="3.5" fill="#22ff88">
                    <animate
                      attributeName="fill-opacity"
                      values="0.4;1;0.4"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Idle heartbeat dot */}
                {!future && isIdleGhost && (
                  <circle cx="155" cy={dev.y - 12} r="3" fill="#22ff88" fillOpacity="0.4">
                    <animate
                      attributeName="fill-opacity"
                      values="0.15;0.5;0.15"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="r"
                      values="2.5;3.5;2.5"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                <text
                  x="100"
                  y={dev.y - 4}
                  textAnchor="middle"
                  fill={fill}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="transition-colors duration-200"
                >
                  {dev.label}
                </text>
                <text
                  x="100"
                  y={dev.y + 10}
                  textAnchor="middle"
                  fill={future ? '#3f3f46' : isActive ? '#22ff88' : '#52525b'}
                  fontSize="8"
                  fontFamily="monospace"
                  fillOpacity={isActive ? 0.85 : 0.6}
                  className="transition-colors duration-200"
                >
                  {dev.endpoint}
                </text>
              </g>
            )
          })}

          {/* Right — management panel boxes (labels reflect activity) */}
          {[
            { y: 80, label: 'MANAGEMENT', sub: 'Control Interface' },
            { y: 175, label: 'MONITORING', sub: `${liveCount} stream${liveCount !== 1 ? 's' : ''} live` },
            { y: 270, label: 'API GATEWAY', sub: 'REST / WebSocket' },
          ].map((box, i) => (
            <g key={i}>
              <rect
                x="400"
                y={box.y}
                width="140"
                height="60"
                rx="8"
                fill="#0d1117"
                stroke={anyActive && i === 1 ? '#22ff88' : '#27272a'}
                strokeWidth="1"
                strokeOpacity={anyActive && i === 1 ? 0.6 : 1}
                className="transition-all duration-300"
              />
              <text
                x="470"
                y={box.y + 25}
                textAnchor="middle"
                fill={anyActive && i === 1 ? '#22ff88' : '#a1a1aa'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {box.label}
              </text>
              <text
                x="470"
                y={box.y + 40}
                textAnchor="middle"
                fill={anyActive && i === 1 ? '#22ff88' : '#3f3f46'}
                fontSize="8"
                fontFamily="monospace"
                fillOpacity={anyActive && i === 1 ? 0.9 : 1}
              >
                {box.sub}
              </text>
            </g>
          ))}

          {[110, 205, 300].map((y, i) => (
            <line
              key={i}
              x1="342"
              y1="210"
              x2="400"
              y2={y}
              stroke={anyActive ? '#22ff88' : '#27272a'}
              strokeOpacity={anyActive ? 0.35 : 0.5}
              strokeWidth="1"
              strokeDasharray={anyActive ? '5 4' : undefined}
              className="transition-all duration-300"
            >
              {anyActive && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-36"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          ))}
        </svg>
      </div>

      {/* Terminal log */}
      <div
        ref={logRef}
        className="mt-3 glass-panel !rounded-md p-3 font-mono text-[11px] leading-relaxed h-28 overflow-y-auto"
      >
        {log.map((l) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={
              l.type === 'broadcast'
                ? 'text-signal font-bold'
                : l.type === 'signal'
                  ? 'text-signal'
                  : l.type === 'ambient'
                    ? 'text-signal/50 italic'
                    : 'text-text-muted'
            }
          >
            {l.text}
          </motion.div>
        ))}
      </div>

      {/* Hint line */}
      <p className="mt-2 text-[11px] text-text-muted font-mono tracking-wider text-center">
        <span className="kbd !h-4 !min-w-4 !text-[9px]">1</span>
        <span className="kbd !h-4 !min-w-4 !text-[9px] ml-1">2</span>
        <span className="kbd !h-4 !min-w-4 !text-[9px] ml-1">3</span>
        <span className="ml-2">toggle device</span>
        <span className="mx-2">·</span>
        <span className="kbd !h-4 !min-w-4 !text-[9px]">B</span>
        <span className="ml-1">broadcast all</span>
        <span className="mx-2">·</span>
        click endpoints directly
      </p>
    </div>
  )
}

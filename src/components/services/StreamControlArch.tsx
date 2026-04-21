'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

function ArchDiagram() {
  const devices = [
    { id: 'D1', label: 'Device 1', x: 80, y: 60 },
    { id: 'D2', label: 'Device 2', x: 80, y: 160 },
    { id: 'D3', label: 'Device 3', x: 80, y: 260 },
    { id: 'D4', label: 'Device N', x: 80, y: 340, dashed: true },
  ]

  return (
    <svg viewBox="0 0 560 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="archGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
        </linearGradient>
        <filter id="archGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hubSignalGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" fillOpacity="0.7" />
        </marker>
        <marker id="arrowL" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
          <polygon points="8 0, 0 3, 8 6" fill="#22d3ee" fillOpacity="0.4" />
        </marker>
      </defs>

      {Array.from({ length: 6 }).map((_, r) =>
        Array.from({ length: 10 }).map((_, c) => (
          <circle key={`bg-${r}-${c}`} cx={20 + c * 56} cy={20 + r * 70} r="1" fill="#22ff88" fillOpacity="0.05" />
        ))
      )}

      {/* Hub — switched stroke to signal since it's the LIVE control node */}
      <rect x="218" y="166" width="124" height="88" rx="12" fill="#0d1117" stroke="#22ff88" strokeWidth="1.5" filter="url(#hubSignalGlow)" />
      <rect x="228" y="176" width="104" height="68" rx="8" fill="#111116" stroke="#22ff88" strokeWidth="0.6" strokeOpacity="0.4" />
      <text x="280" y="204" textAnchor="middle" fill="#22ff88" fontSize="11" fontFamily="monospace" fontWeight="bold">DEVICE A</text>
      <text x="280" y="219" textAnchor="middle" fill="#22ff88" fontSize="9" fontFamily="monospace" opacity="0.7">Control Hub</text>
      <text x="280" y="234" textAnchor="middle" fill="#22ff88" fontSize="8" fontFamily="monospace" opacity="0.4">stream.ctrl.engine</text>
      <rect x="212" y="160" width="136" height="100" rx="15" fill="none" stroke="#22ff88" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4">
        <animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Remote devices — cyan lines for data flow */}
      {devices.map((dev) => (
        <g key={dev.id}>
          <rect x="20" y={dev.y - 22} width="100" height="44" rx="8" fill="#0d1117"
            stroke={dev.dashed ? '#52525b' : '#27272a'} strokeWidth="1"
            strokeDasharray={dev.dashed ? '4 3' : undefined} />
          <text x="70" y={dev.y - 4} textAnchor="middle" fill={dev.dashed ? '#52525b' : '#a1a1aa'} fontSize="9" fontFamily="monospace" fontWeight="bold">{dev.label}</text>
          <text x="70" y={dev.y + 10} textAnchor="middle" fill="#3f3f46" fontSize="8" fontFamily="monospace">Remote Endpoint</text>
          {!dev.dashed && (
            <circle cx="38" cy={dev.y - 12} r="3" fill="#22d3ee" fillOpacity="0.7">
              <animate attributeName="fill-opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" begin={`${devices.indexOf(dev) * 0.4}s`} />
            </circle>
          )}
          <line x1="120" y1={dev.y} x2="218" y2="210" stroke={dev.dashed ? '#27272a' : '#22d3ee'}
            strokeWidth="1" strokeOpacity={dev.dashed ? 0.2 : 0.15} strokeDasharray={dev.dashed ? '4 4' : undefined} />
          {!dev.dashed && (
            <>
              <line x1="120" y1={dev.y} x2="218" y2="210" stroke="url(#archGrad)" strokeWidth="1.5" strokeDasharray="6 5" markerEnd="url(#arrowR)">
                <animate attributeName="stroke-dashoffset" from="0" to="-66" dur={`${1.5 + devices.indexOf(dev) * 0.3}s`} repeatCount="indefinite" />
              </line>
              <line x1="218" y1="210" x2="120" y2={dev.y} stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="3 8" markerEnd="url(#arrowL)">
                <animate attributeName="stroke-dashoffset" from="-66" to="0" dur={`${2 + devices.indexOf(dev) * 0.3}s`} repeatCount="indefinite" />
              </line>
            </>
          )}
        </g>
      ))}

      {/* Right: management boxes */}
      {[
        { y: 80, label: 'MANAGEMENT', sub: 'Control Interface' },
        { y: 175, label: 'MONITORING', sub: 'Real-time Metrics' },
        { y: 270, label: 'API GATEWAY', sub: 'REST / WebSocket' },
      ].map((box, i) => (
        <g key={i}>
          <rect x="400" y={box.y} width="140" height="60" rx="8" fill="#0d1117" stroke="#27272a" strokeWidth="1" />
          <text x="470" y={box.y + 25} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace" fontWeight="bold">{box.label}</text>
          <text x="470" y={box.y + 40} textAnchor="middle" fill="#3f3f46" fontSize="8" fontFamily="monospace">{box.sub}</text>
        </g>
      ))}

      {[110, 205, 300].map((y, i) => (
        <line key={i} x1="342" y1="210" x2="400" y2={y} stroke="#27272a" strokeWidth="1" strokeOpacity="0.5" />
      ))}
      <line x1="342" y1="210" x2="400" y2="205" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="5 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.8s" repeatCount="indefinite" />
      </line>
    </svg>
  )
}

export function StreamControlArch() {
  const { t } = useLanguage()

  const steps = [
    { step: '01', title: t.streamArch.step1Title, desc: t.streamArch.step1Desc },
    { step: '02', title: t.streamArch.step2Title, desc: t.streamArch.step2Desc },
    { step: '03', title: t.streamArch.step3Title, desc: t.streamArch.step3Desc },
    { step: '04', title: t.streamArch.step4Title, desc: t.streamArch.step4Desc },
  ]

  return (
    <section className="section-padding border-t border-border">
      <div className="container-max">
        <SectionTitle
          eyebrow={t.streamArch.eyebrow}
          title={t.streamArch.heading}
          titleHighlight={t.streamArch.headingHighlight}
          description={t.streamArch.desc}
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 glass-panel p-4 md:p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
                <span className="label-mono text-signal/80">LIVE.TOPOLOGY</span>
              </div>
              <span className="font-mono text-[10px] text-text-muted tracking-wider">
                {t.streamArch.termLabel}
              </span>
            </div>
            <ArchDiagram />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-5"
          >
            {steps.map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-signal/20 bg-signal/5 flex items-center justify-center group-hover:bg-signal/10 group-hover:border-signal/40 transition-colors">
                  <span className="text-signal text-xs font-mono font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1.5">{item.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

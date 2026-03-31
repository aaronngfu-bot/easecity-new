export function HKSkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skylineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
        </linearGradient>
        <filter id="skylineGlow" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feFlood floodColor="#22d3ee" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---- Kowloon side (left) ---- */}
      <path
        d={`
          M 0,180
          L 0,148 L 18,148 L 18,135
          L 30,135 L 30,120
          L 42,120 L 42,108
          L 55,108 L 55,95
          L 64,95  L 64,78
          L 72,78  L 72,60
          L 80,60  L 80,45
          L 88,45  L 88,30
          L 96,30  L 96,18
          L 100,18 L 100,10
          L 104,10 L 104,0
          L 108,0  L 108,10
          L 112,10 L 112,20
          L 118,20 L 118,35
          L 126,35 L 126,50
          L 138,50 L 138,42
          L 148,42 L 148,55
          L 158,55 L 158,68
          L 170,68 L 170,80
          L 182,80 L 182,90
          L 196,90 L 196,100
          L 210,100 L 210,110
          L 226,110 L 226,120
          L 245,120 L 245,130
          L 268,130 L 268,140
          L 295,140 L 295,148
          L 330,148 L 330,155
          L 370,155 L 370,180
        `}
        fill="url(#skylineFill)"
        stroke="#22d3ee"
        strokeWidth="0.8"
        strokeOpacity="0.6"
        filter="url(#skylineGlow)"
      />

      {/* ---- Victoria Harbour gap with water ripple lines ---- */}
      <line x1="370" y1="165" x2="530" y2="165" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.15" strokeDasharray="6 6" />
      <line x1="380" y1="170" x2="520" y2="170" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.10" strokeDasharray="4 8" />
      <line x1="390" y1="175" x2="510" y2="175" stroke="#22d3ee" strokeWidth="0.3" strokeOpacity="0.07" strokeDasharray="3 10" />

      {/* ---- Hong Kong Island side (right of harbour) ---- */}
      <path
        d={`
          M 530,180
          L 530,152 L 548,152 L 548,140
          L 562,140 L 562,125
          L 574,125 L 574,110
          L 586,110 L 586,92
          L 597,92  L 597,75
          L 608,75  L 608,58
          L 616,58  L 616,40
          L 624,40  L 624,24
          L 630,24  L 630,12
          L 636,12  L 636,4
          L 642,4   L 642,14
          L 648,14  L 648,28
          L 656,28  L 656,45
          L 666,45  L 666,35
          L 674,35  L 674,22
          L 680,22  L 680,10
          L 686,10  L 686,22
          L 692,22  L 692,38
          L 700,38  L 700,55
          L 710,55  L 710,48
          L 718,48  L 718,62
          L 728,62  L 728,75
          L 740,75  L 740,65
          L 750,65  L 750,78
          L 762,78  L 762,88
          L 776,88  L 776,98
          L 792,98  L 792,108
          L 808,108 L 808,118
          L 826,118 L 826,128
          L 848,128 L 848,138
          L 874,138 L 874,146
          L 904,146 L 904,153
          L 938,153 L 938,160
          L 978,160 L 978,165
          L 1024,165 L 1024,180
        `}
        fill="url(#skylineFill)"
        stroke="#22d3ee"
        strokeWidth="0.8"
        strokeOpacity="0.6"
        filter="url(#skylineGlow)"
      />

      {/* ---- Right continuation lower buildings ---- */}
      <path
        d={`
          M 1024,180
          L 1024,165
          L 1060,165 L 1060,158
          L 1100,158 L 1100,165
          L 1140,165 L 1140,160
          L 1180,160 L 1180,168
          L 1220,168 L 1220,163
          L 1260,163 L 1260,170
          L 1300,170 L 1300,165
          L 1340,165 L 1340,172
          L 1380,172 L 1380,168
          L 1420,168 L 1420,174
          L 1440,174 L 1440,180
        `}
        fill="url(#skylineFill)"
        stroke="#22d3ee"
        strokeWidth="0.5"
        strokeOpacity="0.35"
      />

      {/* ---- Antenna / signal tower details (ICC tower) ---- */}
      <line x1="104" y1="0" x2="104" y2="-8" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.8" />
      <line x1="680" y1="10" x2="680" y2="2" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.8" />
      <line x1="636" y1="4" x2="636" y2="-4" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.7" />

      {/* ---- Window lights on tall towers ---- */}
      {[96, 100, 104, 108].map((x) =>
        [20, 35, 50, 65, 80].map((y) => (
          <rect
            key={`k-${x}-${y}`}
            x={x + 1}
            y={y}
            width="2"
            height="1.5"
            fill="#22d3ee"
            fillOpacity={Math.random() * 0.4 + 0.1}
          />
        ))
      )}
      {[630, 636, 642, 674, 680, 686].map((x) =>
        [25, 40, 55, 70].map((y) => (
          <rect
            key={`h-${x}-${y}`}
            x={x + 1}
            y={y}
            width="2"
            height="1.5"
            fill="#22d3ee"
            fillOpacity={Math.random() * 0.3 + 0.1}
          />
        ))
      )}

      {/* ---- Reflection in harbour ---- */}
      <line x1="104" y1="180" x2="104" y2="165" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.15" />
      <line x1="636" y1="180" x2="636" y2="168" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.12" />
      <line x1="680" y1="180" x2="680" y2="168" stroke="#22d3ee" strokeWidth="0.4" strokeOpacity="0.12" />
    </svg>
  )
}

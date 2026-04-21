import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#09090b',
          surface: '#111116',
          elevated: '#1c1c22',
          warm: '#0c0b0d',
        },
        border: {
          DEFAULT: '#27272a',
          subtle: '#1c1c22',
          accent: '#22ff8830',
          data: '#22d3ee30',
        },
        accent: {
          cyan: '#22d3ee',
          'cyan-light': '#67e8f9',
          'cyan-dim': '#164e6380',
          purple: '#a855f7',
          'purple-dim': '#581c8780',
        },
        signal: {
          DEFAULT: '#22ff88',
          light: '#7dffb6',
          dim: '#064028',
          glow: '#22ff8820',
        },
        text: {
          primary: '#fafafa',
          secondary: '#a1a1aa',
          muted: '#52525b',
          faint: '#3f3f46',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(6rem, 20vw, 16rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(3.5rem, 10vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'micro': ['0.625rem', { lineHeight: '1', letterSpacing: '0.15em' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -10%, #22ff8812, transparent)',
        'card-gradient': 'linear-gradient(135deg, #1c1c2280, #09090b)',
        'signal-glow': 'radial-gradient(ellipse 40% 30% at 50% 50%, #22ff8820, transparent)',
        'data-glow': 'radial-gradient(ellipse 40% 30% at 50% 50%, #22d3ee18, transparent)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'signal-pulse': 'signalPulse 2s ease-in-out infinite',
        'flow': 'flow 3s linear infinite',
        'scan': 'scan 4s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'blink': 'blink 1.1s step-end infinite',
        'ticker': 'ticker 45s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px #22d3ee40, 0 0 20px #22d3ee20',
            borderColor: '#22d3ee40',
          },
          '50%': {
            boxShadow: '0 0 15px #22d3ee80, 0 0 40px #22d3ee30',
            borderColor: '#22d3ee80',
          },
        },
        signalPulse: {
          '0%, 100%': {
            boxShadow: '0 0 6px #22ff8860, 0 0 18px #22ff8830',
            opacity: '0.9',
          },
          '50%': {
            boxShadow: '0 0 14px #22ff88aa, 0 0 36px #22ff8855',
            opacity: '1',
          },
        },
        flow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px #22d3ee30, 0 0 60px #22d3ee10',
        'glow-cyan-sm': '0 0 10px #22d3ee40',
        'glow-purple': '0 0 20px #a855f730, 0 0 60px #a855f710',
        'glow-signal': '0 0 22px #22ff8840, 0 0 60px #22ff8818',
        'glow-signal-sm': '0 0 10px #22ff8855',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
        'inset-rule': 'inset 0 0 0 1px #27272a',
        'terminal': 'inset 0 1px 0 #2a2a30, 0 30px 60px -30px #000',
      },
    },
  },
  plugins: [],
}

export default config

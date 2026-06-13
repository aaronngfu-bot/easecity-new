import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			bg: {
  				void: '#030506',
  				base: '#07090b',
  				surface: '#101418',
  				elevated: '#171d22',
  				raised: '#20282e',
  				warm: '#0c0b0d'
  			},
  			paper: {
  				DEFAULT: '#f7fafa',
  				soft: '#eef4f3',
  				card: '#ffffff',
  				border: '#d8e2e0',
  				ink: '#07100f',
  				muted: '#667472'
  			},
  			border: {
  				DEFAULT: 'hsl(var(--border))',
  				subtle: '#172024',
  				strong: '#3a4a4f',
  				accent: '#00e5cc52',
  				data: '#00e5cc2e'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				cyan: '#00e5cc',
  				'cyan-light': '#35f5e0',
  				'cyan-deep': '#008f82',
  				'cyan-dim': '#003f3a',
  				purple: '#a855f7',
  				'purple-dim': '#581c8780'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			signal: {
  				DEFAULT: '#00e5cc',
  				light: '#35f5e0',
  				deep: '#008f82',
  				dim: '#003f3a',
  				veil: '#00e5cc1f',
  				glow: '#00e5cc2e'
  			},
  			text: {
  				primary: '#f5f8f8',
  				secondary: '#c6d1d0',
  				muted: '#839190',
  				faint: '#536160'
  			},
  			status: {
  				success: '#20d990',
  				warning: '#f5a524',
  				danger: '#ff4d5e',
  				info: '#7ca8ff',
  				neutral: '#9aa6a5'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-body)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-display)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'Menlo',
  				'monospace'
  			]
  		},
  		fontSize: {
  			'display-hero': [
  				'clamp(4.5rem, 13vw, 11rem)',
  				{
  					lineHeight: '0.88',
  					letterSpacing: '-0.055em'
  				}
  			],
  			'display-xl': [
  				'clamp(3.2rem, 8vw, 6.5rem)',
  				{
  					lineHeight: '0.95',
  					letterSpacing: '-0.045em'
  				}
  			],
  			'display-lg': [
  				'clamp(2.4rem, 5vw, 4.5rem)',
  				{
  					lineHeight: '1',
  					letterSpacing: '-0.035em'
  				}
  			],
  			micro: [
  				'0.625rem',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '0.18em'
  				}
  			]
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -10%, #00e5cc12, transparent)',
  			'card-gradient': 'linear-gradient(135deg, #171d22, #101418)',
  			'control-grid': 'linear-gradient(to right, #00e5cc10 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)',
  			'signal-glow': 'radial-gradient(ellipse 40% 30% at 50% 50%, #00e5cc20, transparent)',
  			'data-glow': 'radial-gradient(ellipse 40% 30% at 50% 50%, #00e5cc18, transparent)'
  		},
  		animation: {
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 6s ease-in-out infinite',
  			'glow-pulse': 'glowPulse 3s ease-in-out infinite',
  			'signal-pulse': 'signalPulse 2s ease-in-out infinite',
  			flow: 'flow 3s linear infinite',
  			scan: 'scan 4s linear infinite',
  			'fade-up': 'fadeUp 0.6s ease-out forwards',
  			blink: 'blink 1.1s step-end infinite',
  			ticker: 'ticker 45s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-8px)'
  				}
  			},
  			glowPulse: {
  				'0%, 100%': {
  					boxShadow: '0 0 5px #00e5cc40, 0 0 20px #00e5cc20',
  					borderColor: '#00e5cc40'
  				},
  				'50%': {
  					boxShadow: '0 0 15px #00e5cc80, 0 0 40px #00e5cc30',
  					borderColor: '#00e5cc80'
  				}
  			},
  			signalPulse: {
  				'0%, 100%': {
  					boxShadow: '0 0 6px #00e5cc60, 0 0 18px #00e5cc30',
  					opacity: '0.9'
  				},
  				'50%': {
  					boxShadow: '0 0 14px #00e5ccaa, 0 0 36px #00e5cc55',
  					opacity: '1'
  				}
  			},
  			flow: {
  				'0%': {
  					strokeDashoffset: '100'
  				},
  				'100%': {
  					strokeDashoffset: '0'
  				}
  			},
  			scan: {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(100vh)'
  				}
  			},
  			fadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			blink: {
  				'0%, 50%': {
  					opacity: '1'
  				},
  				'50.01%, 100%': {
  					opacity: '0'
  				}
  			},
  			ticker: {
  				'0%': {
  					transform: 'translateX(0%)'
  				},
  				'100%': {
  					transform: 'translateX(-50%)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		boxShadow: {
  			'glow-cyan': '0 0 20px #00e5cc30, 0 0 60px #00e5cc10',
  			'glow-cyan-sm': '0 0 10px #00e5cc40',
  			'glow-purple': '0 0 20px #a855f730, 0 0 60px #a855f710',
  			'glow-signal': '0 0 22px #00e5cc40, 0 0 60px #00e5cc18',
  			'glow-signal-sm': '0 0 10px #00e5cc55',
  			panel: '0 24px 80px rgba(0,0,0,0.35)',
  			card: '0 12px 40px rgba(0,0,0,0.24)',
  			'card-hover': '0 18px 56px rgba(0,0,0,0.34)',
  			paper: '0 18px 50px rgba(7,16,15,0.10)',
  			'inset-rule': 'inset 0 0 0 1px #27272a',
  			terminal: 'inset 0 1px 0 #2a2a30, 0 30px 60px -30px #000'
  		}
  	}
  },
  plugins: [],
}

export default config

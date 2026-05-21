import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GrainField } from '@/components/ui/GrainField'
import { BootSequence } from '@/components/ui/BootSequence'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardLayer } from '@/components/ui/KeyboardLayer'
import { CursorGlowLayer } from '@/components/ui/CursorGlowLayer'
import { BlueprintField } from '@/components/ui/BlueprintField'
import PillNav from '@/components/PillNav'

const navItems = [
  { label: '主頁', href: '/' },
  { label: '服務', href: '/services' },
  { label: '方案價格', href: '/pricing' },
  { label: '下載', href: '/download' },
  { label: '關於我們', href: '/about' },
  { label: '聯絡我們', href: '/contact' },
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="control-canvas relative min-h-screen overflow-x-hidden">
      <BootSequence />
      <BlueprintField />
      <GrainField />
      <CursorGlowLayer />

      <div className="pointer-events-none fixed inset-0 z-[1] control-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-[1] signal-noise opacity-25 mix-blend-overlay" />

      <PillNav
        logo="/images/easecity-pill-logo.svg"
        logoAlt="easecity"
        items={navItems}
        baseColor="#eaffff"
        pillColor="#071012"
        hoveredPillTextColor="#03100f"
      />
      <main className="relative z-[2] min-h-screen">{children}</main>
      <Footer />

      <ChatWidget />
      <CommandPalette />
      <KeyboardLayer />
    </div>
  )
}

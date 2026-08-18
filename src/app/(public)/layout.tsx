import PillNav from '@/components/PillNav'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardLayer } from '@/components/ui/KeyboardLayer'

const navItems = [
  { href: '/ec-share',  labelKey: 'product' },
  { href: '/services',  labelKey: 'services' },
  { href: '/pricing',   labelKey: 'pricing' },
  { href: '/download',  labelKey: 'download' },
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="control-canvas relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 z-[1] control-grid opacity-20" />

      <PillNav
        items={navItems}
      />
      <main className="relative z-[2] min-h-screen">{children}</main>
      <Footer />

      <ChatWidget />
      <CommandPalette />
      <KeyboardLayer />
    </div>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GrainField } from '@/components/ui/GrainField'
import { TelemetryBand } from '@/components/ui/TelemetryBand'
import { BootSequence } from '@/components/ui/BootSequence'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardLayer } from '@/components/ui/KeyboardLayer'
import { CursorGlowLayer } from '@/components/ui/CursorGlowLayer'
import { BlueprintField } from '@/components/ui/BlueprintField'

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

      <Navbar />
      <main className="relative z-[2] min-h-screen">{children}</main>
      <Footer />

      <TelemetryBand />
      <ChatWidget />
      <CommandPalette />
      <KeyboardLayer />
    </div>
  )
}

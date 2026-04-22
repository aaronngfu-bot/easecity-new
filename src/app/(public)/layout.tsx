import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GrainField } from '@/components/ui/GrainField'
import { TelemetryBand } from '@/components/ui/TelemetryBand'
import { BootSequence } from '@/components/ui/BootSequence'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardLayer } from '@/components/ui/KeyboardLayer'
import { CursorGlowLayer } from '@/components/ui/CursorGlowLayer'
import { AmbientLayer } from '@/components/ui/AmbientLayer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Boot sequence intro on first visit */}
      <BootSequence />

      {/* Always-on background — z-[1], behind content, above bg-base */}
      <AmbientLayer />

      {/* Cursor-reactive grain noise, on top of ambient but below content */}
      <GrainField />

      {/* Reacts to cursor; writes CSS vars on interactive panels */}
      <CursorGlowLayer />

      <Navbar />
      <main className="min-h-screen relative z-[2]">{children}</main>
      <Footer />

      {/* Fixed HUD — ambient live metrics */}
      <TelemetryBand />

      {/* Floating surfaces */}
      <ChatWidget />
      <CommandPalette />
      <KeyboardLayer />
    </>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GrainField } from '@/components/ui/GrainField'
import { TelemetryBand } from '@/components/ui/TelemetryBand'
import { BootSequence } from '@/components/ui/BootSequence'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardLayer } from '@/components/ui/KeyboardLayer'
import { CursorGlowLayer } from '@/components/ui/CursorGlowLayer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BootSequence />
      <GrainField />
      <CursorGlowLayer />
      <Navbar />
      <main className="min-h-screen relative z-[2]">{children}</main>
      <Footer />
      <TelemetryBand />
      <ChatWidget />
      <CommandPalette />
      <KeyboardLayer />
    </>
  )
}

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { GrainField } from '@/components/ui/GrainField'
import { TelemetryBand } from '@/components/ui/TelemetryBand'
import { BootSequence } from '@/components/ui/BootSequence'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BootSequence />
      <GrainField />
      <Navbar />
      <main className="min-h-screen relative z-[2]">{children}</main>
      <Footer />
      <TelemetryBand />
      <ChatWidget />
    </>
  )
}

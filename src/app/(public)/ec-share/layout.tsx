import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EC-Share',
  description:
    'EC-Share is Android device mirroring for teams: multi-device grid, focus mode, clipboard sync, and desktop-to-desktop sharing via LAN or VPN.',
}

export default function EcShareLayout({ children }: { children: React.ReactNode }) {
  return children
}

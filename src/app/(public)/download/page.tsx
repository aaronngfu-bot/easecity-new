import type { Metadata } from 'next'
import { DownloadPageClient } from './DownloadPageClient'

export const metadata: Metadata = {
  title: 'Download EC-Share',
  description:
    'Download EC-Share for Windows. Installer hosting and signed release artifacts are prepared for dl.easecity.hk.',
}

const defaultManifestUrl =
  process.env.NEXT_PUBLIC_EC_SHARE_DOWNLOAD_MANIFEST_URL ||
  'https://dl.easecity.hk/ec-share/windows/stable/latest.json'

const windowsInstallerUrl = process.env.NEXT_PUBLIC_EC_SHARE_WINDOWS_DOWNLOAD_URL

export default function DownloadPage() {
  return (
    <DownloadPageClient
      defaultManifestUrl={defaultManifestUrl}
      windowsInstallerUrl={windowsInstallerUrl}
    />
  )
}

export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { MediaLibrary } from './MediaLibrary'

export default async function AdminMediaPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.MEDIA</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">
          Page images
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          The photographs and the app icon on the product and services pages. Uploading replaces the
          shipped asset everywhere the slot is used, and the public pages update straight away.
        </p>
      </div>
      <MediaLibrary />
    </div>
  )
}

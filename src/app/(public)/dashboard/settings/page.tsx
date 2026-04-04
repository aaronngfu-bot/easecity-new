'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return (
      <div className="pt-20 flex justify-center">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSignOut = async () => {
    setLoading(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="space-y-6 pt-20">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-3">
          <Settings size={24} className="text-accent-cyan" />
          Account Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
          <h2 className="font-display text-sm font-semibold text-text-primary">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Name</p>
              <p className="text-sm text-text-primary">
                {session.user.name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Email</p>
              <p className="text-sm text-text-primary">{session.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Role</p>
              <p className="text-sm text-accent-cyan font-medium">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-red-500/15 bg-bg-surface space-y-4">
          <h2 className="font-display text-sm font-semibold text-red-400">
            Danger Zone
          </h2>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg',
              'border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            <LogOut size={16} />
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  )
}

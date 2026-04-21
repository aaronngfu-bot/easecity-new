'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function UserRoleForm({
  userId,
  currentRole,
  currentStatus,
  actorRole,
}: {
  userId: string
  currentRole: string
  currentStatus: string
  actorRole: string
}) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const actorIsSuper = actorRole === 'SUPER_ADMIN'
  const targetIsSuper = currentRole === 'SUPER_ADMIN'
  const canEditRoles = actorIsSuper || !targetIsSuper

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, status }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Updated successfully')
        router.refresh()
      } else {
        setMessage(data.error?.message || 'Update failed')
      }
    } catch {
      setMessage('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const selectClass = cn(
    'w-full px-3 py-2 rounded-lg border bg-bg-elevated text-text-primary text-sm',
    'border-border focus:border-accent-cyan/50 focus:outline-none focus:ring-1 focus:ring-accent-cyan/30',
    'transition-all'
  )

  return (
    <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
      <h2 className="font-display text-sm font-semibold text-text-primary">Manage User</h2>

      {!canEditRoles ? (
        <>
          <p className="text-xs text-text-muted rounded-lg border border-border bg-bg-elevated px-3 py-2">
            Only a super administrator can change roles or status for this account.
          </p>
          <div>
            <p className="text-xs text-text-muted mb-1">Role</p>
            <p className="text-sm text-text-primary font-mono">{currentRole}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Status</p>
            <p className="text-sm text-text-primary font-mono">{currentStatus}</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs text-text-muted mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={selectClass}
            >
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
              {actorIsSuper && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </>
      )}

      {message && (
        <p className={`text-xs ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={
          saving ||
          !canEditRoles ||
          (role === currentRole && status === currentStatus)
        }
        className={cn(
          'w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
          'bg-accent-cyan text-bg-base hover:bg-accent-cyan-light',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

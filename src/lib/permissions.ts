export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER'

const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: [
    'users:read', 'users:write', 'users:delete',
    'orders:read', 'orders:write', 'orders:refund',
    'contacts:read', 'contacts:write',
    'logs:read',
    'settings:read', 'settings:write',
    'admins:manage',
  ],
  ADMIN: [
    'users:read', 'users:write',
    'orders:read', 'orders:write', 'orders:refund',
    'contacts:read', 'contacts:write',
    'logs:read',
  ],
  MEMBER: [],
}

export function hasPermission(role: string, permission: string): boolean {
  const perms = PERMISSIONS[role as Role]
  if (!perms) return false
  return perms.includes(permission)
}

export function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN'
}

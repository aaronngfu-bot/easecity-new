import type { Metadata } from 'next'
import { AdminChrome } from '@/components/admin/AdminChrome'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin | EaseCity',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminChrome>{children}</AdminChrome>
}

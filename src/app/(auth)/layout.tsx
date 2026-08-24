import { SkipLink } from '@/components/a11y/SkipLink'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      <SkipLink />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute -top-[20%] left-1/2 h-[480px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--signal-soft)] blur-[120px]" />
      <main id="main" tabIndex={-1} className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}

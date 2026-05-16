export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="control-canvas relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 control-grid opacity-30" />
      <div className="absolute right-[-18%] top-[-18%] h-[520px] w-[520px] rounded-full bg-signal/10 blur-[140px]" />
      <div className="relative z-10 grid min-h-screen place-items-center px-5 py-12">
        <div className="w-full max-w-5xl">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <aside className="hidden lg:block">
              <div className="rounded-xl border border-border bg-bg-surface/90 p-6 shadow-panel">
                <div className="mb-10 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-signal/30 bg-signal/10">
                    <span className="h-2.5 w-2.5 rounded-full bg-signal shadow-glow-signal" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-[-0.03em] text-text-primary">
                      easecity
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                      secure control plane
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    ['AUTH', 'JWT session protected routes'],
                    ['BILLING', 'Stripe checkout and portal ready'],
                    ['DEVICE', 'Multi-endpoint stream control'],
                  ].map(([label, value]) => (
                    <div key={label} className="border-l border-signal/35 pl-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">{label}</p>
                      <p className="mt-1 text-sm text-text-secondary">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

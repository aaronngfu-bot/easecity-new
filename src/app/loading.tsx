export default function Loading() {
  return (
    <div className="control-canvas grid min-h-screen place-items-center">
      <div className="rounded-xl border border-border bg-bg-surface px-8 py-7 text-center shadow-panel">
        <div className="relative mx-auto mb-5 h-14 w-14">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute inset-2 rounded-full border border-signal/25" />
          <div className="absolute inset-0 rounded-full border-2 border-signal border-t-transparent animate-spin" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-glow-signal" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-signal">Acquiring signal</p>
        <p className="mt-2 text-xs text-text-muted">Loading the control plane…</p>
      </div>
    </div>
  )
}

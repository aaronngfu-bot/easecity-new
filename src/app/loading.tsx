export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-signal border-t-transparent animate-spin" />
        </div>
        <p className="text-signal/80 text-[11px] font-mono tracking-[0.25em] uppercase">Booting…</p>
      </div>
    </div>
  )
}

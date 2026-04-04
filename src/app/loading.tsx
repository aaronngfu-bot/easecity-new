export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
        </div>
        <p className="text-text-muted text-sm font-mono">Loading...</p>
      </div>
    </div>
  )
}

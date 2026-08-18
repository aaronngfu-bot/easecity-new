export default function DashboardLoading() {
  return (
    <div className="container-max animate-in fade-in duration-300">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-bg-elevated" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-bg-surface p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-bg-elevated" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-64 animate-pulse rounded-lg border border-border bg-bg-surface" />
    </div>
  )
}
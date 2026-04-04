import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="text-center px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-bg-surface border border-border mb-8">
          <span className="font-display text-3xl font-bold text-accent-cyan">
            404
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary text-sm max-w-sm mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm hover:shadow-glow-cyan"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

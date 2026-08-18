'use client'

/**
 * Animated auth background — layered grid + radial signal glow + slowly
 * drifting signal nodes. Pure CSS animation (no heavy runtime), theme-aware.
 */
export function LoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--bg-base)]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_20%,var(--signal-soft),transparent_65%)]" />

      {/* drifting satellite nodes */}
      <div className="auth-node auth-node-1" />
      <div className="auth-node auth-node-2" />
      <div className="auth-node auth-node-3" />
      <div className="auth-node auth-node-4" />
      <div className="auth-node auth-node-5" />
      <div className="auth-node auth-node-6" />

      <style jsx>{`
        .auth-node {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--signal);
          opacity: 0.35;
          filter: blur(0.5px);
          animation: auth-drift 14s ease-in-out infinite;
        }
        .auth-node-1 { top: 18%; left: 22%; animation-delay: 0s; }
        .auth-node-2 { top: 30%; right: 18%; animation-delay: -3s; }
        .auth-node-3 { bottom: 24%; left: 30%; animation-delay: -6s; }
        .auth-node-4 { bottom: 16%; right: 26%; animation-delay: -9s; }
        .auth-node-5 { top: 12%; left: 60%; animation-delay: -5s; }
        .auth-node-6 { top: 55%; left: 12%; animation-delay: -11s; }
        @keyframes auth-drift {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          25% { transform: translate(18px, -14px); opacity: 0.5; }
          50% { transform: translate(-10px, -24px); opacity: 0.3; }
          75% { transform: translate(14px, 10px); opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-node { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
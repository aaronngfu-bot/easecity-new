/**
 * Lightweight error tracking module.
 * Replace with Sentry SDK when ready:
 *   npm install @sentry/nextjs
 *   npx @sentry/wizard@latest -i nextjs
 */

interface ErrorContext {
  userId?: string
  action?: string
  metadata?: Record<string, unknown>
}

export function captureException(error: unknown, context?: ErrorContext) {
  const err = error instanceof Error ? error : new Error(String(error))

  // In production, send to your error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Replace with Sentry or similar
    // Sentry.captureException(err, { extra: context })
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      ...context,
      timestamp: new Date().toISOString(),
    })
  } else {
    console.error('[DEV ERROR]', err, context)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Replace with Sentry.captureMessage(message, level)
    console.log(`[${level.toUpperCase()}]`, message, new Date().toISOString())
  }
}

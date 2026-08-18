import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware is intentionally narrow: it ONLY guards /admin routes via a
 * cheap cookie presence check. Security headers are already applied to all
 * routes by the `headers()` block in next.config.mjs, so we do NOT repeat them
 * here — a wide matcher forces every page + API request through an extra Edge
 * function invocation (a measurable cold-start / TTFB cost on the dashboard,
 * login, and register pages).
 *
 * Auth for the dashboard itself is enforced server-side with
 * getServerSession() in the Node runtime (not here), which is the reliable path.
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__Secure-next-auth.session-token')
    ?? request.cookies.get('next-auth.session-token')

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
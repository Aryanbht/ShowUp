import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow onboarding page itself
    if (pathname === '/onboarding') {
      return NextResponse.next()
    }

    // If authenticated but not onboarded, redirect to onboarding (except for API routes)
    if (token && !token.onboarded && pathname !== '/onboarding' && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Allow public routes
        if (pathname === '/') return true
        if (pathname === '/about') return true
        // Allow API routes to handle authentication internally and return 401 JSON instead of redirecting
        if (pathname.startsWith('/api/')) return true
        // Allow static media files
        if (/\.(mp4|webm|ogg|mp3|wav|png|jpg|jpeg|svg|ico|gif|webp)$/i.test(pathname)) return true
        // All other pages need auth
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|frames|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
}

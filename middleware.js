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

    // If authenticated but not onboarded, redirect to onboarding
    if (token && !token.onboarded && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        // Allow public routes
        if (pathname === '/') return true
        if (pathname === '/about') return true
        if (pathname.startsWith('/api/auth')) return true
        // Allow static media files
        if (/\.(mp4|webm|ogg|mp3|wav|png|jpg|jpeg|svg|ico|gif|webp)$/i.test(pathname)) return true
        // All other routes need auth
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.mp4$|.*\\.webm$|.*\\.ico$).*)',
  ],
}

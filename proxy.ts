import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const pathname = request.nextUrl.pathname

  // Check if accessing admin dashboard without session
  if (pathname.startsWith('/admin/dashboard')) {
    if (!session) {
      // Clear any stale cookies
      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.delete('admin_session')
      return response
    }
  }

  // If accessing /admin with valid session, redirect to dashboard
  if (pathname === '/admin' && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

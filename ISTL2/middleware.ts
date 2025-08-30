import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Protect organizer routes
    if (path.startsWith('/organizer/')) {
      const organizerSlug = path.split('/')[2]
      
      // Check if user has access to this organizer
      const hasAccess = token.organizerIds?.some((org: any) => org.slug === organizerSlug)
      const isSuperAdmin = token.role === 'SUPER_ADMIN'
      
      if (!hasAccess && !isSuperAdmin) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    // Protect super admin routes
    if (path.startsWith('/super-admin/')) {
      if (token.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/organizer/:path*',
    '/super-admin/:path*',
    '/dashboard/:path*'
  ]
}

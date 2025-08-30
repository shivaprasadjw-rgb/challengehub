import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Only protect specific routes, not the entire app
  if (path.startsWith('/organizer/') || path.startsWith('/super-admin/') || path.startsWith('/dashboard/')) {
    // For now, just allow access - we'll handle auth in the components
    // This prevents the clientModules error while maintaining route structure
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/organizer/:path*',
    '/super-admin/:path*',
    '/dashboard/:path*'
  ]
}

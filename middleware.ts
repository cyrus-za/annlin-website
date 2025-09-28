import { NextRequest, NextResponse } from 'next/server'
import { auth } from './lib/auth'

// Define route patterns
const authRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/accept-invitation']

/**
 * Middleware to handle authentication and route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    })

    const isAuthenticated = !!session?.user
    const isAdmin = session?.user?.role === 'ADMIN'
    const isEditor = session?.user?.role === 'EDITOR' || isAdmin

    // Handle admin routes
    if (pathname.startsWith('/admin')) {
      if (!isAuthenticated) {
        // Redirect to sign-in with return URL
        const signInUrl = new URL('/auth/sign-in', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl)
      }

      // Check if user has sufficient permissions
      if (!isEditor) {
        // Redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Admin-specific routes (user management, system settings)
      const adminOnlyRoutes = [
        '/admin/users',
        '/admin/invitations',
        '/admin/settings'
      ]

      if (adminOnlyRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
      }
    }

    // Handle auth routes (sign-in, sign-up, etc.)
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (isAuthenticated) {
        // Redirect authenticated users away from auth pages
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
        const redirectUrl = callbackUrl && callbackUrl.startsWith('/') 
          ? callbackUrl 
          : '/admin'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    // Handle API routes protection
    if (pathname.startsWith('/api/')) {
      // Public API routes that don't require authentication
      const publicApiRoutes = [
        '/api/auth',
        '/api/contact',
        '/api/invitations/accept'
      ]

      const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

      if (!isPublicApiRoute) {
        if (!isAuthenticated) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Admin-only API routes
        const adminApiRoutes = [
          '/api/invitations',
          '/api/users'
        ]

        if (adminApiRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
    }

    // Allow all other requests to continue
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, allow public routes but block protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

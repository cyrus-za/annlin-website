import { NextRequest, NextResponse } from 'next/server'
import { auth } from './lib/auth'

// Define route patterns
const authRoutes = ['/auth/sign-in', '/auth/sign-up', '/auth/accept-invitation']

function privateApiError(error: string, status: number) {
  const response = NextResponse.json({ error }, { status })
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  return response
}

/**
 * Proxy to handle authentication and route protection.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    const isAdminRoute = pathname.startsWith('/admin')
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    const isApiRoute = pathname.startsWith('/api/')

    const isPublicReadApiRequest = request.method === 'GET' && (
      pathname === '/api/events' ||
      pathname.startsWith('/api/events/') ||
      pathname === '/api/diensgroepe' ||
      pathname.startsWith('/api/diensgroepe/') ||
      /^\/api\/leesstof\/[^/]+\/download$/.test(pathname) ||
      pathname.startsWith('/api/content-pages/public/')
    )

    const publicApiRoutes = [
      '/api/auth',
      '/api/contact',
      '/api/invitations/accept'
    ]

    const isPublicApiRoute =
      isPublicReadApiRequest ||
      publicApiRoutes.some(route => pathname.startsWith(route))

    if (!isAdminRoute && !isAuthRoute && (!isApiRoute || isPublicApiRoute)) {
      return NextResponse.next()
    }

    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    })

    const isAuthenticated = !!session?.user
    const isAdmin = session?.user?.role === 'ADMIN'
    const isEditor = session?.user?.role === 'EDITOR' || isAdmin

    // Handle admin routes
    if (isAdminRoute) {
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
        '/admin/settings',
        '/admin/voorstelle'
      ]

      if (adminOnlyRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
      }
    }

    // Handle auth routes (sign-in, sign-up, etc.)
    if (isAuthRoute) {
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
    if (isApiRoute) {
      if (!isPublicApiRoute) {
        if (!isAuthenticated) {
          return privateApiError('Authentication required', 401)
        }

        // Admin-only API routes
        const adminApiRoutes = [
          '/api/invitations',
          '/api/users',
          '/api/feature-requests/assignees'
        ]

        if (adminApiRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
          return privateApiError('Insufficient permissions', 403)
        }
      }
    }

    // Allow all other requests to continue
    return NextResponse.next()

  } catch (error) {
    console.error('Proxy error:', error)
    
    // On error, allow public routes but block protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
      if (pathname.startsWith('/api/')) {
        return privateApiError('Authentication service unavailable', 503)
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

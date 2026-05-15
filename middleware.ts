import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  /^\/auth\//,
  /^\/listings($|\?|\/)/,
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (typeof route === 'string') {
      return pathname === route
    }
    return route.test(pathname)
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('[Middleware] Checking route:', pathname)

  // Allow public routes without auth check
  if (isPublicRoute(pathname)) {
    console.log('[Middleware] Public route - allowing access')
    return NextResponse.next()
  }

  // For protected routes, check if user is authenticated
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('[Middleware] Auth check - user:', user ? user.id : 'null')

    // Redirect to login if not authenticated
    if (!user) {
      console.log('[Middleware] No user - redirecting to login')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    console.log('[Middleware] User authenticated - allowing access')
    return supabaseResponse
  } catch (error) {
    // If there's an error checking auth, redirect to login as a safety measure
    console.error('[Middleware] Auth check failed:', error)
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
  ],
}

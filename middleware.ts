import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for Supabase auth cookies instead of making API calls
  // This avoids DNS/network issues in Netlify edge functions
  // NOTE: This is a lightweight UX check only. Real authorization happens via:
  // 1. Server-side session validation in page components
  // 2. Supabase Row Level Security (RLS) policies on database
  // Cookies are validated when actual data fetches occur, not in middleware
  const accessToken = request.cookies.get('sb-access-token')
  const refreshToken = request.cookies.get('sb-refresh-token')

  // Alternative: check for the default Supabase cookie name pattern
  const supabaseCookies = request.cookies.getAll().filter(cookie =>
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  )

  const hasAuthCookie = accessToken || refreshToken || supabaseCookies.length > 0

  // Protected routes - require authentication
  const protectedPaths = ['/dashboard', '/courses', '/admin', '/mentor', '/student']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !hasAuthCookie) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

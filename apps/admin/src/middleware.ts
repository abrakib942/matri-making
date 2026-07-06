import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get cookies
  const userCookie = request.cookies.get('user');
  const accessTokenCookie = request.cookies.get('accessToken');
  const accessTypeCookie = request.cookies.get('accessType');

  // Check if user is authenticated (all three cookies must exist)
  const isAuthenticated = !!(userCookie && accessTokenCookie && accessTypeCookie);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login page, redirect to home
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

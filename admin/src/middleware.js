import { NextResponse } from 'next/server';
import { parse } from 'cookie';
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const cookieHeader = req.headers.get('cookie');
  const cookies = parse(cookieHeader || '');
  const adminAuthToken = cookies.adminAuthToken;

  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === '/auth/register';
  const isSignInPage = pathname === '/';

  // If user is already authenticated and tries to visit auth pages, redirect to dashboard
  if ((isAuthPage || isSignInPage) && adminAuthToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl.origin));
  }

  // Protect /admin routes: require adminAuthToken
  if (pathname.startsWith('/admin') && !adminAuthToken) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }

  // Everything else allowed
  return NextResponse.next();
}

// Optional: only apply middleware to specific routes
export const config = {
  matcher: ['/admin/:path*', '/auth/register', '/'],
};

// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Read cookies set after sign in
  const loggedIn = req.cookies.get('logged_in')?.value === 'true';
  const role = req.cookies.get('role')?.value; // 'admin' | 'member' | undefined

  // 🔒 Protect all /member routes (timeline, profile, messages, etc.)
  if (pathname.startsWith('/member')) {
    if (!loggedIn) {
      const loginUrl = new URL('/signin', req.url);
      loginUrl.searchParams.set('next', pathname); // optional: go back after sign in
      return NextResponse.redirect(loginUrl);
    }
  }

  // 🔒 Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Must be logged in
    if (!loggedIn) {
      const loginUrl = new URL('/signin', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Must be admin
    if (role !== 'admin') {
      // redirect non-admins somewhere safe
      const homeUrl = new URL('/member/timeline', req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// Tell Next which routes to run this on
export const config = {
  matcher: ['/member/:path*', '/admin/:path*'],
};

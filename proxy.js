import { NextResponse } from 'next/server';

export function proxy(req) {
  const { pathname } = req.nextUrl;

  const loggedIn = req.cookies.get('logged_in')?.value === 'true';
  const role = req.cookies.get('role')?.value;

  // 🔒 Only protect admin routes here
  if (pathname.startsWith('/admin')) {
    if (!loggedIn) {
      const loginUrl = new URL('/signin', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'admin') {
      const homeUrl = new URL('/member/timeline', req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // ✅ no /member here
};

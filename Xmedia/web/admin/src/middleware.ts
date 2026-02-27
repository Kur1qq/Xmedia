import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths through without auth check
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Check for admin_token cookie (set by client after login)
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT static files and API routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
    ],
};

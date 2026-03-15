import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set to true to enable maintenance mode, false to disable it
const MAINTENANCE_MODE = true;

export function middleware(request: NextRequest) {
    if (!MAINTENANCE_MODE) return NextResponse.next();

    const { pathname } = request.nextUrl;

    // Allow the maintenance page itself and static assets to load
    if (
        pathname.startsWith("/maintenance") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }

    // Redirect everything else to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

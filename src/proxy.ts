import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Proxy (Next.js 16 middleware).
 * Only responsibility: redirect unauthenticated users away from /dashboard.
 * Maintenance mode is handled server-side in MaintenanceGate (layout.tsx)
 * so it has direct DB access and no caching issues.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const sessionCookie = req.cookies.get("zippy_session");

  if (isProtected && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

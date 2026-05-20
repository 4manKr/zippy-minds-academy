import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

// Paths always allowed even in maintenance mode
const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/auth/admin-login",
  "/dashboard/admin",
  "/api/",          // ALL API routes bypass maintenance (never block server-side calls)
  "/_next",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Session guard: redirect unauthenticated users away from /dashboard ──
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const sessionCookie = req.cookies.get("zippy_session");

  if (isProtected && !sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Maintenance mode check ───────────────────────────────────────────────
  const isBypassed = MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p));
  if (!isBypassed) {
    try {
      const res = await fetch(`${req.nextUrl.origin}/api/maintenance-status`, {
        headers: { "x-proxy-check": "1" },
      });
      if (res.ok) {
        const data = await res.json() as { maintenance: boolean };
        if (data.maintenance) {
          return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      }
    } catch {
      // If check fails, allow through — don't block visitors on errors
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy on page routes only — skip API routes, static files, and images
     * so uploads and other API calls are never intercepted.
     */
    "/((?!api/|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
};

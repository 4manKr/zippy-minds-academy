import { NextRequest, NextResponse } from "next/server";

// Paths that are ALWAYS accessible — even in maintenance mode
const BYPASS_PREFIXES = [
  "/maintenance",
  "/auth/admin-login",
  "/dashboard/admin",
  "/api/maintenance-status",
  "/api/auth",
  "/_next",
  "/favicon",
  "/logo",
  "/zippy-logo",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow bypass paths
  if (BYPASS_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check maintenance mode via our lightweight API endpoint
  try {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/maintenance-status`, {
      headers: { "x-middleware-check": "1" },
      // No cache header — the API handles its own Cache-Control
    });
    if (res.ok) {
      const data = await res.json() as { maintenance: boolean };
      if (data.maintenance) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    }
  } catch {
    // If the check fails (cold start, etc.), allow through — don't block visitors
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - Static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
};

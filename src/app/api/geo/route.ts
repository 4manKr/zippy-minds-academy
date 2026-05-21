import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/geo
 * Returns { isIndia: boolean, country: string }
 *
 * Uses the client IP (x-forwarded-for / x-real-ip) and calls the
 * free ip-api.com endpoint (no key needed, 45 req/min on free tier).
 * Falls back to India on localhost / any error.
 */
export async function GET(req: NextRequest) {
  try {
    // --- Extract IP ---
    const xff    = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip     = xff?.split(",")[0]?.trim() ?? realIp ?? "127.0.0.1";

    // Localhost / private IP → default to India (dev environment)
    const isLocal =
      ip === "127.0.0.1" || ip === "::1" ||
      ip.startsWith("192.168.") || ip.startsWith("10.") ||
      ip.startsWith("172.16.") || ip.startsWith("172.17.") ||
      ip.startsWith("172.18.") || ip.startsWith("172.19.") ||
      ip.startsWith("172.2") || ip.startsWith("172.30.") || ip.startsWith("172.31.");

    if (isLocal) {
      return NextResponse.json({ isIndia: true, country: "IN" });
    }

    // --- Call ip-api.com (free, no key) ---
    const geoRes = await fetch(
      `http://ip-api.com/json/${ip}?fields=countryCode`,
      { next: { revalidate: 3600 } } // cache per-IP for 1 hour
    );

    if (geoRes.ok) {
      const data = await geoRes.json() as { countryCode?: string };
      const country = data.countryCode ?? "US";
      return NextResponse.json({ isIndia: country === "IN", country });
    }

    // Fallback: try ipapi.co
    const fallback = await fetch(`https://ipapi.co/${ip}/country/`, {
      next: { revalidate: 3600 },
    });
    if (fallback.ok) {
      const country = (await fallback.text()).trim();
      return NextResponse.json({ isIndia: country === "IN", country });
    }
  } catch {
    // Swallow all errors — just return neutral fallback
  }

  // Safe default: show USD (international) if detection fails
  return NextResponse.json({ isIndia: false, country: "US" });
}

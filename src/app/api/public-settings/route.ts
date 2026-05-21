import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public-settings
 * Returns only the safe, public-facing settings (no auth required).
 * Used by frontend pages to read things like showPricing.
 *
 * force-dynamic prevents Next.js from statically caching this route at
 * build time so admin toggles take effect immediately.
 */

// Opt out of all Next.js static / incremental caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PUBLIC_KEYS = ["showPricing"] as const;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const rows = await prisma.platformSetting.findMany({
      where: { key: { in: [...PUBLIC_KEYS] } },
    });
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Defaults for keys not yet stored
    return NextResponse.json(
      { showPricing: settings["showPricing"] ?? "true" },
      { headers: NO_CACHE_HEADERS },
    );
  } catch {
    // Fail open — show pricing if DB check fails
    return NextResponse.json(
      { showPricing: "true" },
      { headers: NO_CACHE_HEADERS },
    );
  }
}

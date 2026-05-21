import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/public-settings
 * Returns only the safe, public-facing settings (no auth required).
 * Used by frontend pages to read things like showPricing.
 */

const PUBLIC_KEYS = ["showPricing"] as const;

export async function GET() {
  try {
    const rows = await prisma.platformSetting.findMany({
      where: { key: { in: [...PUBLIC_KEYS] } },
    });
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // Defaults for keys not yet stored
    return NextResponse.json({
      showPricing: settings["showPricing"] ?? "true",
    });
  } catch {
    // Fail open — show pricing if DB check fails
    return NextResponse.json({ showPricing: "true" });
  }
}

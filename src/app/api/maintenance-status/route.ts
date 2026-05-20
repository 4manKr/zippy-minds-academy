import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight public endpoint — used by middleware to check maintenance mode
// Returns { maintenance: true/false }
export async function GET() {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "maintenanceMode" },
    });
    return NextResponse.json(
      { maintenance: setting?.value === "true" },
      {
        headers: {
          // Cache for 30 seconds to reduce DB load
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=10",
        },
      }
    );
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}

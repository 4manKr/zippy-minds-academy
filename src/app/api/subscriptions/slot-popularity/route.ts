import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.monthlySession.findMany({
      where: { status: "SCHEDULED" },
      select: { dayOfWeek: true, timeSlot: true },
    });

    const popularity: Record<string, number> = {};
    for (const s of sessions) {
      // Key by time slot only (sessions are now daily Mon-Fri)
      const key = s.timeSlot;
      popularity[key] = (popularity[key] ?? 0) + 1;
    }

    return NextResponse.json({ popularity });
  } catch {
    return NextResponse.json({ popularity: {} });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET — return all monthly availability records for the logged-in tutor
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.tutorMonthlyAvailability.findMany({
    where: { tutorId: session.userId },
    orderBy: { monthYear: "desc" },
  });

  return NextResponse.json({ availabilities: records });
}

// POST — create or update availability for a given month
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { monthYear, slots, timezone = "Asia/Kolkata" } = body as {
    monthYear: string;
    slots: Record<string, string[]>;
    timezone?: string;
  };

  if (!monthYear || !slots) {
    return NextResponse.json({ error: "monthYear and slots are required" }, { status: 400 });
  }

  const totalSlots = Object.values(slots).reduce((a, v) => a + (v?.length ?? 0), 0);
  if (totalSlots === 0) {
    return NextResponse.json({ error: "You must set at least one time slot." }, { status: 400 });
  }

  // Check if record already exists
  const existing = await prisma.tutorMonthlyAvailability.findFirst({
    where: { tutorId: session.userId, monthYear },
  });

  if (existing) {
    if (existing.isLocked) {
      return NextResponse.json(
        { error: "Availability is locked. Only admin can make changes." },
        { status: 403 },
      );
    }
    const updated = await prisma.tutorMonthlyAvailability.update({
      where: { id: existing.id },
      data: { slots: JSON.stringify(slots), timezone, isLocked: true },
    });
    return NextResponse.json({ availability: updated });
  }

  // Create new
  const created = await prisma.tutorMonthlyAvailability.create({
    data: {
      tutorId: session.userId,
      tutorName: session.name,
      monthYear,
      slots: JSON.stringify(slots),
      timezone,
      isLocked: true,
    },
  });

  return NextResponse.json({ availability: created });
}

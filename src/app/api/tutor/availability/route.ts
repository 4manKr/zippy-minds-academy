import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// ── helpers ───────────────────────────────────────────────────────────────────

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

/** YYYY-MM-DD for today in UTC */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Build a map of day → [protected time slots] for the given tutor.
 * A slot is protected if it has at least one future (non-cancelled) booking or
 * scheduled MonthlySession — meaning the tutor cannot remove it.
 */
async function getProtectedSlots(tutorName: string): Promise<Record<string, string[]>> {
  const today = todayISO();

  // Demo bookings that are pending or confirmed and on/after today
  const bookings = await prisma.booking.findMany({
    where: {
      tutorName,
      status:    { not: "CANCELLED" },
      date:      { gte: today },
    },
    select: { timeSlot: true, date: true },
  });

  // Enrolled sessions scheduled for today or later
  const sessions = await prisma.monthlySession.findMany({
    where: {
      tutorName,
      status: "SCHEDULED",
      date:   { gte: today },
    },
    select: { timeSlot: true, date: true, dayOfWeek: true },
  });

  // Build day → slot set
  const DAY_NUMS: Record<string, string> = {
    "0":"Sun","1":"Mon","2":"Tue","3":"Wed","4":"Thu","5":"Fri","6":"Sat",
  };

  const protected_: Record<string, Set<string>> = {};

  for (const b of bookings) {
    // derive day-of-week from the date string (handles "May 25, 2026" or "YYYY-MM-DD")
    const d = new Date(b.date);
    const day = DAY_NUMS[String(d.getDay())];
    if (!day) continue;
    if (!protected_[day]) protected_[day] = new Set();
    protected_[day].add(b.timeSlot);
  }

  for (const s of sessions) {
    // MonthlySession.date is always YYYY-MM-DD
    const d = new Date(s.date);
    const day = DAY_NUMS[String(d.getDay())];
    if (!day) continue;
    if (!protected_[day]) protected_[day] = new Set();
    protected_[day].add(s.timeSlot);
  }

  // Convert sets → arrays
  return Object.fromEntries(
    Object.entries(protected_).map(([day, set]) => [day, [...set]])
  );
}

// ── GET — return monthly availability records + protected slots ───────────────
export async function GET() {
  const session = await requireTutor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [records, protectedSlots] = await Promise.all([
    prisma.tutorMonthlyAvailability.findMany({
      where: { tutorId: session.userId },
      orderBy: { monthYear: "desc" },
    }),
    getProtectedSlots(session.name!),
  ]);

  return NextResponse.json({ availabilities: records, protectedSlots });
}

// ── POST — create or update availability for a given month ────────────────────
// Tutors can always edit; slots with active bookings/sessions cannot be removed.
export async function POST(req: NextRequest) {
  const session = await requireTutor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // ── Validate: protected slots cannot be removed ───────────────────────────
  const protectedSlots = await getProtectedSlots(session.name!);
  const conflicts: string[] = [];

  for (const [day, protectedList] of Object.entries(protectedSlots)) {
    const newDaySlots: string[] = slots[day] ?? [];
    for (const slot of protectedList) {
      if (!newDaySlots.includes(slot)) {
        conflicts.push(`${day} ${slot}`);
      }
    }
  }

  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot remove slots that already have scheduled sessions: ${conflicts.join(", ")}. Please keep these slots or contact admin.`,
        conflicts,
      },
      { status: 409 },
    );
  }

  // ── Upsert availability record ────────────────────────────────────────────
  const existing = await prisma.tutorMonthlyAvailability.findFirst({
    where: { tutorId: session.userId, monthYear },
  });

  if (existing) {
    // Allow tutor to update — no longer requires admin unlock
    const updated = await prisma.tutorMonthlyAvailability.update({
      where: { id: existing.id },
      data:  { slots: JSON.stringify(slots), timezone, isLocked: true },
    });
    return NextResponse.json({ availability: updated });
  }

  const created = await prisma.tutorMonthlyAvailability.create({
    data: {
      tutorId:   session.userId!,
      tutorName: session.name!,
      monthYear,
      slots:     JSON.stringify(slots),
      timezone,
      isLocked:  true,
    },
  });

  return NextResponse.json({ availability: created });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bookings/slots?date=2026-05-25&subject=Mathematics
 *
 * Returns every time slot that already has a confirmed/scheduled booking
 * for the given date + subject, along with the tutor name occupying it.
 *
 * Response: { booked: { "4:00 PM": "Tutor Name", ... } }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const isoDate = searchParams.get("date")    ?? ""; // YYYY-MM-DD
  const subject = searchParams.get("subject") ?? "";

  if (!isoDate || !subject) {
    return NextResponse.json({ booked: {} });
  }

  // Convert YYYY-MM-DD → "Month D, YYYY" (format used by demo Booking.date)
  const [y, m, d] = isoDate.split("-").map(Number);
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const fullDate = `${MONTHS[m - 1]} ${d}, ${y}`;

  // Demo bookings (date stored as "May 25, 2026")
  const demoBookings = await prisma.booking.findMany({
    where: { date: fullDate, subject, status: { not: "CANCELLED" } },
    select: { timeSlot: true, tutorName: true },
  });

  // Enrolled sessions (date stored as "YYYY-MM-DD")
  const monthlySessions = await prisma.monthlySession.findMany({
    where: { date: isoDate, subject, status: "SCHEDULED" },
    select: { timeSlot: true, tutorName: true },
  });

  // Merge: slot → first tutor found occupying it
  const booked: Record<string, string> = {};
  for (const b of [...demoBookings, ...monthlySessions]) {
    if (b.timeSlot && !booked[b.timeSlot]) {
      booked[b.timeSlot] = b.tutorName;
    }
  }

  return NextResponse.json({ booked });
}

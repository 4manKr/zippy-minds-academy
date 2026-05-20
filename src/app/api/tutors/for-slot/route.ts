import { NextRequest, NextResponse } from "next/server";
import { findBestTutor } from "@/lib/tutorAssignment";

/**
 * GET /api/tutors/for-slot?subject=Mathematics&timeSlot=4:00 PM&days=Mon,Wed,Fri
 *
 * Returns the highest-priority tutor for the given subject + slot + days.
 * Used by book-demo and subscribe pages to preview who will be assigned.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subject   = searchParams.get("subject")  ?? "";
  const timeSlot  = searchParams.get("timeSlot") ?? "";
  const daysParam = searchParams.get("days")     ?? "";
  const days = daysParam ? daysParam.split(",").filter(Boolean) : [];

  if (!subject) return NextResponse.json({ tutor: null });

  const tutor = await findBestTutor({ subject, timeSlot: timeSlot || undefined, days });
  return NextResponse.json({ tutor });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

// GET — all bookings where tutorName matches this tutor's name
export async function GET() {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await prisma.booking.findMany({
      where: { tutorName: session.name },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// PATCH — tutor can add notes to their own session
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, notes } = await req.json();

    // Verify the session belongs to this tutor
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tutorName: session.name },
    });
    if (!booking) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { notes: notes ?? "" },
    });
    return NextResponse.json({ session: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

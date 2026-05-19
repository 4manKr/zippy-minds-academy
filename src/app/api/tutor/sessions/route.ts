import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";

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

// PATCH — tutor actions on their own sessions:
//   action "accept"  → create Zoom meeting + set CONFIRMED
//   action "reject"  → set REJECTED
//   (no action)      → update notes
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { bookingId, action, notes } = body;

    // Verify the session belongs to this tutor
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tutorName: session.name },
    });
    if (!booking) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // ── Accept: generate Zoom + confirm ──────────────────────────────────
    if (action === "accept") {
      if (booking.status === "CONFIRMED") {
        return NextResponse.json({ error: "Already confirmed" }, { status: 400 });
      }

      const zoom = await createZoomMeeting({
        topic:    `Zippy Minds Demo — ${booking.subject} with ${booking.childName}`,
        date:     booking.date,
        timeSlot: booking.timeSlot,
        timezone: booking.timezone,
        duration: 30,
        agenda:   `Free demo session for ${booking.childName} (${booking.grade}) booked by ${booking.parentName}`,
      });

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status:        "CONFIRMED",
          zoomLink:      zoom?.joinUrl   ?? null,
          zoomStartUrl:  zoom?.startUrl  ?? null,
          zoomMeetingId: zoom?.meetingId ?? null,
        },
      });
      return NextResponse.json({ session: updated, zoomReady: !!zoom });
    }

    // ── Reject ────────────────────────────────────────────────────────────
    if (action === "reject") {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ session: updated });
    }

    // ── Notes update (default) ────────────────────────────────────────────
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { notes: notes ?? "" },
    });
    return NextResponse.json({ session: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

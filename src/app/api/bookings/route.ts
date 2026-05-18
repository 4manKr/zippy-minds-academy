import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";

// POST — create a new demo booking + auto-generate Zoom meeting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      childName, childAge, grade, timezone, subject,
      tutorName, tutorInitials, date, timeSlot,
      notes, monthlyPrice, parentName, parentEmail,
    } = body;

    if (!childName || !subject || !date || !timeSlot) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    // Get logged-in user if available
    const session = await getSession();
    const userId  = session.isLoggedIn ? session.userId : undefined;

    const resolvedParentName  = parentName  || session.name  || "Guest";
    const resolvedParentEmail = parentEmail || session.email || "guest@zippy.com";
    const resolvedTimezone    = timezone    || "Asia/Kolkata";

    // ── Step 1: Create the booking (without zoom link first) ───────────────
    const booking = await prisma.booking.create({
      data: {
        userId:        userId ?? null,
        parentName:    resolvedParentName,
        parentEmail:   resolvedParentEmail,
        childName,
        childAge:      childAge      || "",
        grade:         grade         || "",
        timezone:      resolvedTimezone,
        subject,
        tutorName:     tutorName     || "TBD",
        tutorInitials: tutorInitials || "??",
        date,
        timeSlot,
        notes:         notes         || "",
        monthlyPrice:  monthlyPrice  || 0,
        status:        "PENDING",
      },
    });

    // ── Step 2: Create Zoom meeting ────────────────────────────────────────
    const zoom = await createZoomMeeting({
      topic:    `Zippy Minds Demo — ${subject} with ${childName}`,
      date,
      timeSlot,
      timezone: resolvedTimezone,
      duration: 30, // free demo = 30 min
      agenda:   `Free demo session booked by ${resolvedParentName} for ${childName} (${grade})`,
    });

    // ── Step 3: Update booking with Zoom URLs if generated ─────────────────
    const updatedBooking = zoom
      ? await prisma.booking.update({
          where: { id: booking.id },
          data: {
            zoomLink:      zoom.joinUrl,
            zoomStartUrl:  zoom.startUrl,
            zoomMeetingId: zoom.meetingId,
            status:        "CONFIRMED",
          },
        })
      : booking; // keep PENDING if Zoom not configured yet

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      zoomReady: !!zoom,
    });
  } catch (err) {
    console.error("bookings POST error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// GET — fetch bookings for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where:   { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

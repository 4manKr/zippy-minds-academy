import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendSessionConfirmedEmail, sendSessionCancelledEmail } from "@/lib/emails";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, status, tutorName, tutorInitials } = body;

    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

    // Fetch the booking first (needed for Zoom + validation)
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Build update payload — only include provided fields
    const data: Record<string, unknown> = {};
    if (status        !== undefined) data.status        = status;
    if (tutorName     !== undefined) data.tutorName     = tutorName;
    if (tutorInitials !== undefined) data.tutorInitials = tutorInitials;

    // When admin manually assigns a tutor, clear the needsAdmin flag
    if (tutorName !== undefined && tutorName !== "") {
      data.needsAdmin = false;
    }

    // When confirming, create a Zoom meeting (same as tutor accept flow)
    if (status === "CONFIRMED" && booking.status !== "CONFIRMED") {
      const zoom = await createZoomMeeting({
        topic:    `Zippy Minds Demo — ${booking.subject} with ${booking.childName}`,
        date:     booking.date,
        timeSlot: booking.timeSlot,
        timezone: booking.timezone,
        duration: 30,
        agenda:   `Free demo session for ${booking.childName} (${booking.grade ?? ""}) booked by ${booking.parentName}`,
      });
      if (zoom) {
        data.zoomLink      = zoom.joinUrl;
        data.zoomStartUrl  = zoom.startUrl;
        data.zoomMeetingId = zoom.meetingId;
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data,
    });

    // ── Fire emails based on the new status ──────────────────────────────────
    if (status === "CONFIRMED" && booking.status !== "CONFIRMED") {
      sendSessionConfirmedEmail({
        parentName:  updated.parentName,
        parentEmail: updated.parentEmail,
        childName:   updated.childName,
        subject:     updated.subject,
        grade:       updated.grade      || "",
        date:        updated.date,
        timeSlot:    updated.timeSlot,
        timezone:    updated.timezone,
        tutorName:   updated.tutorName,
        zoomLink:    updated.zoomLink,
      });
    }

    if (status === "CANCELLED" && booking.status !== "CANCELLED") {
      sendSessionCancelledEmail({
        parentName:  updated.parentName,
        parentEmail: updated.parentEmail,
        childName:   updated.childName,
        subject:     updated.subject,
        date:        updated.date,
        timeSlot:    updated.timeSlot,
      });
    }

    return NextResponse.json({ booking: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

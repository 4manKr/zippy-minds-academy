import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendDemoBookedEmail, sendAdminNewBookingAlert, sendTutorNewRequestEmail } from "@/lib/emails";
import { findBestTutor } from "@/lib/tutorAssignment";

// POST — create a new demo booking + auto-generate Zoom meeting
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      childName, childAge, grade, timezone, subject,
      tutorName, tutorInitials, date, timeSlot,
      notes, monthlyPrice, parentName, parentEmail, otp, whatsappNumber,
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

    // ── One free demo per email ───────────────────────────────────────────
    const existing = await prisma.booking.findFirst({
      where: { parentEmail: resolvedParentEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already booked a free demo session. Please check your dashboard or contact support to schedule more sessions." },
        { status: 409 }
      );
    }

    // ── Verify OTP if provided (guest booking) ────────────────────────────
    if (otp && !session.isLoggedIn) {
      const record = await prisma.otpCode.findFirst({
        where: { email: resolvedParentEmail, code: otp, used: false },
        orderBy: { createdAt: "desc" },
      });
      if (!record) return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
      if (new Date() > record.expiresAt) return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
      await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });
    }

    // ── Server-side priority-based tutor assignment ───────────────────────
    // Ignore whatever tutorName the client sent; find the best available tutor.
    // dayShort: derive day-of-week from the booking date string (e.g. "May 25, 2026")
    const bookingDateObj = new Date(date);
    const dayShorts = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const bookingDay = dayShorts[bookingDateObj.getDay()];

    const bestTutor = await findBestTutor({
      subject,
      timeSlot,
      days: [bookingDay],
    });
    const assignedName     = bestTutor?.name     ?? tutorName     ?? "TBD";
    const assignedInitials = bestTutor?.initials ?? tutorInitials ?? "??";

    // ── Create the booking — always PENDING until tutor accepts ──────────
    // Zoom link is generated only when the tutor confirms via their dashboard.
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
        tutorName:     assignedName,
        tutorInitials: assignedInitials,
        date,
        timeSlot,
        notes:           notes           || "",
        whatsappNumber:  whatsappNumber  || "",
        monthlyPrice:    monthlyPrice    || 0,
        status:        "PENDING",
      },
    });

    // Fire-and-forget: email parent + admin immediately
    sendDemoBookedEmail({
      parentName:  resolvedParentName,
      parentEmail: resolvedParentEmail,
      childName,
      subject,
      grade:       grade    || "",
      date,
      timeSlot,
      timezone:    resolvedTimezone,
      tutorName:   tutorName || "Being assigned…",
    });
    sendAdminNewBookingAlert({
      id:          booking.id,
      parentName:  resolvedParentName,
      parentEmail: resolvedParentEmail,
      childName,
      subject,
      grade:       grade    || "",
      date,
      timeSlot,
      timezone:    resolvedTimezone,
      tutorName:   tutorName || "TBD",
    });

    // Notify the assigned tutor (if we have their email)
    if (assignedName && assignedName !== "TBD") {
      prisma.user.findFirst({ where: { name: assignedName, role: "TUTOR" }, select: { email: true } })
        .then(tutor => {
          if (tutor?.email) {
            sendTutorNewRequestEmail({
              tutorName:   assignedName,
              tutorEmail:  tutor.email,
              parentName:  resolvedParentName,
              parentEmail: resolvedParentEmail,
              childName,
              subject,
              grade:       grade || "",
              date,
              timeSlot,
              timezone:    resolvedTimezone,
            });
          }
        }).catch(() => {});
    }

    return NextResponse.json({
      success:   true,
      booking,
      zoomReady: false,
    });
  } catch (err) {
    console.error("bookings POST error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// PATCH — cancel / update a booking (owner only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { bookingId, status } = await req.json();
    if (!bookingId || !status) {
      return NextResponse.json({ error: "bookingId and status required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.booking.findFirst({
      where: { id: bookingId, userId: session.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
    return NextResponse.json({ booking: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
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

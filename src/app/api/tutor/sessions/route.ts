import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendSessionConfirmedEmail, sendTutorSessionConfirmedEmail } from "@/lib/emails";

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

// GET — bookings + monthly (enrolled) sessions for this tutor
export async function GET() {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Demo bookings
    const bookings = await prisma.booking.findMany({
      where: { tutorName: session.name },
      orderBy: { createdAt: "desc" },
    });

    // Enrolled course sessions (MonthlySession)
    const monthlySessions = await prisma.monthlySession.findMany({
      where: { tutorName: session.name },
      orderBy: { date: "asc" },
    });

    // Map MonthlySession → same shape as Booking so the dashboard can render them uniformly
    const mappedMonthly = monthlySessions.map(ms => ({
      id:           ms.id,
      childName:    ms.childName,
      subject:      ms.subject,
      date:         ms.date,
      timeSlot:     ms.timeSlot,
      status:       ms.status,          // SCHEDULED | COMPLETED | CANCELLED
      monthlyPrice: 0,
      zoomLink:     ms.zoomLink,
      zoomStartUrl: ms.zoomStartUrl,
      parentName:   ms.parentName,
      parentEmail:  ms.parentEmail,
      notes:        "",
      createdAt:    ms.createdAt.toISOString(),
      tutorName:    ms.tutorName,
      grade:        ms.grade,
      sessionType:  "enrollment" as const,  // flag so UI can distinguish
      sessionNumber: ms.sessionNumber,
      enrollmentId:  ms.enrollmentId,
    }));

    // Merge: demo bookings first, then enrolled sessions
    const sessions = [
      ...bookings.map(b => ({ ...b, sessionType: "booking" as const })),
      ...mappedMonthly,
    ];

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// PATCH — tutor actions on their own sessions:
//   action "accept"  → create Zoom meeting + set CONFIRMED
//   action "reject"  → cascade to next available tutor; escalate to admin if none
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

      // Notify parent immediately
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
      // Also notify the tutor with their host (start) URL
      prisma.user.findFirst({ where: { name: updated.tutorName, role: "TUTOR" }, select: { email: true } })
        .then(t => {
          if (t?.email) {
            sendTutorSessionConfirmedEmail({
              tutorName:   updated.tutorName,
              tutorEmail:  t.email,
              parentName:  updated.parentName,
              childName:   updated.childName,
              subject:     updated.subject,
              grade:       updated.grade || "",
              date:        updated.date,
              timeSlot:    updated.timeSlot,
              timezone:    updated.timezone,
              zoomStartUrl: updated.zoomStartUrl,
              zoomLink:    updated.zoomLink,
            });
          }
        }).catch(() => {});

      return NextResponse.json({ session: updated, zoomReady: !!zoom });
    }

    // ── Reject: cascade to next available tutor ───────────────────────────
    if (action === "reject") {
      // Build the declined list, add the current tutor
      const declinedList: string[] = (() => {
        try { return JSON.parse(booking.declinedTutors || "[]") as string[]; } catch { return []; }
      })();
      if (!declinedList.includes(session.name!)) declinedList.push(session.name!);

      // Find next approved tutor for this subject, not already declined
      const allTutors = await prisma.user.findMany({
        where: { role: "TUTOR", approvalStatus: "APPROVED" },
        select: { id: true, name: true, subjects: true },
      });

      const nextTutor = allTutors.find((t) => {
        if (declinedList.includes(t.name)) return false;
        try {
          const subjectList: string[] = JSON.parse(t.subjects || "[]");
          return subjectList.includes(booking.subject);
        } catch { return false; }
      }) ?? null;

      if (nextTutor) {
        // Reassign to next tutor — parent still sees "Pending"
        const initials = nextTutor.name
          .split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase().slice(0, 2);

        const updated = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            tutorName:      nextTutor.name,
            tutorInitials:  initials,
            declinedTutors: JSON.stringify(declinedList),
            status:         "PENDING",
            needsAdmin:     false,
          },
        });
        return NextResponse.json({ session: updated, reassigned: true });
      }

      // No tutor available — escalate to admin, parent still sees "Pending"
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          declinedTutors: JSON.stringify(declinedList),
          needsAdmin:     true,
          tutorName:      "",   // unassigned until admin acts
          tutorInitials:  "",
          status:         "PENDING",
        },
      });
      return NextResponse.json({ session: updated, needsAdmin: true });
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

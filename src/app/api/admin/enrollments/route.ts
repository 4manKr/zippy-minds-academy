import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";

export const runtime = "nodejs";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Generate N extra Mon-Fri weekday dates starting the day after lastDate */
function generateExtraWeekdays(lastDate: string, count: number): string[] {
  const [y, m, d] = lastDate.split("-").map(Number);
  const dates: string[] = [];
  const cur = new Date(y, m - 1, d + 1);
  while (dates.length < count) {
    const day = cur.getDay();
    if (day >= 1 && day <= 5) dates.push(toDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sessions: { orderBy: { date: "asc" } },
      },
    });

    return NextResponse.json({ enrollments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { enrollmentId, extraDays } = await req.json();
    if (!enrollmentId || !extraDays || Number(extraDays) < 1)
      return NextResponse.json({ error: "Missing enrollmentId or extraDays" }, { status: 400 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { sessions: { orderBy: { date: "desc" }, take: 1 } },
    });
    if (!enrollment)
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

    // Find the last session date
    const lastDate = enrollment.sessions[0]?.date ?? enrollment.endDate;

    // Generate extra weekday dates
    const newDates = generateExtraWeekdays(lastDate, Number(extraDays));
    if (newDates.length === 0)
      return NextResponse.json({ error: "No new dates generated" }, { status: 400 });

    // Count existing sessions for numbering
    const existingCount = await prisma.monthlySession.count({ where: { enrollmentId } });

    // Create new session records with Zoom meetings
    const newSessions = [];
    for (let i = 0; i < newDates.length; i++) {
      const date = newDates[i];
      const zoom = await createZoomMeeting({
        topic:    `Zippy Minds — ${enrollment.subject} with ${enrollment.childName}`,
        date,
        timeSlot: enrollment.timeSlot,
        timezone: enrollment.timezone,
        duration: 45,
        agenda:   `Session ${existingCount + i + 1} for ${enrollment.childName} — ${enrollment.subject}`,
      });

      const ms = await prisma.monthlySession.create({
        data: {
          paymentId:     enrollment.paymentId ?? null,
          enrollmentId,
          parentEmail:   enrollment.parentEmail,
          parentName:    enrollment.parentName,
          childName:     enrollment.childName,
          subject:       enrollment.subject,
          grade:         "",
          dayOfWeek:     "Mon-Fri",
          date,
          timeSlot:      enrollment.timeSlot,
          timezone:      enrollment.timezone,
          sessionNumber: existingCount + i + 1,
          zoomLink:      zoom?.joinUrl   ?? null,
          zoomStartUrl:  zoom?.startUrl  ?? null,
          zoomMeetingId: zoom?.meetingId ?? null,
          status:        "SCHEDULED",
        },
      });
      newSessions.push(ms);
    }

    // Update enrollment endDate, totalSessions, re-activate if COMPLETED
    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        endDate:       newDates[newDates.length - 1],
        totalSessions: { increment: newDates.length },
        status:        "ACTIVE",
      },
    });

    return NextResponse.json({ enrollment: updated, addedSessions: newSessions.length });
  } catch (err) {
    console.error("[admin/enrollments PATCH]", err);
    return NextResponse.json({ error: "Failed to extend enrollment" }, { status: 500 });
  }
}

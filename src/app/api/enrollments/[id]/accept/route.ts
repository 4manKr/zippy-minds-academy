import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendEnrollmentAcceptedEmail } from "@/lib/emails";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: enrollmentId } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { sessions: { orderBy: { date: "asc" } } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update enrollment status
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { tutorStatus: "ACCEPTED" },
  });

  // Create Zoom meetings for sessions that don't have one yet
  for (const s of enrollment.sessions) {
    if (!s.zoomLink) {
      try {
        const zoom = await createZoomMeeting({
          topic:    `Zippy Minds — ${enrollment.courseName} with ${enrollment.childName}`,
          date:     s.date,
          timeSlot: enrollment.timeSlot,
          timezone: enrollment.timezone,
          duration: 60,
        });
        if (zoom) {
          await prisma.monthlySession.update({
            where: { id: s.id },
            data: {
              zoomLink:      zoom.joinUrl,
              zoomStartUrl:  zoom.startUrl,
              zoomMeetingId: zoom.meetingId,
            },
          });
        }
      } catch {
        // non-fatal
      }
    }
  }

  // Send confirmation email to parent
  sendEnrollmentAcceptedEmail({
    parentName:    enrollment.parentName,
    parentEmail:   enrollment.parentEmail,
    childName:     enrollment.childName,
    courseName:    enrollment.courseName,
    tutorName:     enrollment.tutorName,
    days:          enrollment.dayOfWeek,
    timeSlot:      enrollment.timeSlot,
    timezone:      enrollment.timezone,
    totalSessions: enrollment.totalSessions,
    firstDate:     enrollment.startDate,
  }).catch(() => {});

  return NextResponse.json({ success: true });
}

// GET: tutor or admin can see enrollment details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { sessions: { orderBy: { date: "asc" }, take: 5 } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ enrollment });
}

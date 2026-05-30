import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTutorCourseWiseNotificationEmail } from "@/lib/emails";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { tutorId, tutorName } = await req.json();
  if (!tutorName) {
    return NextResponse.json({ error: "tutorName required" }, { status: 400 });
  }

  const initials =
    tutorName
      .split(" ")
      .map((w: string) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  // Find tutor user by ID to get email
  const tutorUser = tutorId
    ? await prisma.user.findUnique({
        where: { id: tutorId },
        select: { email: true, name: true },
      })
    : null;

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      tutorId:       tutorId ?? "",
      tutorName,
      tutorInitials: initials,
      tutorStatus:   "PENDING",
    },
  });

  // Update all sessions
  await prisma.monthlySession.updateMany({
    where: { enrollmentId: id },
    data: { tutorName, tutorInitials: initials },
  });

  // Notify new tutor
  if (tutorUser?.email) {
    sendTutorCourseWiseNotificationEmail({
      tutorName,
      tutorEmail:    tutorUser.email,
      parentName:    enrollment.parentName,
      parentEmail:   enrollment.parentEmail,
      childName:     enrollment.childName,
      courseName:    enrollment.courseName,
      days:          enrollment.dayOfWeek,
      timeSlot:      enrollment.timeSlot,
      timezone:      enrollment.timezone,
      classType:     "Group",
      totalSessions: enrollment.totalSessions,
      enrollmentId:  enrollment.id,
    }).catch(() => {});
  }

  return NextResponse.json({ enrollment });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET  /api/admin/tutor-priority
 *   Returns all approved tutors ordered by tutorPriority ASC.
 *
 * PATCH /api/admin/tutor-priority
 *   Body: { tutorId: string, priority: number }
 *   Sets tutorPriority for the given tutor.
 */

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", approvalStatus: "APPROVED" },
    select: {
      id: true, name: true, email: true,
      subjects: true, tutorPriority: true,
    },
    orderBy: [{ tutorPriority: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    tutors: tutors.map(t => ({
      ...t,
      subjects: (() => { try { return JSON.parse(t.subjects || "[]"); } catch { return []; } })(),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tutorId, priority } = body as { tutorId?: string; priority?: unknown };

  if (!tutorId || typeof priority !== "number" || priority < 1) {
    return NextResponse.json(
      { error: "tutorId and priority (positive integer) are required" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: tutorId },
    data:  { tutorPriority: Math.floor(priority) },
  });

  return NextResponse.json({ success: true });
}

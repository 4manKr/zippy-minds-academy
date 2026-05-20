import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required — returns platform-level counts
export async function GET() {
  try {
    const [parents, tutors, sessions, courses] = await Promise.all([
      prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { role: "TUTOR", approvalStatus: "APPROVED" } }),
      prisma.booking.count(),
      prisma.course.count({ where: { status: "active" } }),
    ]);

    return NextResponse.json({ parents, tutors, sessions, courses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

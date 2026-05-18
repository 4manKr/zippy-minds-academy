import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

// GET — all tutor accounts with their approval status
export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, approvalStatus: true, createdAt: true },
    });
    return NextResponse.json({ tutors });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

// PATCH — approve or reject a tutor
export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tutorId, approvalStatus } = await req.json();
    if (!["APPROVED", "REJECTED", "PENDING"].includes(approvalStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: tutorId },
      data: { approvalStatus },
      select: { id: true, name: true, email: true, approvalStatus: true },
    });
    return NextResponse.json({ tutor: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update tutor" }, { status: 500 });
  }
}

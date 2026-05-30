import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      tutorName:   session.name ?? "",
      tutorStatus: "PENDING",
      status:      "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ enrollments });
}

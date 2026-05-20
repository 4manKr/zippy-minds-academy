import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const enrollments = await prisma.enrollment.findMany({
      where: { parentEmail: session.email ?? "" },
      orderBy: { createdAt: "desc" },
      include: {
        sessions: {
          orderBy: { date: "asc" },
        },
      },
    });

    return NextResponse.json({ enrollments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

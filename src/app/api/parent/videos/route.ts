import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const videos = await prisma.videoLesson.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required — returns all active courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

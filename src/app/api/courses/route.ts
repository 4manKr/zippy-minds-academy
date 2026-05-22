import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — returns active course names for the booking form subject picker
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where:   { status: "active" },
      select:  { name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ subjects: courses.map((c) => c.name) });
  } catch {
    return NextResponse.json({ subjects: [] }, { status: 500 });
  }
}

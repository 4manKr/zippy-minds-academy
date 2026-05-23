import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — returns active subject names for the booking form subject picker.
// Subjects are the top-level headers (e.g. "Mathematics").
// Falls back to active Course names if no Subjects exist yet.
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where:   { status: "active" },
      select:  { name: true },
      orderBy: { name: "asc" },
    });

    if (subjects.length > 0) {
      return NextResponse.json({ subjects: subjects.map((s) => s.name) });
    }

    // Fallback: no subjects created yet — use active course names
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

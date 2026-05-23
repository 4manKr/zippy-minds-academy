import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — used by:
//   1. /courses page  → full course objects (sorted by sortOrder)
//   2. /book-demo     → subject name list (subjects[])
export async function GET() {
  try {
    // Full active courses sorted by sortOrder then name
    const courses = await prisma.course.findMany({
      where:   { status: "active" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    // Active subject names (for the booking-form subject picker)
    const subjects = await prisma.subject.findMany({
      where:   { status: "active" },
      select:  { name: true },
      orderBy: { name: "asc" },
    });

    const subjectNames = subjects.length > 0
      ? subjects.map((s) => s.name)
      : courses.map((c) => c.name);

    return NextResponse.json({ courses, subjects: subjectNames });
  } catch {
    return NextResponse.json({ courses: [], subjects: [] }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — returns approved tutors with the subjects they teach
// Derived from their real booking history
export async function GET() {
  try {
    // Fetch all approved tutors
    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR", approvalStatus: "APPROVED" },
      select: { id: true, name: true, email: true },
      orderBy: { createdAt: "asc" },
    });

    // Fetch all bookings to derive which subjects each tutor has taught
    const bookings = await prisma.booking.findMany({
      select: { tutorName: true, subject: true },
    });

    // Build a map: tutorName → Set of subjects
    const subjectsByTutor: Record<string, Set<string>> = {};
    for (const b of bookings) {
      if (!subjectsByTutor[b.tutorName]) subjectsByTutor[b.tutorName] = new Set();
      subjectsByTutor[b.tutorName].add(b.subject);
    }

    // Build a map: subject → first available tutor (for book-demo auto-assignment)
    const tutorBySubject: Record<string, { id: string; name: string; initials: string }> = {};
    for (const tutor of tutors) {
      const subjects = subjectsByTutor[tutor.name] ?? new Set();
      for (const subject of subjects) {
        if (!tutorBySubject[subject]) {
          tutorBySubject[subject] = {
            id:       tutor.id,
            name:     tutor.name,
            initials: tutor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          };
        }
      }
    }

    // Also return the full list (with subjects array) for admin/tutor use
    const tutorList = tutors.map(t => ({
      id:       t.id,
      name:     t.name,
      email:    t.email,
      initials: t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      subjects: [...(subjectsByTutor[t.name] ?? [])],
    }));

    return NextResponse.json({ tutors: tutorList, tutorBySubject });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — returns approved tutors with the subjects they teach.
// Subject → tutor mapping priority:
//   1. Tutor's declared subjects (User.subjects JSON array) — set via profile
//   2. Subjects derived from past booking history (fallback for tutors with no declared subjects)
export async function GET() {
  try {
    // Fetch all approved tutors (include their declared subjects)
    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR", approvalStatus: "APPROVED" },
      select: { id: true, name: true, email: true, subjects: true },
      orderBy: { createdAt: "asc" },
    });

    // Parse each tutor's declared subjects
    const declaredByTutor: Record<string, Set<string>> = {};
    for (const t of tutors) {
      try {
        const arr: string[] = JSON.parse(t.subjects ?? "[]");
        if (Array.isArray(arr) && arr.length > 0) {
          declaredByTutor[t.name] = new Set(arr);
        }
      } catch { /* ignore parse errors */ }
    }

    // Fetch booking history to build fallback subject sets for tutors without declared subjects
    const bookings = await prisma.booking.findMany({
      select: { tutorName: true, subject: true },
    });
    const historyByTutor: Record<string, Set<string>> = {};
    for (const b of bookings) {
      if (!historyByTutor[b.tutorName]) historyByTutor[b.tutorName] = new Set();
      historyByTutor[b.tutorName].add(b.subject);
    }

    // Merge: declared subjects take priority; fall back to booking history
    const subjectsByTutor: Record<string, Set<string>> = {};
    for (const t of tutors) {
      subjectsByTutor[t.name] = declaredByTutor[t.name] ?? historyByTutor[t.name] ?? new Set();
    }

    // Build a map: subject → first available tutor (for book-demo auto-assignment)
    const tutorBySubject: Record<string, { id: string; name: string; initials: string }> = {};
    for (const tutor of tutors) {
      const subjects = subjectsByTutor[tutor.name];
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

    // Full list (with subjects array) for admin/tutor use
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

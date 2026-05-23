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
      select: { id: true, name: true, subjects: true, availability: true }, // email intentionally excluded — public endpoint
      orderBy: { createdAt: "asc" },
    });

    // Fetch TutorMonthlyAvailability for this month + next two months
    const now = new Date();
    const relevantMonths = [0, 1, 2].map(offset => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    const monthlyRecords = await prisma.tutorMonthlyAvailability.findMany({
      where: { monthYear: { in: relevantMonths } },
      orderBy: { monthYear: "asc" }, // earlier month first → prefer current month
    });
    // Build map: tutorId → union of slots across all relevant months.
    // A slot is available if the tutor declared it in ANY of the relevant months.
    const monthlySlotsByTutorId: Record<string, Record<string, string[]>> = {};
    for (const rec of monthlyRecords) {
      try {
        const parsed = JSON.parse(rec.slots) as Record<string, string[]>;
        if (!parsed || typeof parsed !== "object") continue;

        if (!monthlySlotsByTutorId[rec.tutorId]) {
          monthlySlotsByTutorId[rec.tutorId] = {};
        }
        const merged = monthlySlotsByTutorId[rec.tutorId];
        for (const [day, slots] of Object.entries(parsed)) {
          if (!Array.isArray(slots)) continue;
          if (!merged[day]) merged[day] = [];
          for (const slot of slots) {
            if (!merged[day].includes(slot)) merged[day].push(slot);
          }
        }
      } catch { /* skip malformed record */ }
    }

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

    // Build availability per tutor: monthly record takes priority over User.availability
    const availabilityByTutor: Record<string, Record<string, string[]>> = {};
    for (const t of tutors) {
      if (monthlySlotsByTutorId[t.id]) {
        // Use the monthly availability (set via tutor dashboard monthly system)
        availabilityByTutor[t.name] = monthlySlotsByTutorId[t.id];
      } else {
        // Fall back to the legacy User.availability weekly schedule
        try {
          const av = JSON.parse(t.availability ?? "{}");
          availabilityByTutor[t.name] = (av && typeof av === "object") ? av : {};
        } catch { availabilityByTutor[t.name] = {}; }
      }
    }

    // Build a map: subject → merged availability across ALL tutors for that subject.
    // Slot is available if ANY tutor for the subject teaches at that time.
    // Name/initials come from the tutor with the most declared slots (best representative).
    const tutorBySubject: Record<string, { id: string; name: string; initials: string; availability: Record<string, string[]> }> = {};

    for (const tutor of tutors) {
      const subjects = subjectsByTutor[tutor.name];
      const avail    = availabilityByTutor[tutor.name] ?? {};

      for (const subject of subjects) {
        if (!tutorBySubject[subject]) {
          // First tutor for this subject — initialise entry
          tutorBySubject[subject] = {
            id:           tutor.id,
            name:         tutor.name,
            initials:     tutor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
            availability: {},
          };
        }

        // Union: merge this tutor's slots into the subject's availability map
        const merged = tutorBySubject[subject].availability;
        for (const [day, slots] of Object.entries(avail)) {
          if (!Array.isArray(slots)) continue;
          if (!merged[day]) merged[day] = [];
          for (const slot of slots) {
            if (!merged[day].includes(slot)) merged[day].push(slot);
          }
        }

        // Prefer the tutor with more total declared slots as the display representative
        const currentTotalSlots = Object.values(tutorBySubject[subject].availability)
          .reduce((sum, s) => sum + s.length, 0);
        const thisTutorSlots    = Object.values(avail).reduce((sum, s) => sum + s.length, 0);
        if (thisTutorSlots > currentTotalSlots) {
          tutorBySubject[subject].id       = tutor.id;
          tutorBySubject[subject].name     = tutor.name;
          tutorBySubject[subject].initials = tutor.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
        }
      }
    }

    // Full list (with subjects array) for admin/tutor use
    const tutorList = tutors.map(t => ({
      id:           t.id,
      name:         t.name,
      // email is deliberately NOT included — this is a public endpoint
      initials:     t.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      subjects:     [...(subjectsByTutor[t.name] ?? [])],
      availability: availabilityByTutor[t.name] ?? {},
    }));

    return NextResponse.json({ tutors: tutorList, tutorBySubject });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

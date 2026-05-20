/**
 * Shared tutor-assignment logic.
 * Picks the highest-priority approved tutor who:
 *   1. Teaches the requested subject
 *   2. Has declared availability at the requested timeSlot on the requested days
 *      (or has NO declared availability at all → treated as always available)
 *   3. Is not in the excludeNames list (already declined)
 */
import { prisma } from "@/lib/prisma";

export interface TutorCandidate {
  id:       string;
  name:     string;
  initials: string;
  email:    string | null;
  priority: number;
}

export async function findBestTutor(params: {
  subject:      string;
  timeSlot?:    string;           // e.g. "4:00 PM"
  days?:        string[];         // e.g. ["Mon","Wed","Fri"]
  excludeNames?: string[];        // tutors who have already declined
}): Promise<TutorCandidate | null> {
  const { subject, timeSlot, days = [], excludeNames = [] } = params;

  // Fetch all approved tutors ordered by priority (lower number = first)
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", approvalStatus: "APPROVED" },
    select: {
      id: true, name: true, email: true,
      subjects: true, availability: true, tutorPriority: true,
    },
    orderBy: [{ tutorPriority: "asc" }, { createdAt: "asc" }],
  });

  // Build union monthly availability per tutorId (current + next 2 months)
  const now = new Date();
  const relevantMonths = [0, 1, 2].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const monthlyRecords = await prisma.tutorMonthlyAvailability.findMany({
    where: { monthYear: { in: relevantMonths } },
  });
  const monthlyAvail: Record<string, Record<string, string[]>> = {};
  for (const rec of monthlyRecords) {
    try {
      const parsed = JSON.parse(rec.slots) as Record<string, string[]>;
      if (!monthlyAvail[rec.tutorId]) monthlyAvail[rec.tutorId] = {};
      const merged = monthlyAvail[rec.tutorId];
      for (const [day, slots] of Object.entries(parsed)) {
        if (!Array.isArray(slots)) continue;
        if (!merged[day]) merged[day] = [];
        for (const slot of slots) {
          if (!merged[day].includes(slot)) merged[day].push(slot);
        }
      }
    } catch { /* skip */ }
  }

  for (const tutor of tutors) {
    if (excludeNames.includes(tutor.name)) continue;

    // Subject check
    let subjectMatch = false;
    try {
      const list: string[] = JSON.parse(tutor.subjects || "[]");
      subjectMatch = list.includes(subject);
    } catch {}
    if (!subjectMatch) continue;

    // Availability check — only applies when both timeSlot and days are provided
    if (timeSlot && days.length > 0) {
      const avail: Record<string, string[]> =
        monthlyAvail[tutor.id] ??
        (() => { try { return JSON.parse(tutor.availability || "{}"); } catch { return {}; } })();

      const hasAnyAvail = Object.values(avail).some(
        (v): v is string[] => Array.isArray(v) && v.length > 0
      );

      if (hasAnyAvail) {
        // Strict: tutor must be available at timeSlot on EVERY selected day
        const ok = days.every(day => {
          const daySlots: string[] = avail[day] ?? [];
          return daySlots.length > 0 && daySlots.includes(timeSlot);
        });
        if (!ok) continue;
      }
      // If hasAnyAvail=false → availability not set up yet → treat as available
    }

    return {
      id:       tutor.id,
      name:     tutor.name,
      email:    tutor.email,
      initials: tutor.name
        .split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2),
      priority: tutor.tutorPriority,
    };
  }

  return null;
}

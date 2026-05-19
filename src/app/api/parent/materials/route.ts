import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — materials visible to this parent's children
// Rules:
//   visibility = "individual" → show only to the exact student named
//   visibility = "all"        → show to ALL students of that tutor (if parent has a booking with that tutor)
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all bookings for this parent
    const bookings = await prisma.booking.findMany({
      where: { parentEmail: session.email },
      select: { childName: true, tutorName: true },
    });

    if (bookings.length === 0) {
      return NextResponse.json({ materials: [] });
    }

    const childNames  = [...new Set(bookings.map(b => b.childName))];
    const tutorNames  = [...new Set(bookings.map(b => b.tutorName))];

    // Fetch materials matching either rule
    const materials = await prisma.tutorMaterial.findMany({
      where: {
        OR: [
          // Individual: material is addressed to one of this parent's children
          { visibility: "individual", studentName: { in: childNames } },
          // All-students: tutor posted to all, and this parent has a booking with that tutor
          { visibility: "all", tutorName: { in: tutorNames } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

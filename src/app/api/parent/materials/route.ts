import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — materials uploaded by tutors for this parent's children
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all bookings for this parent to know which child names belong to them
    const bookings = await prisma.booking.findMany({
      where: { parentEmail: session.email },
      select: { childName: true },
    });

    const childNames = [...new Set(bookings.map(b => b.childName))];

    if (childNames.length === 0) {
      return NextResponse.json({ materials: [] });
    }

    const materials = await prisma.tutorMaterial.findMany({
      where: { studentName: { in: childNames } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

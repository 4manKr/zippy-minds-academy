import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET — return all TutorMonthlyAvailability records (admin only)
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const availabilities = await prisma.tutorMonthlyAvailability.findMany({
    orderBy: [{ monthYear: "desc" }, { tutorName: "asc" }],
  });

  return NextResponse.json({ availabilities });
}

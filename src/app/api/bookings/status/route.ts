import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — returns { hasDemo: boolean } for the currently logged-in user.
// Used client-side to swap "Book Free Demo" → "Enroll Now" across the site.
export async function GET() {
  try {
    const session = await getSession();

    // Not logged in → no demo booked (guest can still book)
    if (!session.isLoggedIn || !session.email) {
      return NextResponse.json({ hasDemo: false });
    }

    const booking = await prisma.booking.findFirst({
      where: { parentEmail: session.email },
      select: { id: true },
    });

    return NextResponse.json({ hasDemo: !!booking });
  } catch {
    return NextResponse.json({ hasDemo: false });
  }
}

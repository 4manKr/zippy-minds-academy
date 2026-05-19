import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — check whether a given email already has a demo booking
// Used client-side before sending OTP so the user gets early feedback
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const booking = await prisma.booking.findFirst({
      where: { parentEmail: email.trim().toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!booking });
  } catch {
    // On any error just return false so the user can proceed (server-side check is the real guard)
    return NextResponse.json({ exists: false });
  }
}

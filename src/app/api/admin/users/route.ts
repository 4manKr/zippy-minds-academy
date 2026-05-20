import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json() as { userId?: string; action?: string; email?: string };
    const { userId, action, email } = body;

    // ── Reset Demo: delete all bookings for a given email ──────────────────
    if (action === "reset-demo") {
      if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
      const deleted = await prisma.booking.deleteMany({ where: { parentEmail: email } });
      return NextResponse.json({ success: true, deletedBookings: deleted.count });
    }

    // ── Delete User ────────────────────────────────────────────────────────
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Detach bookings before deleting (userId is optional in schema — set to null)
    await prisma.booking.updateMany({ where: { userId }, data: { userId: null } });
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin users DELETE error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

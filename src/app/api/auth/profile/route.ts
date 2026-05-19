import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — full profile from DB (includes phone, joinedAt)
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, subjects: true, createdAt: true },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH — update name and/or phone
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, subjects } = await req.json();

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name     !== undefined && name !== "" && { name }),
        ...(phone    !== undefined && { phone }),
        // subjects is a JSON array string like '["Mathematics","Science"]'
        ...(subjects !== undefined && { subjects: JSON.stringify(subjects) }),
      },
    });

    // Sync new name to session cookie
    if (name && name !== session.name) {
      session.name = name;
      await session.save();
    }

    return NextResponse.json({
      user: {
        id:       updated.id,
        name:     updated.name,
        email:    updated.email,
        phone:    updated.phone,
        role:     updated.role,
        subjects: (() => { try { return JSON.parse(updated.subjects); } catch { return []; } })(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

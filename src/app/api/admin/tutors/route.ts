import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

// GET — all tutor accounts with their approval status + subjects
export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tutors = await prisma.user.findMany({
      where: { role: "TUTOR" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, approvalStatus: true, subjects: true, createdAt: true },
    });
    // Parse subjects JSON for each tutor
    const parsed = tutors.map(t => ({
      ...t,
      subjects: (() => { try { return JSON.parse(t.subjects ?? "[]"); } catch { return []; } })(),
    }));
    return NextResponse.json({ tutors: parsed });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tutors" }, { status: 500 });
  }
}

// POST — create a new tutor account
export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email, phone, password, subjects, approvalStatus } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const tutor = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashed,
        role: "TUTOR",
        subjects: JSON.stringify(Array.isArray(subjects) ? subjects : []),
        approvalStatus: approvalStatus ?? "PENDING",
      },
      select: { id: true, name: true, email: true, phone: true, approvalStatus: true, subjects: true, createdAt: true },
    });

    return NextResponse.json({
      tutor: {
        ...tutor,
        subjects: (() => { try { return JSON.parse(tutor.subjects ?? "[]"); } catch { return []; } })(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to create tutor" }, { status: 500 });
  }
}

// PATCH — approve/reject OR edit tutor details (name, phone, subjects, approvalStatus)
export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tutorId, approvalStatus, name, phone, subjects } = await req.json();

    if (!tutorId) return NextResponse.json({ error: "tutorId required" }, { status: 400 });

    // Build update payload — only include provided fields
    const data: Record<string, unknown> = {};
    if (approvalStatus !== undefined) {
      if (!["APPROVED", "REJECTED", "PENDING"].includes(approvalStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.approvalStatus = approvalStatus;
    }
    if (name !== undefined)     data.name    = name;
    if (phone !== undefined)    data.phone   = phone || null;
    if (subjects !== undefined) data.subjects = JSON.stringify(Array.isArray(subjects) ? subjects : []);

    const updated = await prisma.user.update({
      where: { id: tutorId },
      data,
      select: { id: true, name: true, email: true, phone: true, approvalStatus: true, subjects: true, createdAt: true },
    });

    return NextResponse.json({
      tutor: {
        ...updated,
        subjects: (() => { try { return JSON.parse(updated.subjects ?? "[]"); } catch { return []; } })(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update tutor" }, { status: 500 });
  }
}

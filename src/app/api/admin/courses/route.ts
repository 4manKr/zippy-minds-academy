import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

// GET — return subjects (with their courses) + standalone courses
export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [subjects, courses] = await Promise.all([
      prisma.subject.findMany({
        orderBy: { name: "asc" },
        include: { courses: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      }),
      prisma.course.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { subject: { select: { id: true, name: true, color: true } } },
      }),
    ]);

    return NextResponse.json({ subjects, courses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ── Create Subject ──────────────────────────────────────────────────────
    if (body.type === "subject") {
      const { name, ageGroup, totalDuration, color } = body;
      if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
      const subject = await prisma.subject.create({
        data: {
          name,
          ageGroup:      ageGroup      ?? "",
          totalDuration: totalDuration ?? "",
          color:         color         ?? "",
        },
      });
      return NextResponse.json({ subject });
    }

    // ── Create Course ───────────────────────────────────────────────────────
    const {
      name, description, thumbnail, subjectId, ageRange, teacherName, showTeacher,
      rating, price, priceUSD, durationValue, durationUnit, sessionsPerWeek, sortOrder,
    } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const course = await prisma.course.create({
      data: {
        name,
        description:     description     ?? "",
        thumbnail:       thumbnail       ?? "",
        subjectId:       subjectId       || null,
        ageRange:        ageRange        ?? "",
        teacherName:     teacherName     ?? "",
        showTeacher:     showTeacher     ?? false,
        rating:          rating          ?? 0,
        price:           price           ?? 199,
        priceUSD:        priceUSD        ?? 15,
        durationValue:   durationValue   ?? 1,
        durationUnit:    durationUnit    ?? "months",
        sessionsPerWeek: sessionsPerWeek ?? 1,
        sortOrder:       sortOrder       ?? 0,
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ── Update Subject ──────────────────────────────────────────────────────
    if (body.type === "subject") {
      const { subjectId, name, ageGroup, totalDuration, color, status } = body;
      const updated = await prisma.subject.update({
        where: { id: subjectId },
        data: {
          ...(name          !== undefined && name && { name }),
          ...(ageGroup      !== undefined && { ageGroup }),
          ...(totalDuration !== undefined && { totalDuration }),
          ...(color         !== undefined && { color }),
          ...(status        !== undefined && { status }),
        },
        include: { courses: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      });
      return NextResponse.json({ subject: updated });
    }

    // ── Update Course ───────────────────────────────────────────────────────
    const {
      courseId, name, description, thumbnail, subjectId, ageRange, teacherName,
      showTeacher, rating, price, priceUSD, durationValue, durationUnit,
      sessionsPerWeek, sortOrder, status,
    } = body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(name            !== undefined && name && { name }),
        ...(description     !== undefined && { description }),
        ...(thumbnail       !== undefined && { thumbnail }),
        ...(subjectId       !== undefined && { subjectId: subjectId || null }),
        ...(ageRange        !== undefined && { ageRange }),
        ...(teacherName     !== undefined && { teacherName }),
        ...(showTeacher     !== undefined && { showTeacher }),
        ...(rating          !== undefined && { rating }),
        ...(price           !== undefined && price && { price }),
        ...(priceUSD        !== undefined && priceUSD && { priceUSD }),
        ...(durationValue   !== undefined && { durationValue }),
        ...(durationUnit    !== undefined && { durationUnit }),
        ...(sessionsPerWeek !== undefined && { sessionsPerWeek }),
        ...(sortOrder       !== undefined && { sortOrder }),
        ...(status          !== undefined && { status }),
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    return NextResponse.json({ course: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.type === "subject") {
      await prisma.course.updateMany({
        where: { subjectId: body.subjectId },
        data: { subjectId: null },
      });
      await prisma.subject.delete({ where: { id: body.subjectId } });
      return NextResponse.json({ success: true });
    }

    await prisma.course.delete({ where: { id: body.courseId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

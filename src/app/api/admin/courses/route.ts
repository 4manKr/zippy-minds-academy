import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const courses = await prisma.course.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name, description, price } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const course = await prisma.course.create({ data: { name, description: description ?? "", price: price ?? 199 } });
    return NextResponse.json({ course });
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId, status, name, description, price } = await req.json();
    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { ...(status && { status }), ...(name && { name }), ...(description !== undefined && { description }), ...(price && { price }) },
    });
    return NextResponse.json({ course: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId } = await req.json();
    await prisma.course.delete({ where: { id: courseId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

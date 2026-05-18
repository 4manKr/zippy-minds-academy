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
    const resources = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, type, subject, size, icon, url } = await req.json();
    if (!title || !subject) return NextResponse.json({ error: "Title and subject required" }, { status: 400 });
    const resource = await prisma.resource.create({
      data: { title, type: type ?? "PDF", subject, size: size ?? "", icon: icon ?? "📄", url: url ?? "" },
    });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { resourceId, ...data } = await req.json();
    const updated = await prisma.resource.update({ where: { id: resourceId }, data });
    return NextResponse.json({ resource: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { resourceId } = await req.json();
    await prisma.resource.delete({ where: { id: resourceId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}

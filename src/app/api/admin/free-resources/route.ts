import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

// GET — all resources (admin sees draft + published)
export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const resources = await prisma.freeResource.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — create
export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, description, fileUrl, fileType, fileSize, thumbnail, category, tags, status } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const resource = await prisma.freeResource.create({
      data: {
        title:       title.trim(),
        description: description ?? "",
        fileUrl:     fileUrl     ?? "",
        fileType:    fileType    ?? "",
        fileSize:    fileSize    ?? "",
        thumbnail:   thumbnail   ?? "",
        category:    category    ?? "Other",
        tags:        JSON.stringify(Array.isArray(tags) ? tags : []),
        status:      status      ?? "draft",
      },
    });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// PATCH — update
export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, title, description, fileUrl, fileType, fileSize, thumbnail, category, tags, status } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const resource = await prisma.freeResource.update({
      where: { id },
      data: {
        ...(title       !== undefined && title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(fileUrl     !== undefined && { fileUrl }),
        ...(fileType    !== undefined && { fileType }),
        ...(fileSize    !== undefined && { fileSize }),
        ...(thumbnail   !== undefined && { thumbnail }),
        ...(category    !== undefined && { category }),
        ...(tags        !== undefined && { tags: JSON.stringify(Array.isArray(tags) ? tags : []) }),
        ...(status      !== undefined && { status }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ resource });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.freeResource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

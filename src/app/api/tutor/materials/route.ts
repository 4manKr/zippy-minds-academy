import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { del } from "@vercel/blob";

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

// GET — all materials uploaded by this tutor
export async function GET() {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const materials = await prisma.tutorMaterial.findMany({
      where: { tutorName: session.name },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

// POST — create a material record (after file is uploaded via /upload)
export async function POST(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { studentName, subject, title, fileUrl, fileType, fileSize, notes, visibility } = await req.json();

    if (!title || !fileUrl) {
      return NextResponse.json({ error: "title and fileUrl are required" }, { status: 400 });
    }

    const vis = visibility === "all" ? "all" : "individual";

    // If individual, studentName is required
    if (vis === "individual" && !studentName?.trim()) {
      return NextResponse.json({ error: "studentName is required for individual visibility" }, { status: 400 });
    }

    const material = await prisma.tutorMaterial.create({
      data: {
        tutorName:   session.name ?? "",
        tutorEmail:  session.email ?? "",
        studentName: vis === "all" ? "" : (studentName?.trim() ?? ""),
        subject:     subject?.trim()   ?? "",
        title:       title.trim(),
        fileUrl,
        fileType:    fileType   ?? "PDF",
        fileSize:    fileSize   ?? "",
        notes:       notes?.trim() ?? "",
        visibility:  vis,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save material" }, { status: 500 });
  }
}

// DELETE — remove a material (only tutor who uploaded it)
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { materialId } = await req.json();

    const existing = await prisma.tutorMaterial.findFirst({
      where: { id: materialId, tutorName: session.name },
    });
    if (!existing) return NextResponse.json({ error: "Material not found" }, { status: 404 });

    // Delete blob from Vercel Blob storage
    try { await del(existing.fileUrl); } catch { /* blob may already be gone */ }

    await prisma.tutorMaterial.delete({ where: { id: materialId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}

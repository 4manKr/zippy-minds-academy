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
    const videos = await prisma.videoLesson.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, subject, duration, thumbnail, videoUrl } = await req.json();
    if (!title || !subject) return NextResponse.json({ error: "Title and subject required" }, { status: 400 });
    const video = await prisma.videoLesson.create({
      data: { title, subject, duration: duration ?? "", thumbnail: thumbnail ?? "📹", videoUrl: videoUrl ?? "" },
    });
    return NextResponse.json({ video });
  } catch {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { videoId, ...data } = await req.json();
    const updated = await prisma.videoLesson.update({ where: { id: videoId }, data });
    return NextResponse.json({ video: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { videoId } = await req.json();
    await prisma.videoLesson.delete({ where: { id: videoId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

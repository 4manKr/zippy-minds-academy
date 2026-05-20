import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deleteFile } from "@/lib/fileStorage";

// GET — fetch recordings visible to the current user
// Admin: all recordings
// Tutor: recordings they uploaded
// Parent: recordings for their children (individual) or their tutors' "all" recordings
export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "ADMIN") {
      const recordings = await prisma.recordedSession.findMany({ orderBy: { createdAt: "desc" } });
      return NextResponse.json({ recordings });
    }

    if (session.role === "TUTOR") {
      const recordings = await prisma.recordedSession.findMany({
        where: { tutorName: session.name },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ recordings });
    }

    // PARENT: get their children's recordings
    const bookings = await prisma.booking.findMany({
      where: { parentEmail: session.email },
      select: { childName: true, tutorName: true },
    });
    const childNames = [...new Set(bookings.map(b => b.childName))];
    const tutorNames = [...new Set(bookings.map(b => b.tutorName))];

    if (childNames.length === 0) {
      return NextResponse.json({ recordings: [] });
    }

    const recordings = await prisma.recordedSession.findMany({
      where: {
        OR: [
          { visibility: "individual", studentName: { in: childNames } },
          { visibility: "all", tutorName: { in: tutorNames } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ recordings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
  }
}

// POST — admin or tutor can upload a recording
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !["ADMIN", "TUTOR"].includes(session.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, subject, studentName, tutorName, videoUrl, duration, fileSize, visibility } = await req.json();

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "title and videoUrl are required" }, { status: 400 });
    }

    const vis = visibility === "all" ? "all" : "individual";

    const recording = await prisma.recordedSession.create({
      data: {
        title:          title.trim(),
        description:    description?.trim()  ?? "",
        subject:        subject?.trim()      ?? "",
        studentName:    vis === "all" ? "" : (studentName?.trim() ?? ""),
        tutorName:      tutorName?.trim()    ?? (session.role === "TUTOR" ? session.name ?? "" : ""),
        videoUrl:       videoUrl.trim(),
        duration:       duration?.trim()     ?? "",
        fileSize:       fileSize?.trim()     ?? "",
        uploadedBy:     session.name         ?? "",
        uploadedByRole: session.role         ?? "TUTOR",
        visibility:     vis,
      },
    });

    return NextResponse.json({ recording }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save recording" }, { status: 500 });
  }
}

// DELETE — admin only
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can delete recordings" }, { status: 403 });
    }

    const { recordingId } = await req.json();
    const existing = await prisma.recordedSession.findUnique({ where: { id: recordingId } });
    if (!existing) return NextResponse.json({ error: "Recording not found" }, { status: 404 });

    // Delete stored file
    await deleteFile(existing.videoUrl);

    await prisma.recordedSession.delete({ where: { id: recordingId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete recording" }, { status: 500 });
  }
}

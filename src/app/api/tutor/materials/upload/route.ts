import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { storeFile } from "@/lib/fileStorage";

// Force Node.js runtime — required for filesystem access (fs/promises)
export const runtime = "nodejs";

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Could not parse uploaded file. Please try again." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate type
    const allowedTypes = [
      "application/pdf",
      "image/png", "image/jpeg", "image/gif", "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed. Please use PDF, Word, PPT or images.` },
        { status: 400 }
      );
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File is too large. Maximum size is 10 MB." }, { status: 400 });
    }

    const folder = `tutor-materials/${session.userId ?? "unknown"}`;
    const { url, size } = await storeFile(file, folder);

    return NextResponse.json({ url, size, name: file.name, type: file.type });
  } catch (err) {
    console.error("[tutor/materials/upload] error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}

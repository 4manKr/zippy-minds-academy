import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/session";

async function requireTutor() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "TUTOR") return null;
  return session;
}

// POST — upload a file to Vercel Blob, return the public URL
export async function POST(req: NextRequest) {
  try {
    const session = await requireTutor();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

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
      return NextResponse.json({ error: "File type not allowed. Use PDF, Word, PPT or images." }, { status: 400 });
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 10 MB." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobPath = `tutor-materials/${session.userId ?? "unknown"}/${Date.now()}-${safeName}`;

    const blob = await put(blobPath, file, { access: "public" });

    // Human-readable file size
    const kb = file.size / 1024;
    const sizeStr = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;

    return NextResponse.json({
      url: blob.url,
      size: sizeStr,
      name: file.name,
      type: file.type,
    });
  } catch (err) {
    console.error("[materials/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

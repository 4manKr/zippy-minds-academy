import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { storeFile } from "@/lib/fileStorage";

export const runtime = "nodejs";

// 50 MB limit for free resources
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin())
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // 50 MB hard cap
    if (file.size > 50 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 413 });

    const { url, size } = await storeFile(file, "free-resources");

    return NextResponse.json({
      url,
      size,
      name: file.name,
      type: file.type,
    });
  } catch (err) {
    console.error("upload-resource error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

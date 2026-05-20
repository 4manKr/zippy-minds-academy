import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { storeFile } from "@/lib/fileStorage";

// POST — upload a video/recording file
// Accessible by admin and tutor only
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !["ADMIN", "TUTOR"].includes(session.role ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = [
      "video/mp4", "video/webm", "video/ogg", "video/quicktime",
      "video/x-msvideo", "video/mpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only video files are allowed (MP4, WebM, MOV, etc.)" },
        { status: 400 }
      );
    }

    // Max 500 MB
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 500 MB." }, { status: 400 });
    }

    const folder = `recordings/${session.userId ?? "unknown"}`;
    const { url, size } = await storeFile(file, folder);

    return NextResponse.json({ url, size, name: file.name });
  } catch (err) {
    console.error("[recordings/upload]", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

/** Guess a file extension from a MIME type. */
function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "application/zip": "zip",
    "application/x-zip-compressed": "zip",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/msword": "doc",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.ms-excel": "xls",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "text/plain": "txt",
  };
  return map[mime] ?? "file";
}

/** Sanitise a title so it's safe as a filename. */
function safeFilename(title: string, mime: string, url: string): string {
  // Try to extract extension from the original URL first
  const urlPath = url.split("?")[0];
  const urlExt  = urlPath.includes(".") ? urlPath.split(".").pop()?.toLowerCase() : null;
  const ext     = (urlExt && urlExt.length <= 5) ? urlExt : mimeToExt(mime);

  const base = title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")  // remove illegal chars
    .replace(/\s+/g, "_")
    .slice(0, 100)
    .trim() || "resource";

  return `${base}.${ext}`;
}

// GET /api/free-resources/download?id=xxx  (login required)
export async function GET(req: NextRequest) {
  try {
    // ── Auth check ───────────────────────────────────────────────────────────
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Login required to download" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // ── Fetch record ─────────────────────────────────────────────────────────
    // Use findFirst — findUnique only accepts unique-indexed fields in where,
    // so compound { id, status } can behave unexpectedly with the libSQL adapter.
    const resource = await prisma.freeResource.findFirst({
      where: { id, status: "published" },
    });
    if (!resource)          return NextResponse.json({ error: "Not found" },         { status: 404 });
    if (!resource.fileUrl)  return NextResponse.json({ error: "No file attached" }, { status: 404 });

    // ── Increment download counter (fire-and-forget) ─────────────────────────
    prisma.freeResource.update({
      where: { id },
      data:  { downloads: { increment: 1 } },
    }).catch(() => {});

    // ── Proxy the file from storage ──────────────────────────────────────────
    const upstream = await fetch(resource.fileUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "File unavailable from storage" }, { status: 502 });
    }

    // Safety: if Cloudinary returned an HTML / JSON error page, bail out
    const upstreamContentType = upstream.headers.get("content-type") ?? "";
    if (upstreamContentType.includes("text/html") || upstreamContentType.includes("application/json")) {
      return NextResponse.json({ error: "File unavailable from storage" }, { status: 502 });
    }

    // Prefer the MIME type we saved; fall back to what upstream reports
    const contentType = resource.fileType || upstreamContentType || "application/octet-stream";
    const filename    = safeFilename(resource.title, contentType, resource.fileUrl);

    // Stream the upstream body straight back to the client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":        contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control":       "private, no-store",
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (err) {
    console.error("download proxy error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

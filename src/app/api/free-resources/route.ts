import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET — list published resources (or single by id)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const resource = await prisma.freeResource.findUnique({
        where: { id, status: "published" },
      });
      return NextResponse.json({ resource });
    }

    const resources = await prisma.freeResource.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true,
        fileType: true, fileSize: true, thumbnail: true,
        category: true, tags: true, downloads: true, createdAt: true,
        // fileUrl intentionally omitted from list — only returned on download
      },
    });
    return NextResponse.json({ resources });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — increment download count + return fileUrl (requires login)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Login required to download" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const resource = await prisma.freeResource.findUnique({
      where: { id, status: "published" },
    });
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!resource.fileUrl) return NextResponse.json({ error: "No file available" }, { status: 404 });

    // Increment download counter (fire-and-forget — don't block response)
    prisma.freeResource.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ url: resource.fileUrl, name: resource.title, type: resource.fileType });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

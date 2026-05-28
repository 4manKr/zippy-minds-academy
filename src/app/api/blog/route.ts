import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — returns all published blogs (or single by slug)
export async function GET(req: NextRequest) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");

    if (slug) {
      const post = await prisma.blog.findUnique({
        where: { slug, status: "published" },
      });
      if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ post });
    }

    const posts = await prisma.blog.findMany({
      where:   { status: "published" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        thumbnail: true, author: true, tags: true, createdAt: true,
      },
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [], error: "Failed to fetch" }, { status: 500 });
  }
}

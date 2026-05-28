import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "ADMIN") return null;
  return session;
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

// GET — all blogs (admin sees draft + published)
export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const posts = await prisma.blog.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST — create new blog post
export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, slug, content, excerpt, thumbnail, author, tags, status } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const finalSlug = (slug?.trim() || toSlug(title)) + "-" + Date.now().toString(36);
    const post = await prisma.blog.create({
      data: {
        title:     title.trim(),
        slug:      finalSlug,
        content:   content   ?? "",
        excerpt:   excerpt   ?? "",
        thumbnail: thumbnail ?? "",
        author:    author    ?? "",
        tags:      JSON.stringify(Array.isArray(tags) ? tags : []),
        status:    status    ?? "draft",
      },
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// PATCH — update blog post
export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, title, slug, content, excerpt, thumbnail, author, tags, status } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const post = await prisma.blog.update({
      where: { id },
      data: {
        ...(title     !== undefined && title && { title: title.trim() }),
        ...(slug      !== undefined && slug  && { slug:  slug.trim()  }),
        ...(content   !== undefined && { content }),
        ...(excerpt   !== undefined && { excerpt }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(author    !== undefined && { author }),
        ...(tags      !== undefined && { tags: JSON.stringify(Array.isArray(tags) ? tags : []) }),
        ...(status    !== undefined && { status }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove blog post
export async function DELETE(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

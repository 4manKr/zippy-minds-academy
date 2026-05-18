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
    const rows = await prisma.platformSetting.findMany();
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json() as Record<string, string>;

    // Upsert each key
    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.platformSetting.upsert({
          where:  { key },
          update: { value: String(value) },
          create: { id: `ps_${key}`, key, value: String(value) },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

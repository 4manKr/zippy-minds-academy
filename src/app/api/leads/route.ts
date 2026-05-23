import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// POST /api/leads — public, saves a lead from the popup
export async function POST(req: NextRequest) {
  try {
    const { name, whatsapp, page } = await req.json();

    if (!name?.trim() || !whatsapp?.trim()) {
      return NextResponse.json({ error: "Name and WhatsApp number are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        id:       cuid(),
        name:     name.trim(),
        whatsapp: whatsapp.trim(),
        page:     (page ?? "").slice(0, 200),
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("Lead save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// GET /api/leads — admin only, returns all leads
export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("Leads fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { sanitize, isValidPhone } from "@/lib/validate";

function cuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// POST /api/leads — public, saves a lead from the popup
export async function POST(req: NextRequest) {
  // Rate limit: max 5 submissions per IP per hour
  const ip = getClientIp(req);
  if (isRateLimited({ key: `lead:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const name     = sanitize(body.name, 100);
    const whatsapp = sanitize(body.whatsapp, 30);
    const page     = sanitize(body.page, 200);

    if (!name || !whatsapp) {
      return NextResponse.json({ error: "Name and WhatsApp number are required" }, { status: 400 });
    }
    if (!isValidPhone(whatsapp)) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: { id: cuid(), name, whatsapp, page },
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
    if (!session.isLoggedIn || session.role !== "ADMIN") {
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

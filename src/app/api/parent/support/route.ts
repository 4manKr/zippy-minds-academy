import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) return null;
  return session;
}

// GET — all support tickets belonging to the logged-in user's email
export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tickets = await prisma.supportTicket.findMany({
      where: { email: session.email },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST — create a new support ticket
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, message, priority } = await req.json();
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        from:     session.name  || "Parent",
        email:    session.email || "",
        subject,
        message,
        priority: priority ?? "medium",
      },
    });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

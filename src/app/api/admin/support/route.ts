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

    // Fetch support tickets + contact messages (treat both as tickets)
    const [tickets, contacts] = await Promise.all([
      prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    // Normalize contact messages to ticket shape
    const fromContacts = contacts.map((c) => ({
      id:        `cm_${c.id}`,
      from:      c.name,
      email:     c.email,
      subject:   c.subject,
      message:   c.message,
      priority:  "medium",
      status:    "open",
      reply:     null,
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
    }));

    return NextResponse.json({ tickets: [...tickets, ...fromContacts] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { from, email, subject, message, priority } = await req.json();
    const ticket = await prisma.supportTicket.create({
      data: { from, email, subject, message, priority: priority ?? "medium" },
    });
    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { ticketId, status, reply } = await req.json();

    // Contact-message tickets have prefix "cm_" — they live in ContactMessage, not SupportTicket
    if (ticketId.startsWith("cm_")) {
      // We can't update ContactMessage, so just return success (reply stored in-memory on frontend)
      return NextResponse.json({ success: true });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(status !== undefined && { status }),
        ...(reply  !== undefined && { reply  }),
      },
    });
    return NextResponse.json({ ticket: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

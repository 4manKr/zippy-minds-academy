import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    const msg = await prisma.contactMessage.create({
      data: { name, email, subject: subject || "General", message },
    });

    // In production: trigger email notification here
    console.log(`📩 New contact message from ${name} <${email}>: ${subject}`);

    return NextResponse.json({ success: true, id: msg.id });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payments = await prisma.payment.findMany({
      where: { parentEmail: session.email ?? "" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

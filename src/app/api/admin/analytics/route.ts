import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bookings, users] = await Promise.all([
      prisma.booking.findMany({ select: { subject: true, status: true, monthlyPrice: true, createdAt: true } }),
      prisma.user.findMany({ select: { role: true, createdAt: true } }),
    ]);

    // Subject breakdown
    const subjectMap: Record<string, number> = {};
    for (const b of bookings) {
      subjectMap[b.subject] = (subjectMap[b.subject] ?? 0) + 1;
    }
    const topSubjects = Object.entries(subjectMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const maxSubject = topSubjects[0]?.count || 1;
    const topSubjectsWithPct = topSubjects.map((s) => ({ ...s, pct: Math.round((s.count / maxSubject) * 100) }));

    // Monthly sessions (last 6 months)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const month = d.getMonth();
      const year  = d.getFullYear();
      const sessions = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === month && bd.getFullYear() === year;
      }).length;
      const revenue = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === month && bd.getFullYear() === year && b.status === "CONFIRMED";
      }).reduce((acc, b) => acc + b.monthlyPrice, 0);
      return { month: label, sessions, revenue };
    });

    // Totals
    const totalSessions = bookings.length;
    const confirmedSessions = bookings.filter((b) => b.status === "CONFIRMED").length;
    const totalRevenue = bookings.filter((b) => b.status === "CONFIRMED").reduce((a, b) => a + b.monthlyPrice, 0);
    const totalParents = users.filter((u) => u.role === "PARENT").length;
    const totalTutors  = users.filter((u) => u.role === "TUTOR").length;

    return NextResponse.json({
      monthly,
      topSubjects: topSubjectsWithPct,
      totalSessions,
      confirmedSessions,
      totalRevenue,
      totalParents,
      totalTutors,
      totalUsers: users.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

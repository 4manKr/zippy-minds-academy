import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendAdminNewUserAlert } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { email, code, role } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    // Find the most recent valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 401 });
    }

    // Mark OTP as used
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    // Find or create user (first login creates the account)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-create account on first OTP login — role matches what they selected
      const name       = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const dbRole     = role === "tutor" ? "TUTOR" : "PARENT";
      // Tutors start as PENDING approval; parents are auto-approved
      const approvalStatus = dbRole === "TUTOR" ? "PENDING" : "APPROVED";
      user = await prisma.user.create({
        data: { name, email, password: "otp-user", role: dbRole, approvalStatus },
      });
      // Notify admin of new user (fire-and-forget)
      sendAdminNewUserAlert({ name: user.name, email: user.email, phone: null, role: user.role });
    }

    // Create session
    const session = await getSession();
    session.userId     = user.id;
    session.email      = user.email;
    session.name       = user.name;
    session.role       = user.role;
    session.isLoggedIn = true;
    await session.save();

    const dashboard = user.role === "TUTOR" ? "/dashboard/tutor" : user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/parent";

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirect: dashboard,
    });
  } catch {
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

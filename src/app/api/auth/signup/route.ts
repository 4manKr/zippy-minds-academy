import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendAdminNewUserAlert } from "@/lib/emails";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, otp } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!otp) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // ── Verify OTP ────────────────────────────────────────────────────────
    const record = await prisma.otpCode.findFirst({
      where: { email, code: otp, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark OTP as used
    await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });

    // ── Create account ────────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone: phone || null, password: hashed, role: "PARENT" },
    });

    // Notify admin of new user (fire-and-forget)
    sendAdminNewUserAlert({ name: user.name, email: user.email, phone: user.phone, role: user.role });

    // Auto-login after signup
    const session = await getSession();
    session.userId    = user.id;
    session.email     = user.email;
    session.name      = user.name;
    session.role      = user.role;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}

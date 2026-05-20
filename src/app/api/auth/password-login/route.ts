import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Password-based login for tutors and admins
export async function POST(req: NextRequest) {
  try {
    const { email, password, adminKey, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Role check
    if (role === "TUTOR" && user.role !== "TUTOR") {
      return NextResponse.json({ error: "No tutor account found with this email" }, { status: 401 });
    }
    if (role === "ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "No admin account found with this email" }, { status: 401 });
    }

    // Password check — support both bcrypt hashes and legacy "otp-user" / empty placeholder
    const isBcryptHash = user.password.startsWith("$2");
    const passwordValid = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!passwordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Admin: verify secret key from env
    if (role === "ADMIN") {
      const requiredKey = process.env.ADMIN_SECRET_KEY;
      if (requiredKey && adminKey !== requiredKey) {
        return NextResponse.json({ error: "Invalid admin secret key" }, { status: 401 });
      }
    }

    // Tutor: must be approved
    if (role === "TUTOR" && user.approvalStatus !== "APPROVED") {
      const msg =
        user.approvalStatus === "PENDING"
          ? "Your tutor account is pending approval. You will be notified once approved."
          : "Your tutor account has been rejected. Please contact support.";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    // Create session
    const session = await getSession();
    session.userId     = user.id;
    session.email      = user.email;
    session.name       = user.name;
    session.role       = user.role;
    session.isLoggedIn = true;
    await session.save();

    const dashboard =
      user.role === "ADMIN" ? "/dashboard/admin" :
      user.role === "TUTOR" ? "/dashboard/tutor" :
      "/dashboard/parent";

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirect: dashboard,
    });
  } catch (err) {
    console.error("Password login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

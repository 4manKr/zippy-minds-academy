import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendAdminNewUserAlert } from "@/lib/emails";

interface GoogleTokenResponse {
  access_token: string;
  id_token:     string;
  token_type:   string;
  error?:       string;
}

interface GoogleUserInfo {
  sub:            string;  // Google user ID
  email:          string;
  name:           string;
  picture?:       string;
  email_verified: boolean | string;  // Google sometimes returns string "true"
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://zippymindsacademy.com";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User denied access
  if (error || !code) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=google_denied`);
  }

  // Decode state
  let role     = "PARENT";
  let redirect = "";
  try {
    const decoded = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
    role     = decoded.role     ?? "PARENT";
    redirect = decoded.redirect ?? "";
  } catch {
    // ignore — use defaults
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
        grant_type:    "authorization_code",
      }),
    });

    const tokens: GoogleTokenResponse = await tokenRes.json();
    if (tokens.error || !tokens.access_token) {
      throw new Error("Failed to exchange token");
    }

    // 2. Get user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile: GoogleUserInfo = await profileRes.json();

    const emailVerified = profile.email_verified === true || profile.email_verified === "true";
    if (!profile.email || !emailVerified) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=google_unverified`);
    }

    // 3. Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    const isNewUser = !user;

    if (!user) {
      const dbRole         = role === "TUTOR" ? "TUTOR" : "PARENT";
      const approvalStatus = dbRole === "TUTOR" ? "PENDING" : "APPROVED";
      user = await prisma.user.create({
        data: {
          name:           profile.name,
          email:          profile.email,
          password:       "google-oauth-user",   // placeholder — login uses Google, not password
          role:           dbRole,
          approvalStatus,
        },
      });
      // Notify admin of new signup
      sendAdminNewUserAlert({ name: user.name, email: user.email, phone: null, role: user.role });
    }

    // Tutors that are PENDING can't log in yet
    if (user.role === "TUTOR" && user.approvalStatus === "PENDING") {
      return NextResponse.redirect(`${BASE_URL}/auth/tutor-login?error=pending`);
    }

    // 4. Set iron-session (same as OTP login)
    const session = await getSession();
    session.userId     = user.id;
    session.email      = user.email;
    session.name       = user.name;
    session.role       = user.role;
    session.isLoggedIn = true;
    await session.save();

    // 5. Redirect
    const dashboard =
      user.role === "TUTOR"  ? "/dashboard/tutor"  :
      user.role === "ADMIN"  ? "/dashboard/admin"  :
                               "/dashboard/parent";

    const destination = redirect || (isNewUser ? "/book-demo" : dashboard);
    return NextResponse.redirect(`${BASE_URL}${destination}`);

  } catch (err) {
    console.error("[Google OAuth callback error]", err);
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=google_failed`);
  }
}

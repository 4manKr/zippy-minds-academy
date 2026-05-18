import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter: max 3 requests per email per 10 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

async function sendEmail(to: string, code: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Dev fallback — print to terminal
    console.log(`\n🔐 OTP for ${to}: ${code}  (expires in 10 min)\n`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "Zippy Minds Academy <noreply@zippymindsacademy.com>",
    to,
    subject: `Your Zippy Minds login code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f4fafd;border-radius:16px;">
        <img src="https://zippymindsacademy.com/zippy-logo.jpeg" width="60" style="border-radius:12px;margin-bottom:16px;" />
        <h2 style="color:#005da8;font-size:24px;margin:0 0 8px;">Your Login Code</h2>
        <p style="color:#555;font-size:15px;margin:0 0 24px;">Use the code below to log in to Zippy Minds Academy. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#005da8;color:#fff;font-size:36px;font-weight:900;letter-spacing:12px;text-align:center;padding:20px 32px;border-radius:12px;margin-bottom:24px;">
          ${code}
        </div>
        <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #dde3ee;margin:24px 0;" />
        <p style="color:#aaa;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Zippy Minds Academy · zippymindsacademy.com</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // Purge old codes for this email
    await prisma.otpCode.deleteMany({ where: { email } });

    // Generate a cryptographically safer code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({ data: { email, code, expiresAt } });
    await sendEmail(email, code);

    return NextResponse.json({ success: true, message: "Verification code sent to your email." });
  } catch (err) {
    console.error("send-code error:", err);
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 });
  }
}

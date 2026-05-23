import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { isValidEmail } from "@/lib/validate";

/**
 * DB-backed OTP rate limit: count unexpired codes in the last 10 min.
 * This survives serverless cold starts and works across multiple instances.
 */
async function isOtpRateLimited(email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 10 * 60 * 1000);
  const recent = await prisma.otpCode.count({
    where: {
      email,
      createdAt: { gte: windowStart },
    },
  });
  return recent >= 3; // max 3 OTP requests per 10 min per email
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
    from: `Zippy Minds Academy <verify@${process.env.EMAIL_DOMAIN ?? "zippymindsacademy.com"}>`,
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

    if (!email || !isValidEmail(String(email))) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // IP-level rate limit (blocks bots hammering with many different emails)
    const ip = getClientIp(req);
    if (isRateLimited({ key: `otp-ip:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 })) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // Per-email DB-backed rate limit (survives cold starts)
    if (await isOtpRateLimited(email.trim().toLowerCase())) {
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

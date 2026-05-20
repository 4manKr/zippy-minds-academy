import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "zippymindsacademy@gmail.com";

async function notifyAdmin(name: string, email: string, subject: string, message: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📩 New contact from ${name} <${email}>: ${subject}`);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "Zippy Minds Academy <noreply@zippymindsacademy.com>",
      to: ADMIN_EMAIL,
      subject: `📩 New Contact Message: ${subject || "General Enquiry"}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#f4fafd;border-radius:16px;">
          <img src="https://zippymindsacademy.com/logo.jpg" width="60" style="border-radius:12px;margin-bottom:16px;" />
          <h2 style="color:#005da8;font-size:22px;margin:0 0 8px;">New Contact Form Submission</h2>
          <p style="color:#555;font-size:14px;margin:0 0 20px;">Someone just filled out the contact form on your website.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:10px 12px;background:#fff;border-radius:8px 8px 0 0;border:1px solid #dde3ee;font-weight:600;color:#333;width:100px;">Name</td><td style="padding:10px 12px;background:#fff;border-top:1px solid #dde3ee;border-right:1px solid #dde3ee;color:#555;">${name}</td></tr>
            <tr><td style="padding:10px 12px;background:#f9f9f9;border:1px solid #dde3ee;border-top:none;font-weight:600;color:#333;">Email</td><td style="padding:10px 12px;background:#f9f9f9;border-top:none;border-right:1px solid #dde3ee;border-bottom:1px solid #dde3ee;"><a href="mailto:${email}" style="color:#005da8;">${email}</a></td></tr>
            <tr><td style="padding:10px 12px;background:#fff;border:1px solid #dde3ee;border-top:none;font-weight:600;color:#333;">Subject</td><td style="padding:10px 12px;background:#fff;border-top:none;border-right:1px solid #dde3ee;border-bottom:1px solid #dde3ee;color:#555;">${subject || "General"}</td></tr>
          </table>
          <div style="background:#fff;border:1px solid #dde3ee;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="font-weight:600;color:#333;margin:0 0 8px;">Message</p>
            <p style="color:#555;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || "Your enquiry")}" style="display:inline-block;background:#005da8;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">Reply to ${name}</a>
          <hr style="border:none;border-top:1px solid #dde3ee;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Zippy Minds Academy · Admin Notification</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Contact notify error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    const msg = await prisma.contactMessage.create({
      data: { name, email, subject: subject || "General", message },
    });

    // Fire-and-forget admin notification
    notifyAdmin(name, email, subject, message);

    return NextResponse.json({ success: true, id: msg.id });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendSubscriptionConfirmedEmail } from "@/lib/emails";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      gateway, gatewayId,
      amount, currency,
      courseId, courseName,
      dayOfWeek, timeSlot, timezone,
      childName, childAge, grade,
      sessionDates,
    } = body;

    if (!dayOfWeek || !timeSlot || !childName || !Array.isArray(sessionDates) || sessionDates.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parentName  = session.name  ?? "Parent";
    const parentEmail = session.email ?? "";

    // ── 1. Create Payment record ──────────────────────────────────────────
    const payment = await prisma.payment.create({
      data: {
        userId:      session.userId ?? null,
        parentEmail,
        parentName,
        childName:   childName ?? "",
        amount:      Number(amount) || 0,
        currency:    currency ?? "INR",
        gateway,
        gatewayId:   gatewayId ?? null,
        status:      "PAID",
        courseName,
        courseId:    courseId ?? null,
      },
    });

    // ── 2. Create 4 MonthlySession records with Zoom meetings ─────────────
    const sessions = [];

    for (let i = 0; i < sessionDates.length; i++) {
      const date = sessionDates[i];

      // Create Zoom meeting for this session
      const zoom = await createZoomMeeting({
        topic:    `Zippy Minds — ${courseName} with ${childName}`,
        date,
        timeSlot,
        timezone: timezone ?? "Asia/Kolkata",
        duration: 45,
        agenda:   `Monthly session ${i + 1}/4 for ${childName}${grade ? ` (${grade})` : ""} — ${courseName}`,
      });

      const ms = await prisma.monthlySession.create({
        data: {
          paymentId:     payment.id,
          parentEmail,
          parentName,
          childName:     childName ?? "",
          subject:       courseName,
          grade:         grade ?? "",
          dayOfWeek,
          date,
          timeSlot,
          timezone:      timezone ?? "Asia/Kolkata",
          sessionNumber: i + 1,
          zoomLink:      zoom?.joinUrl   ?? null,
          zoomStartUrl:  zoom?.startUrl  ?? null,
          zoomMeetingId: zoom?.meetingId ?? null,
          status:        "SCHEDULED",
        },
      });

      sessions.push(ms);
    }

    // ── 3. Send confirmation email ────────────────────────────────────────
    sendSubscriptionConfirmedEmail({
      parentName,
      parentEmail,
      childName:  childName ?? "",
      courseName,
      dayOfWeek,
      timeSlot,
      timezone:   timezone ?? "Asia/Kolkata",
      sessions:   sessions.map(s => ({ date: s.date, zoomLink: s.zoomLink ?? "" })),
    });

    return NextResponse.json({ success: true, payment, sessions });
  } catch (err) {
    console.error("[subscriptions/create]", err);
    return NextResponse.json({ error: "Failed to create subscription sessions" }, { status: 500 });
  }
}

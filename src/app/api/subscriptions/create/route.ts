import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendSubscriptionConfirmedEmail, sendTutorEnrollmentAssignedEmail } from "@/lib/emails";

export const runtime = "nodejs";

// ── Date generation (server-side, Mon-Fri daily) ─────────────────────────────
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function generateMFDates(
  timezone: string,
  durationValue: number,
  durationUnit: string,
): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year:"numeric", month:"2-digit", day:"2-digit" });
  const todayStr = fmt.format(new Date());
  const [y,m,d] = todayStr.split("-").map(Number);

  const start = new Date(y, m-1, d+1);
  let end: Date;
  if      (durationUnit === "days")  end = new Date(y, m-1, d + durationValue * 2 + 10); // buffer for weekends
  else if (durationUnit === "weeks") end = new Date(y, m-1, d + durationValue * 7 + 1);
  else                               end = new Date(y, m-1 + durationValue, d + 1);

  const dates: string[] = [];
  const cur = new Date(start);

  if (durationUnit === "days") {
    // Generate exactly durationValue weekdays
    while (dates.length < durationValue) {
      const day = cur.getDay();
      if (day >= 1 && day <= 5) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    // Generate all Mon-Fri within range
    while (cur < end) {
      const day = cur.getDay();
      if (day >= 1 && day <= 5) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return dates;
}

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
      timeSlot, timezone,
      childName, childAge, grade,
      durationValue, durationUnit,
    } = body;

    if (!timeSlot || !childName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parentName  = session.name  ?? "Parent";
    const parentEmail = session.email ?? "";

    // Regenerate dates server-side (don't trust client) — daily Mon-Fri
    const dv  = Number(durationValue) || 1;
    const du  = durationUnit ?? "months";
    const tz  = timezone ?? "Asia/Kolkata";
    const sessionDates = generateMFDates(tz, dv, du);

    if (sessionDates.length === 0) {
      return NextResponse.json({ error: "No valid session dates generated" }, { status: 400 });
    }

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

    // ── 2. Create Enrollment record ───────────────────────────────────────
    const enrollment = await prisma.enrollment.create({
      data: {
        paymentId:     payment.id,
        userId:        session.userId ?? null,
        parentEmail,
        parentName,
        childName:     childName ?? "",
        subject:       courseName,
        courseId:      courseId ?? null,
        courseName,
        dayOfWeek:     "Mon-Fri",
        timeSlot,
        timezone:      tz,
        startDate:     sessionDates[0],
        endDate:       sessionDates[sessionDates.length - 1],
        totalSessions: sessionDates.length,
        status:        "ACTIVE",
      },
    });

    // ── 3. Create all session records with Zoom meetings ──────────────────
    const sessions = [];

    for (let i = 0; i < sessionDates.length; i++) {
      const date = sessionDates[i];

      const zoom = await createZoomMeeting({
        topic:    `Zippy Minds — ${courseName} with ${childName}`,
        date,
        timeSlot,
        timezone: tz,
        duration: 45,
        agenda:   `Session ${i + 1}/${sessionDates.length} for ${childName}${grade ? ` (${grade})` : ""} — ${courseName}`,
      });

      const ms = await prisma.monthlySession.create({
        data: {
          paymentId:     payment.id,
          enrollmentId:  enrollment.id,
          parentEmail,
          parentName,
          childName:     childName ?? "",
          subject:       courseName,
          grade:         grade ?? "",
          dayOfWeek:     "Mon-Fri",
          date,
          timeSlot,
          timezone:      tz,
          sessionNumber: i + 1,
          zoomLink:      zoom?.joinUrl   ?? null,
          zoomStartUrl:  zoom?.startUrl  ?? null,
          zoomMeetingId: zoom?.meetingId ?? null,
          status:        "SCHEDULED",
        },
      });

      sessions.push(ms);
    }

    // ── 4. Auto-assign a tutor for this subject ───────────────────────────
    try {
      const allTutors = await prisma.user.findMany({
        where: { role: "TUTOR", approvalStatus: "APPROVED" },
        select: { id: true, name: true, email: true, subjects: true },
      });
      const assignedTutor = allTutors.find(t => {
        try {
          const subjectList: string[] = JSON.parse(t.subjects || "[]");
          return subjectList.includes(courseName);
        } catch { return false; }
      }) ?? null;

      if (assignedTutor) {
        const initials = assignedTutor.name
          .split(" ").filter(Boolean).map((p: string) => p[0]).join("").toUpperCase().slice(0, 2);
        await prisma.monthlySession.updateMany({
          where: { enrollmentId: enrollment.id },
          data: { tutorName: assignedTutor.name, tutorInitials: initials },
        });
        if (assignedTutor.email) {
          sendTutorEnrollmentAssignedEmail({
            tutorName:     assignedTutor.name,
            tutorEmail:    assignedTutor.email,
            parentName,
            childName:     childName ?? "",
            subject:       courseName,
            timeSlot,
            timezone:      tz,
            startDate:     sessionDates[0],
            endDate:       sessionDates[sessionDates.length - 1],
            totalSessions: sessions.length,
          });
        }
      }
    } catch (tutorErr) {
      console.warn("[subscriptions/create] tutor assignment failed:", tutorErr);
      // non-fatal — enrollment still succeeds
    }

    // ── 5. Send confirmation email ────────────────────────────────────────
    sendSubscriptionConfirmedEmail({
      parentName,
      parentEmail,
      childName:    childName ?? "",
      courseName,
      dayOfWeek:    "Mon-Fri",
      timeSlot,
      timezone:     tz,
      durationValue: dv,
      durationUnit:  du,
      sessions:     sessions.map(s => ({ date: s.date, zoomLink: s.zoomLink ?? "" })),
    });

    return NextResponse.json({ success: true, payment, enrollment, sessions });
  } catch (err) {
    console.error("[subscriptions/create]", err);
    return NextResponse.json({ error: "Failed to create subscription sessions" }, { status: 500 });
  }
}

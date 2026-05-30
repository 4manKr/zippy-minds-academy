import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";
import { sendSubscriptionConfirmedEmail, sendTutorEnrollmentAssignedEmail } from "@/lib/emails";
import { findBestTutor } from "@/lib/tutorAssignment";

export const runtime = "nodejs";

// ── Date generation (server-side, selected weekdays) ─────────────────────────
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const DAY_NUMS: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function generateSelectedDaysDates(
  timezone: string,
  selectedDays: string[],   // e.g. ["Mon","Wed","Fri"]
  durationValue: number,
  durationUnit: string,
): string[] {
  if (selectedDays.length === 0) return [];

  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year:"numeric", month:"2-digit", day:"2-digit" });
  const todayStr = fmt.format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);

  const dayNums = selectedDays
    .map(dn => DAY_NUMS[dn])
    .filter((n): n is number => n !== undefined);

  const start = new Date(y, m-1, d+1);
  let end: Date;
  if (durationUnit === "days") {
    const weeksNeeded = Math.ceil(durationValue / selectedDays.length) + 2;
    end = new Date(y, m-1, d + weeksNeeded * 7 + 7);
  } else if (durationUnit === "weeks") {
    end = new Date(y, m-1, d + durationValue * 7 + 1);
  } else {
    end = new Date(y, m-1 + durationValue, d + 1);
  }

  const dates: string[] = [];
  const cur = new Date(start);

  if (durationUnit === "days") {
    while (dates.length < durationValue) {
      if (dayNums.includes(cur.getDay())) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    while (cur < end) {
      if (dayNums.includes(cur.getDay())) dates.push(toDateStr(cur));
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
      selectedDays,
      timeSlot, timezone,
      childName, childAge, grade,
      durationValue, durationUnit,
      couponCode, discountAmount,
      slotId,
    } = body;

    if (!timeSlot || !childName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parentName  = session.name  ?? "Parent";
    const parentEmail = session.email ?? "";

    // Regenerate dates server-side (don't trust client)
    const dv   = Number(durationValue) || 1;
    const du   = durationUnit ?? "months";
    const tz   = timezone ?? "Asia/Kolkata";
    const days: string[] = Array.isArray(selectedDays) && selectedDays.length > 0
      ? selectedDays
      : ["Mon","Tue","Wed","Thu","Fri"];   // fallback to Mon-Fri
    const sessionDates = generateSelectedDaysDates(tz, days, dv, du);

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
        couponCode:  couponCode ?? "",
        discount:    Number(discountAmount) || 0,
      },
    });

    // ── 1b. Record coupon usage + increment counter ───────────────────────
    if (couponCode) {
      const upper  = String(couponCode).toUpperCase().trim();
      const coupon = await prisma.coupon.findFirst({ where: { code: upper } });
      if (coupon) {
        // Write usage record
        await prisma.couponUsage.create({
          data: {
            couponId:       coupon.id,
            couponCode:     upper,
            userId:         session.userId ?? "unknown",
            userEmail:      parentEmail,
            userName:       parentName,
            subscriptionId: payment.id,
            courseName,
            discountGiven:  Number(discountAmount) || 0,
          },
        });
        // Increment global counter
        await prisma.coupon.update({
          where: { id: coupon.id },
          data:  { usedCount: { increment: 1 }, updatedAt: new Date() },
        });
      }
    }

    // ── 1c. Increment course slot booking count ───────────────────────────
    if (slotId && courseId) {
      try {
        const courseRec = await prisma.course.findUnique({ where: { id: courseId }, select: { courseSlots: true } });
        if (courseRec) {
          const slots: { id:string; days:string[]; time:string; maxCapacity:number; bookings:number }[] =
            (() => { try { return JSON.parse(courseRec.courseSlots || "[]"); } catch { return []; } })();
          const updated = slots.map(s => s.id === slotId ? { ...s, bookings: Math.min(s.bookings + 1, s.maxCapacity) } : s);
          await prisma.course.update({ where: { id: courseId }, data: { courseSlots: JSON.stringify(updated) } });
        }
      } catch { /* non-fatal */ }
    }

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
        dayOfWeek:     days.join(","),
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
          dayOfWeek:     days.join(","),
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

    // ── 4. Priority-based tutor assignment ───────────────────────────────
    try {
      const assignedTutor = await findBestTutor({
        subject:  courseName,
        timeSlot,
        days,
      });

      if (assignedTutor) {
        await prisma.monthlySession.updateMany({
          where: { enrollmentId: enrollment.id },
          data: { tutorName: assignedTutor.name, tutorInitials: assignedTutor.initials },
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
      dayOfWeek:    days.join(", "),
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

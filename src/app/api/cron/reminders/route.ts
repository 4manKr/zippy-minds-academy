import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSessionReminderEmail, sendDailySessionReminderEmail } from "@/lib/emails";

/**
 * Converts a date + timeSlot + timezone into a UTC timestamp.
 * Handles all UTC offsets including half-hour (e.g. IST +5:30, NPT +5:45).
 */
function sessionToUTC(dateStr: string, timeSlot: string, tz: string): Date | null {
  try {
    const m = timeSlot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = +m[1], mins = +m[2];
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;

    const [year, month, day] = dateStr.split("-").map(Number);

    const refUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(refUTC);
    const localH = parseInt(parts.find(p => p.type === "hour")!.value);
    const localM = parseInt(parts.find(p => p.type === "minute")!.value);

    const localNoonMinutes = (localH === 24 ? 0 : localH) * 60 + localM;
    const offsetMinutes    = localNoonMinutes - 720;
    const utcSessionMinutes = h * 60 + mins - offsetMinutes;

    return new Date(Date.UTC(year, month - 1, day, 0, utcSessionMinutes, 0));
  } catch { return null; }
}

/** Returns true if it is currently 8–10 AM in the given timezone */
function isMorningIn(tz: string): boolean {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", hour12: false });
    const hour = parseInt(fmt.format(new Date()));
    return hour >= 8 && hour < 10;
  } catch { return false; }
}

/** Returns today's date string in a timezone, e.g. "2026-05-20" */
function todayIn(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export async function POST(req: NextRequest) {
  // Verify cron secret — accept via Authorization header OR ?secret= query param
  const authHeader  = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  const secret      = process.env.CRON_SECRET;
  if (secret) {
    if (authHeader !== `Bearer ${secret}` && querySecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now  = new Date();
    const sent30:    string[] = [];
    const sentDaily: string[] = [];

    // ── A) 30-min reminders for demo Bookings (CONFIRMED) ─────────────────
    const bookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED", reminderSent: false },
    });

    for (const booking of bookings) {
      const sessionUTC = sessionToUTC(booking.date, booking.timeSlot, booking.timezone);
      if (!sessionUTC) continue;

      const minutesUntil = (sessionUTC.getTime() - now.getTime()) / 60_000;
      if (minutesUntil < 25 || minutesUntil > 35) continue;

      const tutor = await prisma.user.findFirst({
        where: { name: booking.tutorName, role: "TUTOR" },
        select: { email: true, name: true },
      });

      sendSessionReminderEmail({
        to: booking.parentEmail, toName: booking.parentName, role: "parent",
        childName: booking.childName, subject: booking.subject,
        date: booking.date, timeSlot: booking.timeSlot, timezone: booking.timezone,
        tutorName: booking.tutorName, zoomLink: booking.zoomLink, zoomStartUrl: booking.zoomStartUrl,
      });
      if (tutor?.email) {
        sendSessionReminderEmail({
          to: tutor.email, toName: tutor.name, role: "tutor",
          childName: booking.childName, subject: booking.subject,
          date: booking.date, timeSlot: booking.timeSlot, timezone: booking.timezone,
          tutorName: booking.tutorName, zoomLink: booking.zoomLink, zoomStartUrl: booking.zoomStartUrl,
        });
      }
      await prisma.booking.update({ where: { id: booking.id }, data: { reminderSent: true } });
      sent30.push(booking.id);
    }

    // ── B) Monthly sessions — 30-min reminders ────────────────────────────
    const ms30 = await prisma.monthlySession.findMany({
      where: { status: "SCHEDULED", reminderSent: false },
    });

    for (const ms of ms30) {
      const sessionUTC = sessionToUTC(ms.date, ms.timeSlot, ms.timezone);
      if (!sessionUTC) continue;
      const minutesUntil = (sessionUTC.getTime() - now.getTime()) / 60_000;
      if (minutesUntil < 25 || minutesUntil > 35) continue;

      sendSessionReminderEmail({
        to: ms.parentEmail, toName: ms.parentName, role: "parent",
        childName: ms.childName, subject: ms.subject,
        date: ms.date, timeSlot: ms.timeSlot, timezone: ms.timezone,
        tutorName: ms.tutorName, zoomLink: ms.zoomLink, zoomStartUrl: ms.zoomStartUrl,
      });
      await prisma.monthlySession.update({ where: { id: ms.id }, data: { reminderSent: true } });
      sent30.push(ms.id);
    }

    // ── C) Monthly sessions — daily morning reminder (8-10 AM in their tz) ─
    const msDaily = await prisma.monthlySession.findMany({
      where: { status: "SCHEDULED", dailyReminderSent: false },
    });

    for (const ms of msDaily) {
      // Only send if it's morning in their timezone AND the session is TODAY
      if (!isMorningIn(ms.timezone)) continue;
      if (ms.date !== todayIn(ms.timezone)) continue;

      sendDailySessionReminderEmail({
        to:        ms.parentEmail,
        toName:    ms.parentName,
        childName: ms.childName,
        subject:   ms.subject,
        date:      ms.date,
        timeSlot:  ms.timeSlot,
        timezone:  ms.timezone,
        zoomLink:  ms.zoomLink,
      });
      await prisma.monthlySession.update({ where: { id: ms.id }, data: { dailyReminderSent: true } });
      sentDaily.push(ms.id);
    }

    return NextResponse.json({
      ok: true,
      reminders30min: sent30.length,
      remindersDaily: sentDaily.length,
      ids30: sent30,
      idsDaily: sentDaily,
    });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return POST(req); }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSessionReminderEmail } from "@/lib/emails";

/**
 * Converts a booking's date + timeSlot + timezone into a UTC timestamp.
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

    // Get the UTC offset for this timezone on this date
    // by formatting a known UTC noon and reading back local time parts
    const refUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit", minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(refUTC);
    const localH = parseInt(parts.find(p => p.type === "hour")!.value);
    const localM = parseInt(parts.find(p => p.type === "minute")!.value);

    // offsetMinutes = local_noon_minutes - UTC_noon_minutes (720)
    // Handle "24" which Intl sometimes returns for midnight
    const localNoonMinutes = (localH === 24 ? 0 : localH) * 60 + localM;
    const offsetMinutes = localNoonMinutes - 720;

    // UTC session time = local session time - offset
    const localSessionMinutes = h * 60 + mins;
    const utcSessionMinutes   = localSessionMinutes - offsetMinutes;

    return new Date(Date.UTC(year, month - 1, day, 0, utcSessionMinutes, 0));
  } catch {
    return null;
  }
}

// POST — called by Vercel Cron every minute; sends reminders for sessions starting in ~30 min
export async function POST(req: NextRequest) {
  // Verify cron secret so this can't be called by anyone
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all CONFIRMED bookings where reminder hasn't been sent yet
    const bookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED", reminderSent: false },
    });

    const sent: string[] = [];

    for (const booking of bookings) {
      const sessionUTC = sessionToUTC(booking.date, booking.timeSlot, booking.timezone);
      if (!sessionUTC) continue;

      const minutesUntil = (sessionUTC.getTime() - now.getTime()) / 60_000;

      // Send if between 25 and 35 minutes away (±5 min window around 30)
      if (minutesUntil >= 25 && minutesUntil <= 35) {
        // Get tutor's email
        const tutor = await prisma.user.findFirst({
          where: { name: booking.tutorName, role: "TUTOR" },
          select: { email: true, name: true },
        });

        // Send to parent
        sendSessionReminderEmail({
          to:          booking.parentEmail,
          toName:      booking.parentName,
          role:        "parent",
          childName:   booking.childName,
          subject:     booking.subject,
          date:        booking.date,
          timeSlot:    booking.timeSlot,
          timezone:    booking.timezone,
          tutorName:   booking.tutorName,
          zoomLink:    booking.zoomLink,
          zoomStartUrl: booking.zoomStartUrl,
        });

        // Send to tutor
        if (tutor?.email) {
          sendSessionReminderEmail({
            to:          tutor.email,
            toName:      tutor.name,
            role:        "tutor",
            childName:   booking.childName,
            subject:     booking.subject,
            date:        booking.date,
            timeSlot:    booking.timeSlot,
            timezone:    booking.timezone,
            tutorName:   booking.tutorName,
            zoomLink:    booking.zoomLink,
            zoomStartUrl: booking.zoomStartUrl,
          });
        }

        // Mark reminder sent
        await prisma.booking.update({
          where: { id: booking.id },
          data:  { reminderSent: true },
        });

        sent.push(booking.id);
      }
    }

    return NextResponse.json({ ok: true, remindersSent: sent.length, ids: sent });
  } catch (err) {
    console.error("[cron/reminders]", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

// Also allow GET so Vercel Cron (which uses GET by default) works
export async function GET(req: NextRequest) {
  return POST(req);
}

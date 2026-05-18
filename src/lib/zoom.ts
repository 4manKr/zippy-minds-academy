/**
 * Zoom Server-to-Server OAuth integration
 *
 * Setup (one-time, ~2 min):
 *   1. Go to https://marketplace.zoom.us → Build App → Server-to-Server OAuth
 *   2. Give it a name (e.g. "Zippy Minds Scheduler")
 *   3. Activate the app — copy Account ID, Client ID, Client Secret
 *   4. Under Scopes, add: meeting:write:admin
 *   5. Add the 3 values to your .env.local / Vercel env vars
 *
 * If ZOOM_CLIENT_ID is not set, createZoomMeeting() returns null silently
 * (booking still saves — zoom link will be populated later by admin/webhook).
 */

export interface ZoomMeeting {
  joinUrl:   string;   // parent clicks this to join
  startUrl:  string;   // tutor clicks this to start (host)
  meetingId: string;   // numeric Zoom meeting ID
}

/** Parse "May 19, 2025" + "9:00 AM" → "2025-05-19T09:00:00" */
function toZoomDateTime(date: string, timeSlot: string): string {
  const raw = new Date(`${date} ${timeSlot}`);
  if (isNaN(raw.getTime())) {
    // Fallback: use now + 1 hour
    const fallback = new Date(Date.now() + 60 * 60 * 1000);
    return formatLocalISO(fallback);
  }
  return formatLocalISO(raw);
}

function formatLocalISO(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

/** Fetch a short-lived Server-to-Server OAuth token from Zoom */
async function getZoomToken(): Promise<string> {
  const accountId  = process.env.ZOOM_ACCOUNT_ID!;
  const clientId   = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zoom token error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

/**
 * Create a scheduled Zoom meeting and return join/start URLs.
 * Returns null if Zoom env vars are not configured (dev fallback).
 */
export async function createZoomMeeting(params: {
  topic:       string;   // e.g. "Maths Demo — Emma"
  date:        string;   // e.g. "May 19, 2025"
  timeSlot:    string;   // e.g. "9:00 AM"
  timezone:    string;   // IANA tz, e.g. "America/New_York"
  duration?:   number;   // minutes (default 60)
  agenda?:     string;
}): Promise<ZoomMeeting | null> {
  if (!process.env.ZOOM_CLIENT_ID) {
    console.log(`[Zoom] No credentials set — skipping meeting creation for "${params.topic}"`);
    return null;
  }

  try {
    const token = await getZoomToken();

    const startTime = toZoomDateTime(params.date, params.timeSlot);

    const body = {
      topic:      params.topic,
      type:       2, // scheduled
      start_time: startTime,
      duration:   params.duration ?? 60,
      timezone:   params.timezone,
      agenda:     params.agenda ?? "Free demo session — Zippy Minds Academy",
      settings: {
        host_video:         true,
        participant_video:  true,
        join_before_host:   false,
        waiting_room:       true,
        mute_upon_entry:    true,
        auto_recording:     "none",
        approval_type:      2, // no registration required
      },
    };

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Zoom meeting creation failed ${res.status}: ${errBody}`);
    }

    const meeting = await res.json();

    return {
      joinUrl:   meeting.join_url  as string,
      startUrl:  meeting.start_url as string,
      meetingId: String(meeting.id),
    };
  } catch (err) {
    // Never crash the booking — just log and return null
    console.error("[Zoom] createZoomMeeting error:", err);
    return null;
  }
}

/** Delete a Zoom meeting (called on booking cancellation) */
export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  if (!process.env.ZOOM_CLIENT_ID || !meetingId) return;

  try {
    const token = await getZoomToken();
    await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("[Zoom] deleteZoomMeeting error:", err);
  }
}

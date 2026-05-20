/**
 * Zippy Minds Academy — Transactional Email Utility
 * All emails are sent via Resend. If RESEND_API_KEY is not set,
 * the details are logged to console so nothing crashes.
 */

const FROM_EMAIL  = process.env.FROM_EMAIL  ?? "Zippy Minds Academy <noreply@zippymindsacademy.com>";
const ADMIN_EMAIL = "zippymindsacademy@gmail.com";
const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.zippymindsacademy.com";

// ─── shared helpers ───────────────────────────────────────────────────────────

function logoHeader() {
  return `
    <div style="text-align:center;padding:28px 0 16px;">
      <img src="${BASE_URL}/logo.jpg" width="56" height="56"
        style="border-radius:14px;object-fit:cover;display:inline-block;" />
      <p style="margin:10px 0 0;font-family:sans-serif;font-weight:800;font-size:18px;color:#005da8;letter-spacing:-0.3px;">
        Zippy Minds Academy
      </p>
    </div>`;
}

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Blue header bar -->
        <tr><td style="background:linear-gradient(135deg,#005da8,#2d5be3);height:6px;"></td></tr>
        <tr><td style="padding:0 32px 32px;">
          ${logoHeader()}
          ${content}
          <!-- Footer -->
          <div style="border-top:1px solid #e8edf5;margin-top:28px;padding-top:20px;text-align:center;">
            <p style="font-size:12px;color:#9ba3b5;margin:0 0 6px;">
              © ${new Date().getFullYear()} Zippy Minds Academy · All rights reserved
            </p>
            <p style="font-size:12px;color:#9ba3b5;margin:0;">
              <a href="${BASE_URL}" style="color:#005da8;text-decoration:none;">zippymindsacademy.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:${ADMIN_EMAIL}" style="color:#005da8;text-decoration:none;">${ADMIN_EMAIL}</a>
            </p>
          </div>
        </td></tr>
        <tr><td style="background:linear-gradient(135deg,#005da8,#2d5be3);height:4px;"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:9px 12px;font-size:13px;font-weight:600;color:#444;background:#f8faff;border-radius:6px 0 0 6px;border:1px solid #e8edf5;white-space:nowrap;">${label}</td>
      <td style="padding:9px 12px;font-size:13px;color:#333;background:#ffffff;border-radius:0 6px 6px 0;border:1px solid #e8edf5;border-left:none;">${value}</td>
    </tr>`;
}

function btnPrimary(text: string, href: string) {
  return `
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#005da8,#2d5be3);color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.2px;">
        ${text}
      </a>
    </div>`;
}

function chip(emoji: string, text: string, bg = "#e8f0fe", color = "#1a56db") {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin:2px;">${emoji} ${text}</span>`;
}

// ─── async sender ─────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 [Email — no RESEND_API_KEY] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEMO BOOKED — sent to parent immediately after booking is created
// ─────────────────────────────────────────────────────────────────────────────
export async function sendDemoBookedEmail(booking: {
  parentName:  string;
  parentEmail: string;
  childName:   string;
  subject:     string;
  grade:       string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
  tutorName:   string;
}) {
  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      🎉 Demo Booked Successfully!
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${booking.parentName}</strong>, your free demo session has been booked!
      Your tutor will review and confirm shortly — we'll email you the moment it's confirmed
      with your Zoom link.
    </p>

    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#005da8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">
        📋 Booking Details
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px;">
        ${infoRow("Child",    booking.childName)}
        ${infoRow("Grade",    booking.grade || "—")}
        ${infoRow("Subject",  booking.subject)}
        ${infoRow("Tutor",    booking.tutorName !== "TBD" ? booking.tutorName : "Being assigned…")}
        ${infoRow("Date",     booking.date)}
        ${infoRow("Time",     `${booking.timeSlot} (${booking.timezone})`)}
      </table>
    </div>

    <div style="background:#fff8e6;border:1px solid #fdd68a;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="font-size:13px;color:#7a5200;margin:0;line-height:1.6;">
        ⏳ <strong>Status: Pending Confirmation</strong><br/>
        Your tutor is reviewing your request. You'll receive another email as soon as
        your session is confirmed with the Zoom link.
      </p>
    </div>

    <div style="margin-bottom:4px;">
      ${chip("📚", booking.subject, "#e8f0fe", "#1a56db")}
      ${chip("🕐", booking.timeSlot, "#f0fdf4", "#166534")}
      ${chip("🌍", booking.timezone, "#faf5ff", "#6b21a8")}
    </div>

    ${btnPrimary("View My Dashboard →", `${BASE_URL}/dashboard/parent`)}

    <p style="font-size:12px;color:#888;text-align:center;margin:12px 0 0;">
      Questions? Reply to this email or WhatsApp us at
      <a href="https://wa.me/919311483555" style="color:#005da8;">+91 93114 83555</a>
    </p>
  `);

  await send(
    booking.parentEmail,
    `✅ Demo Booked — ${booking.subject} on ${booking.date}`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SESSION CONFIRMED — sent to parent when tutor/admin confirms
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSessionConfirmedEmail(booking: {
  parentName:  string;
  parentEmail: string;
  childName:   string;
  subject:     string;
  grade:       string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
  tutorName:   string;
  zoomLink?:   string | null;
}) {
  const zoomSection = booking.zoomLink
    ? `
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="font-size:13px;font-weight:700;color:#166534;margin:0 0 12px;">
          🎥 Your Zoom Link is Ready!
        </p>
        <a href="${booking.zoomLink}"
          style="display:inline-block;background:#22c55e;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
          Join Demo Session
        </a>
        <p style="font-size:11px;color:#4ade80;margin:10px 0 0;">
          Save this link — you'll need it on the day of your session.
        </p>
      </div>`
    : `
      <div style="background:#fff8e6;border:1px solid #fdd68a;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="font-size:13px;color:#7a5200;margin:0;">
          🔗 Your Zoom link will be shared shortly before the session.
        </p>
      </div>`;

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      🎊 Your Demo Session is Confirmed!
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${booking.parentName}</strong>, great news!
      <strong>${booking.tutorName}</strong> has confirmed your free demo session for
      <strong>${booking.childName}</strong>. See you soon! 🚀
    </p>

    ${zoomSection}

    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#005da8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">
        📋 Session Details
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px;">
        ${infoRow("Child",   booking.childName)}
        ${infoRow("Grade",   booking.grade || "—")}
        ${infoRow("Subject", booking.subject)}
        ${infoRow("Tutor",   booking.tutorName)}
        ${infoRow("Date",    booking.date)}
        ${infoRow("Time",    `${booking.timeSlot} (${booking.timezone})`)}
      </table>
    </div>

    <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="font-size:13px;color:#1d4ed8;font-weight:600;margin:0 0 8px;">💡 Tips for your session:</p>
      <ul style="font-size:13px;color:#334155;margin:0;padding-left:18px;line-height:1.8;">
        <li>Join 2–3 minutes early to test your audio & video.</li>
        <li>Have a notebook handy for your child.</li>
        <li>A quiet, well-lit room works best.</li>
      </ul>
    </div>

    ${btnPrimary("View My Dashboard →", `${BASE_URL}/dashboard/parent`)}

    <p style="font-size:12px;color:#888;text-align:center;margin:12px 0 0;">
      Need to reschedule? Contact us at least 24 hours before via
      <a href="https://wa.me/919311483555" style="color:#005da8;">WhatsApp</a>
      or reply to this email.
    </p>
  `);

  await send(
    booking.parentEmail,
    `🎊 Confirmed! ${booking.subject} Demo on ${booking.date} with ${booking.tutorName}`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SESSION CANCELLED — sent to parent when booking is cancelled
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSessionCancelledEmail(booking: {
  parentName:  string;
  parentEmail: string;
  childName:   string;
  subject:     string;
  date:        string;
  timeSlot:    string;
}) {
  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      Session Cancelled
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${booking.parentName}</strong>, unfortunately your demo session for
      <strong>${booking.childName}</strong> on <strong>${booking.date}</strong>
      (${booking.subject}) has been cancelled.
    </p>

    <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="font-size:13px;color:#9f1239;font-weight:600;margin:0 0 6px;">Cancelled session</p>
      <p style="font-size:13px;color:#555;margin:0;">
        ${booking.subject} · ${booking.date} · ${booking.timeSlot}
      </p>
    </div>

    <p style="font-size:14px;color:#444;margin:0 0 4px;line-height:1.6;">
      We apologise for the inconvenience. Please book a new session — it's completely free!
    </p>

    ${btnPrimary("Book a New Free Demo →", `${BASE_URL}/book-demo`)}

    <p style="font-size:12px;color:#888;text-align:center;margin:12px 0 0;">
      Need help? Contact us at
      <a href="mailto:${ADMIN_EMAIL}" style="color:#005da8;">${ADMIN_EMAIL}</a>
      or <a href="https://wa.me/919311483555" style="color:#005da8;">WhatsApp</a>.
    </p>
  `);

  await send(
    booking.parentEmail,
    `Session Cancelled — ${booking.subject} on ${booking.date}`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN ALERT — new booking notification to admin
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAdminNewBookingAlert(booking: {
  parentName:  string;
  parentEmail: string;
  childName:   string;
  subject:     string;
  grade:       string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
  tutorName:   string;
  id:          string;
}) {
  const html = wrapper(`
    <h2 style="font-size:20px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      📥 New Demo Booking
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">
      A new free demo has just been booked. Review it in the admin dashboard.
    </p>

    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px;">
        ${infoRow("Parent",  `${booking.parentName} &lt;${booking.parentEmail}&gt;`)}
        ${infoRow("Child",   booking.childName)}
        ${infoRow("Grade",   booking.grade || "—")}
        ${infoRow("Subject", booking.subject)}
        ${infoRow("Tutor",   booking.tutorName || "TBD")}
        ${infoRow("Date",    booking.date)}
        ${infoRow("Time",    `${booking.timeSlot} (${booking.timezone})`)}
      </table>
    </div>

    ${btnPrimary("Open Admin Dashboard →", `${BASE_URL}/dashboard/admin`)}
  `);

  await send(
    ADMIN_EMAIL,
    `📥 New Demo Booking — ${booking.subject} for ${booking.childName} on ${booking.date}`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AVAILABILITY CHANGE REQUEST — sent to parent asking for approval
// ─────────────────────────────────────────────────────────────────────────────
function formatSlotsTable(slots: Record<string, string[]>): string {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const rows = days
    .filter(d => slots[d]?.length)
    .map(d => `<tr>
      <td style="padding:7px 12px;font-size:13px;font-weight:600;color:#444;background:#f8faff;border:1px solid #e8edf5;white-space:nowrap;">${d}</td>
      <td style="padding:7px 12px;font-size:13px;color:#333;background:#fff;border:1px solid #e8edf5;border-left:none;">${slots[d].join(", ")}</td>
    </tr>`).join("");
  if (!rows) return `<p style="font-size:13px;color:#888;margin:0;">No slots set</p>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 3px;">${rows}</table>`;
}

function monthLabel(monthYear: string): string {
  const [y, m] = monthYear.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

export async function sendAvailabilityChangeRequestEmail(params: {
  parentName: string;
  parentEmail: string;
  tutorName: string;
  monthYear: string;
  currentSlots: Record<string, string[]>;
  proposedSlots: Record<string, string[]>;
  reason: string;
  approveUrl: string;
  rejectUrl: string;
  expiresAt: Date;
}) {
  const { parentName, parentEmail, tutorName, monthYear, currentSlots, proposedSlots, reason, approveUrl, rejectUrl, expiresAt } = params;
  const expiry = expiresAt.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      Tutor Availability Change — Your Approval Needed
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${parentName}</strong>, your tutor <strong>${tutorName}</strong> is requesting a change
      to their availability for <strong>${monthLabel(monthYear)}</strong>. As a confirmed student,
      your approval is required before we can apply the change.
    </p>

    ${reason ? `<div style="background:#fff8e6;border:1px solid #fdd68a;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#7a5200;margin:0 0 4px;">Reason for change:</p>
      <p style="font-size:13px;color:#7a5200;margin:0;">${reason}</p>
    </div>` : ""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
      <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;">
        <p style="font-size:12px;font-weight:700;color:#005da8;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Current Schedule</p>
        ${formatSlotsTable(currentSlots)}
      </div>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:14px;padding:16px;">
        <p style="font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px;">Proposed Schedule</p>
        ${formatSlotsTable(proposedSlots)}
      </div>
    </div>

    <div style="text-align:center;margin:24px 0 12px;">
      <a href="${approveUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;text-decoration:none;margin-right:12px;">
        Approve Change
      </a>
      <a href="${rejectUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px;text-decoration:none;">
        Reject Change
      </a>
    </div>

    <p style="font-size:12px;color:#888;text-align:center;margin:12px 0 0;">
      This link expires on <strong>${expiry}</strong>. Questions? Contact us at
      <a href="https://wa.me/919311483555" style="color:#005da8;">WhatsApp</a>.
    </p>
  `);

  await send(
    parentEmail,
    `Action Required: ${tutorName}'s Availability Change for ${monthLabel(monthYear)}`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. AVAILABILITY ADMIN ALERT — tells admin a change request was created
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAvailabilityAdminAlert(params: {
  tutorName: string;
  monthYear: string;
  parentCount: number;
  requestId: string;
}) {
  const { tutorName, monthYear, parentCount, requestId } = params;
  const html = wrapper(`
    <h2 style="font-size:20px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      Availability Change Request Created
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">
      A new availability change request has been created for tutor <strong>${tutorName}</strong>
      (${monthLabel(monthYear)}). Approval emails have been sent to <strong>${parentCount}</strong> parent(s).
    </p>
    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 4px;">
        ${infoRow("Tutor",    tutorName)}
        ${infoRow("Month",    monthLabel(monthYear))}
        ${infoRow("Parents Emailed", String(parentCount))}
        ${infoRow("Request ID", requestId)}
      </table>
    </div>
    ${btnPrimary("View in Admin Dashboard →", `${BASE_URL}/dashboard/admin`)}
  `);

  await send(ADMIN_EMAIL, `Availability Change Request — ${tutorName} (${monthLabel(monthYear)})`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AVAILABILITY APPLIED — confirms to parent the change was applied
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAvailabilityAppliedEmail(params: {
  parentName: string;
  parentEmail: string;
  tutorName: string;
  monthYear: string;
  newSlots: Record<string, string[]>;
}) {
  const { parentName, parentEmail, tutorName, monthYear, newSlots } = params;
  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      Tutor Availability Updated
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;line-height:1.6;">
      Hi <strong>${parentName}</strong>, the availability change for your tutor
      <strong>${tutorName}</strong> for <strong>${monthLabel(monthYear)}</strong> has been applied.
      Here is the updated schedule:
    </p>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">New Schedule</p>
      ${formatSlotsTable(newSlots)}
    </div>
    ${btnPrimary("View My Dashboard →", `${BASE_URL}/dashboard/parent`)}
    <p style="font-size:12px;color:#888;text-align:center;margin:12px 0 0;">
      Questions? Contact us at
      <a href="mailto:${ADMIN_EMAIL}" style="color:#005da8;">${ADMIN_EMAIL}</a>
      or <a href="https://wa.me/919311483555" style="color:#005da8;">WhatsApp</a>.
    </p>
  `);

  await send(parentEmail, `Tutor Schedule Updated — ${tutorName} for ${monthLabel(monthYear)}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. PARENT RESPONSE ALERT — tells admin a parent approved/rejected
// ─────────────────────────────────────────────────────────────────────────────
export async function sendParentResponseAlertToAdmin(params: {
  parentName: string;
  parentEmail: string;
  tutorName: string;
  action: "approve" | "reject";
  allResolved: boolean;
  status: string;
}) {
  const { parentName, parentEmail, tutorName, action, allResolved, status } = params;
  const actionLabel = action === "approve" ? "APPROVED" : "REJECTED";
  const statusColor = action === "approve" ? "#166534" : "#991b1b";
  const html = wrapper(`
    <h2 style="font-size:20px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      Parent ${actionLabel} Availability Change
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">
      <strong>${parentName}</strong> (${parentEmail}) has <strong style="color:${statusColor};">${actionLabel}</strong>
      the availability change for tutor <strong>${tutorName}</strong>.
    </p>
    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;margin-bottom:20px;">
      ${infoRow("Parent", `${parentName} &lt;${parentEmail}&gt;`)}
      ${infoRow("Tutor", tutorName)}
      ${infoRow("Decision", actionLabel)}
      ${infoRow("Overall Status", status)}
      ${infoRow("All Resolved", allResolved ? "Yes" : "No — waiting for other parents")}
    </div>
    ${allResolved && status === "ALL_APPROVED"
      ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
           <p style="font-size:13px;color:#166534;font-weight:700;margin:0;">All parents have approved! You can now apply the change from the admin dashboard.</p>
         </div>`
      : ""}
    ${btnPrimary("Open Admin Dashboard →", `${BASE_URL}/dashboard/admin`)}
  `);

  await send(
    ADMIN_EMAIL,
    `Parent ${actionLabel} — ${tutorName} Availability Change`,
    html,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. NEW USER ALERT — tells admin when someone registers
// ─────────────────────────────────────────────────────────────────────────────
export async function sendAdminNewUserAlert(user: {
  name:    string;
  email:   string;
  phone?:  string | null;
  role:    string;
}) {
  const roleLabel  = user.role === "TUTOR" ? "Tutor" : "Parent";
  const roleColor  = user.role === "TUTOR" ? "#7c3aed" : "#1d4ed8";
  const roleBg     = user.role === "TUTOR" ? "#ede9fe" : "#dbeafe";

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      🎉 New ${roleLabel} Registered
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 20px;">
      A new ${roleLabel.toLowerCase()} just signed up on Zippy Minds Academy.
    </p>
    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="6">
        ${infoRow("Name",  user.name)}
        ${infoRow("Email", user.email)}
        ${infoRow("Phone", user.phone ?? "Not provided")}
        ${infoRow("Role",  `<span style="background:${roleBg};color:${roleColor};font-weight:700;padding:2px 10px;border-radius:20px;font-size:12px;">${roleLabel}</span>`)}
      </table>
    </div>
    ${user.role === "TUTOR"
      ? `<div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
           <p style="font-size:13px;color:#7c3aed;font-weight:700;margin:0;">⚠️ This tutor is pending approval. Review and approve from the admin dashboard.</p>
         </div>`
      : ""}
    ${btnPrimary("Open Admin Dashboard →", `${BASE_URL}/dashboard/admin`)}
  `);

  await send(ADMIN_EMAIL, `🎉 New ${roleLabel} — ${user.name} (${user.email})`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. TUTOR NEW SESSION REQUEST — sent to tutor when a parent books a demo
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTutorNewRequestEmail(params: {
  tutorName:   string;
  tutorEmail:  string;
  parentName:  string;
  parentEmail: string;
  childName:   string;
  subject:     string;
  grade:       string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
}) {
  const { tutorName, tutorEmail, parentName, childName, subject, grade, date, timeSlot, timezone } = params;

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      📋 New Demo Request
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 6px;">
      Hi <strong>${tutorName}</strong>, you have a new demo session request waiting for your confirmation.
    </p>
    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;margin:16px 0;">
      <table width="100%" cellpadding="0" cellspacing="6">
        ${infoRow("Student",  childName)}
        ${infoRow("Grade",    grade)}
        ${infoRow("Subject",  subject)}
        ${infoRow("Date",     date)}
        ${infoRow("Time",     `${timeSlot} (${timezone})`)}
        ${infoRow("Parent",   parentName)}
      </table>
    </div>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <p style="font-size:13px;color:#c2410c;font-weight:700;margin:0;">
        ⏰ Please log in and accept or decline this request as soon as possible.
      </p>
    </div>
    ${btnPrimary("Go to Tutor Dashboard →", `${BASE_URL}/dashboard/tutor`)}
  `);

  await send(tutorEmail, `📋 New Demo Request — ${subject} for ${childName} on ${date}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. TUTOR SESSION CONFIRMED — sent to tutor when Zoom link is ready
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTutorSessionConfirmedEmail(params: {
  tutorName:   string;
  tutorEmail:  string;
  parentName:  string;
  childName:   string;
  subject:     string;
  grade:       string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
  zoomStartUrl?: string | null;
  zoomLink?:     string | null;
}) {
  const { tutorName, tutorEmail, parentName, childName, subject, grade, date, timeSlot, timezone, zoomStartUrl, zoomLink } = params;
  const meetingUrl = zoomStartUrl ?? zoomLink ?? "";

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      🎊 Session Confirmed — Zoom Ready!
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 6px;">
      Hi <strong>${tutorName}</strong>, your session has been confirmed and the Zoom meeting is ready.
    </p>
    <div style="background:#f0f7ff;border:1px solid #c7dcf5;border-radius:14px;padding:16px;margin:16px 0;">
      <table width="100%" cellpadding="0" cellspacing="6">
        ${infoRow("Student",  childName)}
        ${infoRow("Grade",    grade)}
        ${infoRow("Subject",  subject)}
        ${infoRow("Date",     date)}
        ${infoRow("Time",     `${timeSlot} (${timezone})`)}
        ${infoRow("Parent",   parentName)}
      </table>
    </div>
    ${meetingUrl
      ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:14px;padding:18px;margin-bottom:20px;text-align:center;">
           <p style="font-size:13px;font-weight:700;color:#166534;margin:0 0 12px;">🎥 Your Host Link (Start the Meeting)</p>
           <a href="${meetingUrl}" style="display:inline-block;background:#059669;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
             Start Zoom Meeting →
           </a>
         </div>`
      : ""}
    ${btnPrimary("Open Tutor Dashboard →", `${BASE_URL}/dashboard/tutor`)}
  `);

  await send(tutorEmail, `🎊 Confirmed — ${subject} with ${childName} on ${date}`, html);
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SESSION REMINDER — sent 30 min before to both parent and tutor
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSessionReminderEmail(params: {
  to:          string;
  toName:      string;
  role:        "parent" | "tutor";
  childName:   string;
  subject:     string;
  date:        string;
  timeSlot:    string;
  timezone:    string;
  tutorName:   string;
  zoomLink?:   string | null;
  zoomStartUrl?: string | null;
}) {
  const { to, toName, role, childName, subject, date, timeSlot, timezone, tutorName, zoomLink, zoomStartUrl } = params;
  const meetingUrl = role === "tutor" ? (zoomStartUrl ?? zoomLink ?? "") : (zoomLink ?? "");

  const html = wrapper(`
    <h2 style="font-size:22px;font-weight:800;color:#0d1b2e;margin:4px 0 6px;">
      ⏰ Your Session Starts in 30 Minutes!
    </h2>
    <p style="font-size:14px;color:#555;margin:0 0 6px;">
      Hi <strong>${toName}</strong>, your ${subject} session is coming up soon. Get ready!
    </p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:16px;margin:16px 0;">
      <table width="100%" cellpadding="0" cellspacing="6">
        ${infoRow("Subject",  subject)}
        ${role === "parent" ? infoRow("Student",  childName) : infoRow("Student", childName)}
        ${infoRow("Tutor",    tutorName)}
        ${infoRow("Time",     `${timeSlot} (${timezone})`)}
        ${infoRow("Date",     date)}
      </table>
    </div>
    ${meetingUrl
      ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:14px;padding:18px;margin-bottom:20px;text-align:center;">
           <p style="font-size:13px;font-weight:700;color:#166534;margin:0 0 12px;">🎥 ${role === "tutor" ? "Start the meeting (host link)" : "Join your session"}</p>
           <a href="${meetingUrl}" style="display:inline-block;background:#059669;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
             ${role === "tutor" ? "Start Zoom Meeting →" : "Join Zoom Meeting →"}
           </a>
         </div>`
      : `<p style="font-size:13px;color:#666;text-align:center;">Your Zoom link will be shared shortly. Check your dashboard.</p>`}
    ${btnPrimary("Open Dashboard →", `${BASE_URL}/${role === "tutor" ? "dashboard/tutor" : "dashboard/parent"}`)}
  `);

  await send(to, `⏰ Reminder: ${subject} session in 30 mins — ${timeSlot}`, html);
}

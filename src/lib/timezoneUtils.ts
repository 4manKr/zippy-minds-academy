/**
 * Timezone conversion utilities
 *
 * All slot times entered by tutors / admin are treated as IST (Asia/Kolkata, UTC+5:30).
 * This module converts those IST slots into any IANA target timezone for display.
 */

const IST = "Asia/Kolkata";

/**
 * Parse an IST slot string ("9:00 AM", "4:00 PM") + an ISO date ("2026-05-25")
 * and return a proper UTC Date object.
 */
export function istSlotToDate(slotIST: string, isoDate: string): Date {
  const [timePart, period] = slotIST.trim().split(" ");
  const [hStr, mStr] = timePart.split(":");
  let hour = parseInt(hStr, 10);
  const min  = parseInt(mStr ?? "0", 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour  = 0;

  const hh = String(hour).padStart(2, "0");
  const mm = String(min).padStart(2, "0");
  // Build an ISO-8601 string with IST offset so Date.parse gives correct UTC
  return new Date(`${isoDate}T${hh}:${mm}:00+05:30`);
}

/**
 * Convert an IST slot label to the display string in the target timezone.
 * Returns e.g. "11:30 PM" or "11:30 PM (prev day)" / "1:30 AM (next day)"
 * when the conversion crosses midnight.
 *
 * If toTz is already "Asia/Kolkata" the original label is returned unchanged.
 */
export function convertSlotToTz(
  slotIST: string,
  isoDate: string,
  toTz: string,
): string {
  if (toTz === IST) return slotIST; // no conversion needed

  try {
    const d = istSlotToDate(slotIST, isoDate);

    const timeStr = d.toLocaleString("en-US", {
      timeZone: toTz,
      hour:     "numeric",
      minute:   "2-digit",
      hour12:   true,
    });

    // Detect date shift (e.g. 9 AM IST → 3:30 AM EST previous day)
    const convDateStr = d.toLocaleDateString("en-CA", { timeZone: toTz }); // YYYY-MM-DD
    if (convDateStr < isoDate) return `${timeStr} (prev day)`;
    if (convDateStr > isoDate) return `${timeStr} (next day)`;
    return timeStr;
  } catch {
    return slotIST; // fall back to original if Intl fails
  }
}

/**
 * Returns true when the given IST slot on TODAY has already passed
 * (+ a 1-hour booking buffer), so it should be greyed-out.
 * Uses IST as the reference clock — the slot is past when it's past in IST.
 */
export function isSlotPastIST(slotIST: string): boolean {
  const nowIST = new Date().toLocaleString("en-CA", {
    timeZone: IST,
    hour:     "2-digit",
    minute:   "2-digit",
    hour12:   false,
  }); // "HH:MM"
  const [nowH, nowM] = nowIST.split(":").map(Number);
  const nowMins = nowH * 60 + nowM + 60; // +60 min buffer

  const [timePart, period] = slotIST.trim().split(" ");
  const [hStr, mStr] = timePart.split(":");
  let hour = parseInt(hStr, 10);
  const min  = parseInt(mStr ?? "0", 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour  = 0;

  return (hour * 60 + min) <= nowMins;
}

/**
 * Lightweight input validation helpers — no external library needed.
 * Call sanitize() on every string before writing to DB.
 */

/** Strip leading/trailing whitespace and cap length */
export function sanitize(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Validate phone/WhatsApp — digits, spaces, +, -, (, ) allowed */
export function isValidPhone(phone: string): boolean {
  return /^[+\d\s\-().]{7,20}$/.test(phone.trim());
}

/** Ensure a string is one of an allowed set of values */
export function isOneOf<T extends string>(value: unknown, allowed: T[]): value is T {
  return typeof value === "string" && (allowed as string[]).includes(value);
}

/** Check a numeric value is within a range */
export function inRange(value: unknown, min: number, max: number): boolean {
  const n = Number(value);
  return !isNaN(n) && n >= min && n <= max;
}

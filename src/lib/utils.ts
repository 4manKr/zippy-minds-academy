import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(date));
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export const TIMEZONES = [
  { label: "IST — India Standard Time", value: "Asia/Kolkata", offset: "+5:30" },
  { label: "EST — Eastern Standard Time", value: "America/New_York", offset: "-5:00" },
  { label: "PST — Pacific Standard Time", value: "America/Los_Angeles", offset: "-8:00" },
  { label: "GMT — Greenwich Mean Time", value: "Europe/London", offset: "+0:00" },
  { label: "GST — Gulf Standard Time", value: "Asia/Dubai", offset: "+4:00" },
  { label: "SGT — Singapore Time", value: "Asia/Singapore", offset: "+8:00" },
  { label: "AEST — Australian Eastern Time", value: "Australia/Sydney", offset: "+10:00" },
  { label: "CST — Central Standard Time", value: "America/Chicago", offset: "-6:00" },
  { label: "CET — Central European Time", value: "Europe/Paris", offset: "+1:00" },
];

export const SUBJECTS = [
  "Mathematics", "Science", "English", "Hindi", "Physics",
  "Chemistry", "Biology", "Computer Science", "History",
  "Geography", "Economics", "Accountancy", "Business Studies",
];

export const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12",
];

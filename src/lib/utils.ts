import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(date));
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export const TIMEZONES = [
  { label: "IST — India Standard Time",       value: "Asia/Kolkata",        offset: "+5:30"  },
  { label: "EST — Eastern Standard Time",      value: "America/New_York",    offset: "-5:00"  },
  { label: "PST — Pacific Standard Time",      value: "America/Los_Angeles", offset: "-8:00"  },
  { label: "GMT — Greenwich Mean Time",        value: "Europe/London",       offset: "+0:00"  },
  { label: "GST — Gulf Standard Time",         value: "Asia/Dubai",          offset: "+4:00"  },
  { label: "SGT — Singapore Time",             value: "Asia/Singapore",      offset: "+8:00"  },
  { label: "AEST — Australian Eastern Time",   value: "Australia/Sydney",    offset: "+10:00" },
  { label: "CST — Central Standard Time",      value: "America/Chicago",     offset: "-6:00"  },
  { label: "CET — Central European Time",      value: "Europe/Paris",        offset: "+1:00"  },
  { label: "CAT — Canada Atlantic Time",       value: "America/Halifax",     offset: "-4:00"  },
  { label: "MST — Mountain Standard Time",     value: "America/Denver",      offset: "-7:00"  },
  { label: "MYT — Malaysia Time",              value: "Asia/Kuala_Lumpur",   offset: "+8:00"  },
];

// Actual Zippy Minds Academy subjects
export const SUBJECTS = [
  "Phonics",
  "English Grammar",
  "Mathematics",
  "Public Speaking",
  "Writing & Communication",
  "Coding",
  "Science",
  "Life Skills",
  "Hindi",
  "General Knowledge",
  "Creative Arts",
  "Social Studies",
];

export const GRADES = [
  "Pre-K (Age 3-4)",
  "Kindergarten (Age 5-6)",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

// Brand colour map for each subject (matches the promotional image)
export const SUBJECT_COLORS: Record<string, { bg: string; text: string; icon: string; gradient: string }> = {
  "Phonics":                { bg: "bg-pink-50",   text: "text-pink-600",   icon: "🔤", gradient: "from-pink-400 to-rose-500"     },
  "English Grammar":        { bg: "bg-blue-50",   text: "text-blue-600",   icon: "💬", gradient: "from-blue-400 to-brand-blue"   },
  "Mathematics":            { bg: "bg-purple-50", text: "text-purple-600", icon: "🔢", gradient: "from-purple-400 to-brand-purple"},
  "Public Speaking":        { bg: "bg-orange-50", text: "text-orange-600", icon: "🎤", gradient: "from-orange-400 to-yellow-400" },
  "Writing & Communication":{ bg: "bg-teal-50",   text: "text-teal-600",   icon: "✏️",  gradient: "from-teal-400 to-cyan-500"     },
  "Coding":                 { bg: "bg-indigo-50", text: "text-indigo-600", icon: "💻", gradient: "from-indigo-400 to-blue-600"   },
  "Science":                { bg: "bg-green-50",  text: "text-green-600",  icon: "🔬", gradient: "from-green-400 to-emerald-500" },
  "Life Skills":            { bg: "bg-yellow-50", text: "text-yellow-600", icon: "🌟", gradient: "from-yellow-400 to-orange-400" },
  "Hindi":                  { bg: "bg-red-50",    text: "text-red-600",    icon: "🇮🇳", gradient: "from-red-400 to-orange-500"   },
  "General Knowledge":      { bg: "bg-cyan-50",   text: "text-cyan-600",   icon: "🌍", gradient: "from-cyan-400 to-teal-500"     },
  "Creative Arts":          { bg: "bg-fuchsia-50",text: "text-fuchsia-600",icon: "🎨", gradient: "from-fuchsia-400 to-pink-500"  },
  "Social Studies":         { bg: "bg-amber-50",  text: "text-amber-600",  icon: "📚", gradient: "from-amber-400 to-orange-400"  },
};

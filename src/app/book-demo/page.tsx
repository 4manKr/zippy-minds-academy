"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle, ChevronRight, User, BookOpen, Calendar,
  Clock, Globe, ArrowRight, Sparkles, Zap, Video, Mail, LogIn, Phone,
} from "lucide-react";
import { SUBJECTS, GRADES, TIMEZONES } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "Student Details" },
  { id: 2, label: "Choose Subject"  },
  { id: 3, label: "Pick Time Slot"  },
  { id: 4, label: "Confirm"         },
];

// Fallback pool — used when no approved DB tutor exists for a subject
const tutorPool: Record<string, { name: string; initials: string; color: string; rating: number; experience: string }> = {
  "Phonics":                 { name: "Ms. Ananya Singh",  initials: "AS", color: "from-pink-400 to-rose-500",     rating: 4.9, experience: "10 years" },
  "English Grammar":         { name: "Ms. Priya Sharma",  initials: "PS", color: "from-blue-400 to-blue-600",     rating: 4.8, experience: "8 years"  },
  "Mathematics":             { name: "Mr. Rahul Verma",   initials: "RV", color: "from-purple-400 to-purple-600", rating: 4.9, experience: "9 years"  },
  "Public Speaking":         { name: "Ms. Kavya Nair",    initials: "KN", color: "from-orange-400 to-yellow-400", rating: 4.8, experience: "7 years"  },
  "Writing & Communication": { name: "Ms. Sunita Rao",    initials: "SR", color: "from-teal-400 to-cyan-500",     rating: 4.7, experience: "6 years"  },
  "Coding":                  { name: "Mr. Arjun Mehta",   initials: "AM", color: "from-indigo-400 to-blue-600",   rating: 4.9, experience: "5 years"  },
  "Science":                 { name: "Dr. Meera Patel",   initials: "MP", color: "from-green-400 to-emerald-500", rating: 4.8, experience: "9 years"  },
  "Life Skills":             { name: "Mr. Rohan Gupta",   initials: "RG", color: "from-yellow-400 to-orange-400", rating: 4.7, experience: "8 years"  },
  "Hindi":                   { name: "Ms. Kavita Sharma", initials: "KS", color: "from-red-400 to-orange-500",    rating: 4.7, experience: "7 years"  },
  "General Knowledge":       { name: "Mr. Vikram Nair",   initials: "VN", color: "from-cyan-400 to-teal-500",     rating: 4.6, experience: "6 years"  },
  "Creative Arts":           { name: "Ms. Divya Iyer",    initials: "DI", color: "from-fuchsia-400 to-pink-500",  rating: 4.8, experience: "5 years"  },
  "Social Studies":          { name: "Ms. Rekha Pillai",  initials: "RP", color: "from-amber-400 to-orange-400",  rating: 4.7, experience: "6 years"  },
};

// Gradient colors assigned to DB tutors (cycles by index)
const DB_TUTOR_COLORS = [
  "from-violet-400 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-indigo-400 to-violet-600",
  "from-cyan-400 to-sky-600",
  "from-fuchsia-400 to-rose-500",
];

interface DisplayTutor {
  name: string;
  initials: string;
  color: string;
  rating: number;
  experience: string;
}

interface DbTutor { id: string; name: string; initials: string; availability?: Record<string, string[]>; }

const DEFAULT_TUTOR: DisplayTutor = {
  name: "Available Tutor", initials: "AT",
  color: "from-primary to-primary-container",
  rating: 4.8, experience: "5+ years",
};

// All possible time slots — availability will be derived from the tutor's declared schedule
const ALL_TIME_SLOTS = [
  { id: 1, time: "9:00 AM"  },
  { id: 2, time: "10:00 AM" },
  { id: 3, time: "11:00 AM" },
  { id: 4, time: "2:00 PM"  },
  { id: 5, time: "3:00 PM"  },
  { id: 6, time: "4:00 PM"  },
  { id: 7, time: "5:00 PM"  },
  { id: 8, time: "6:00 PM"  },
  { id: 9, time: "7:00 PM"  },
];

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Parse "9:00 AM" / "2:00 PM" → total minutes since midnight
function parseSlotMinutes(time: string): number {
  const [timePart, period] = time.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let hour = parseInt(hStr, 10);
  const min  = parseInt(mStr || "0", 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + min;
}

function buildCalendarDates() {
  const today = new Date();
  // Show today + next 20 days (21 total) so parents can book well ahead
  return Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dayShort:   DAY_SHORT[d.getDay()],
      dateNum:    d.getDate(),
      monthShort: MONTH_SHORT[d.getMonth()],
      monthYear:  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      fullDate:   `${MONTH_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      isoDate:    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,
      isToday:    i === 0,
    };
  });
}

interface BookingResult {
  zoomLink?:  string | null;
  zoomReady?: boolean;
  booking?:   { id: string; date?: string; timeSlot?: string };
}

function BookDemoInner() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>(1);
  const [confirmed, setConfirmed]     = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [otpPhase, setOtpPhase]       = useState<"idle" | "sent" | "verifying">("idle");
  const [otp, setOtp]                 = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // Auth state — check if user is logged in
  const [authUser, setAuthUser]       = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Subjects from DB (admin-managed courses); falls back to static list if empty
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);

  // Live DB tutors: subject → merged availability
  const [dbTutorBySubject, setDbTutorBySubject] = useState<Record<string, DbTutor>>({});

  // Booked slots for the selected date + subject: { "4:00 PM": "Tutor Name" }
  const [bookedSlots, setBookedSlots] = useState<Record<string, string>>({});

  // Preview: which tutor would be assigned for the selected slot
  const [previewTutor, setPreviewTutor] = useState<{ name: string; initials: string } | null>(null);

  // Build dynamic calendar dates once (client-side only to avoid SSR mismatch)
  const calendarDates = useMemo(() => buildCalendarDates(), []);

  // Read ?subject= from URL (set when coming from the Courses page)
  const searchParams = useSearchParams();
  const preSubject = useMemo(() => {
    return searchParams.get("subject") ?? "";
  }, [searchParams]);

  const [form, setForm] = useState({
    parentName: "", parentEmail: "",
    childName: "", childAge: "", grade: "",
    timezone: "Asia/Kolkata", subject: preSubject,
    selectedDateIdx: 0,
    selectedSlot: null as number | null,
    notes: "",
    whatsappNumber: "",
  });

  // Check auth + auto-fill email/name for logged-in users
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => {
        const u = d.user ?? null;
        setAuthUser(u);
        if (u) {
          setForm(f => ({
            ...f,
            parentEmail: u.email ?? f.parentEmail,
            parentName:  u.name  ?? f.parentName,
          }));
        }
      })
      .catch(() => setAuthUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  // Fetch active subjects from DB (admin-managed courses)
  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.ok ? r.json() : { subjects: [] })
      .then((data) => {
        if (Array.isArray(data.subjects) && data.subjects.length > 0) {
          setDbSubjects(data.subjects);
        }
      })
      .catch(() => {/* silently fall back to static SUBJECTS */})
      .finally(() => setSubjectsLoaded(true));
  }, []);

  // Fetch approved tutors from DB on mount (includes availability per subject)
  useEffect(() => {
    fetch("/api/tutors")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.tutorBySubject) setDbTutorBySubject(data.tutorBySubject); })
      .catch(() => {/* silently fall back to tutorPool */});
  }, []);

  // If logged-in user already has a demo booking, redirect to enroll page
  useEffect(() => {
    fetch("/api/bookings/status")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.hasDemo) {
          const dest = preSubject
            ? `/enroll?subject=${encodeURIComponent(preSubject)}`
            : "/enroll";
          router.replace(dest);
        }
      })
      .catch(() => {});
  }, [preSubject, router]);

  // Auto-detect browser timezone on mount
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setForm((f) => ({ ...f, timezone: detected }));
  }, []);

  // Fetch already-booked slots for the selected date + subject
  useEffect(() => {
    const dateEntry = calendarDates[form.selectedDateIdx];
    if (!form.subject || !dateEntry?.isoDate) { setBookedSlots({}); return; }
    fetch(`/api/bookings/slots?date=${dateEntry.isoDate}&subject=${encodeURIComponent(form.subject)}`)
      .then(r => r.ok ? r.json() : { booked: {} })
      .then(d => setBookedSlots(d.booked ?? {}))
      .catch(() => setBookedSlots({}));
  }, [form.subject, form.selectedDateIdx, calendarDates]);

  // Fetch preview tutor for the selected slot + subject
  useEffect(() => {
    const dateEntry = calendarDates[form.selectedDateIdx];
    const day = dateEntry?.dayShort ?? "";
    const slot = ALL_TIME_SLOTS.find(s => s.id === form.selectedSlot)?.time;
    if (!form.subject || !slot) { setPreviewTutor(null); return; }
    fetch(`/api/tutors/for-slot?subject=${encodeURIComponent(form.subject)}&timeSlot=${encodeURIComponent(slot)}&days=${day}`)
      .then(r => r.ok ? r.json() : { tutor: null })
      .then(d => setPreviewTutor(d.tutor ?? null))
      .catch(() => setPreviewTutor(null));
  }, [form.subject, form.selectedSlot, form.selectedDateIdx, calendarDates]);

  const nextStep = () => setStep((s) => Math.min(4, s + 1) as Step);
  const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

  // "Back" handler — if on Step 2 with OTP already sent, go back within Step 2 first
  const handleBack = () => {
    setBookingError("");
    if (step === 2 && otpPhase !== "idle") {
      setOtpPhase("idle");
      setOtp("");
    } else {
      prevStep();
    }
  };

  // Resolve display tutor: DB first → fallback pool → DEFAULT
  function getDisplayTutor(subject: string): DisplayTutor {
    const db = dbTutorBySubject[subject];
    if (db) {
      const colorIdx = db.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % DB_TUTOR_COLORS.length;
      return {
        name:       db.name,
        initials:   db.initials,
        color:      DB_TUTOR_COLORS[colorIdx],
        rating:     4.8,
        experience: "Verified tutor",
      };
    }
    return tutorPool[subject] ?? DEFAULT_TUTOR;
  }

  // Use DB subjects only — no hardcoded fallback
  const activeSubjects = dbSubjects;

  const selectedDateEntry   = calendarDates[form.selectedDateIdx];
  const selectedDateLabel   = selectedDateEntry?.fullDate ?? "";
  const assignedTutor       = getDisplayTutor(form.subject);
  const selectedSlotLabel   = ALL_TIME_SLOTS.find((s) => s.id === form.selectedSlot)?.time ?? "Not selected";

  // Derive tutor availability map and which days have declared slots
  const tutorAvail: Record<string, string[]> = useMemo(() => {
    const dbTutor = dbTutorBySubject[form.subject];
    return dbTutor?.availability ?? {};
  }, [dbTutorBySubject, form.subject]);

  const tutorHasAnyAvail = useMemo(
    () => Object.values(tutorAvail).some(v => Array.isArray(v) && v.length > 0),
    [tutorAvail],
  );

  // Whether a DB tutor is matched for the selected subject
  const hasDbTutor = !!dbTutorBySubject[form.subject];

  // Compute available time slots for the selected date based on tutor's availability
  const timeSlots = useMemo(() => {
    const dateEntry = calendarDates[form.selectedDateIdx];
    const dayName   = dateEntry?.dayShort ?? "";

    const declaredDaySlots = tutorAvail[dayName];
    let daySlots: string[];

    if (!hasDbTutor) {
      // No DB tutor — show all slots generically (tutorPool fallback)
      daySlots = ALL_TIME_SLOTS.map(s => s.time);
    } else if (tutorHasAnyAvail) {
      // Tutor has declared availability → strict: only use declared slots for this day.
      // Empty/undeclared day means tutor is NOT available that day.
      daySlots = (Array.isArray(declaredDaySlots) && declaredDaySlots.length > 0)
        ? declaredDaySlots
        : [];
    } else {
      // Tutor exists but hasn't set up availability yet → show all (pending confirmation)
      daySlots = ALL_TIME_SLOTS.map(s => s.time);
    }

    // For today — filter out slots that have already passed (+ 1 hr buffer)
    const nowMinutes = dateEntry?.isToday
      ? (() => {
          const n = new Date();
          return n.getHours() * 60 + n.getMinutes() + 60; // 1-hour booking buffer
        })()
      : -1; // -1 means no filtering needed

    return ALL_TIME_SLOTS.map(s => {
      const tutorHasSlot = daySlots.includes(s.time);
      const isPast       = nowMinutes >= 0 && parseSlotMinutes(s.time) <= nowMinutes;
      return { ...s, available: tutorHasSlot && !isPast, isPast };
    });
  }, [form.subject, form.selectedDateIdx, dbTutorBySubject, calendarDates]);
  const tzLabel             = TIMEZONES.find((t) => t.value === form.timezone)?.label ?? form.timezone;

  // Step 2: check duplicate → send OTP
  const handleSendOtp = async () => {
    if (!form.parentEmail) { setBookingError("Please enter your email address."); return; }
    if (!form.subject)     { setBookingError("Please select a subject first."); return; }
    setConfirming(true);
    setBookingError("");
    try {
      // If this email already has a demo, redirect to enroll instead of showing an error
      const checkRes = await fetch("/api/bookings/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.parentEmail }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        const dest = form.subject
          ? `/enroll?subject=${encodeURIComponent(form.subject)}`
          : "/enroll";
        router.push(dest);
        return;
      }

      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.parentEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpPhase("sent");
    } catch (e: unknown) {
      setBookingError(e instanceof Error ? e.message : "Failed to send code.");
    } finally {
      setConfirming(false);
    }
  };

  // Step 2 "Verify & Continue": OTP is stored in state; actual verification happens on final submit
  const handleVerifyAndContinue = () => {
    if (otp.length < 6) { setBookingError("Please enter the 6-digit code sent to your email."); return; }
    setBookingError("");
    nextStep(); // advance to Step 3
  };

  // Step 4: create booking (OTP verified server-side here)
  const handleConfirm = async () => {
    setConfirming(true);
    setBookingError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: form.parentName, parentEmail: form.parentEmail, otp,
          childName: form.childName, childAge: form.childAge, grade: form.grade,
          timezone: form.timezone, subject: form.subject,
          tutorName: assignedTutor.name, tutorInitials: assignedTutor.initials,
          date: selectedDateLabel, timeSlot: selectedSlotLabel,
          notes: form.notes, monthlyPrice: 0,
          whatsappNumber: form.whatsappNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookingResult({
        zoomLink:  data.booking?.zoomLink ?? null,
        zoomReady: data.zoomReady ?? false,
        booking:   data.booking,
      });
      setConfirmed(true);
    } catch (e: unknown) {
      setBookingError(e instanceof Error ? e.message : "Booking failed. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  /* ── Success screen ── */
  if (confirmed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl shadow-card-hover p-10 text-center border border-outline-variant">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Demo Booked! 🎉</h2>
          <p className="text-on-surface-variant mb-6 text-sm">
            {bookingResult?.zoomReady
              ? "Your Zoom session link is ready! Click below to join when it's time."
              : "We'll send your Zoom link to your email within 2 hours."}
          </p>

          {/* Zoom link — shown immediately if generated */}
          {bookingResult?.zoomLink && (
            <a
              href={bookingResult.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-white mb-4 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#2D8CFF" }}
            >
              <Video size={20} />
              Join Zoom Session
            </a>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap size={13} className="text-amber-600" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Tutor Assignment Pending</span>
              </div>
              <p className="font-bold text-on-surface">Your tutor is being matched</p>
              <p className="text-xs text-on-surface-variant mt-0.5">You'll see your tutor's name in your dashboard once the session is confirmed</p>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-5 text-left mb-6 space-y-3 text-sm">
            {[
              { label: "Student",      value: form.childName || "Your child" },
              { label: "Subject",      value: form.subject || "—" },
              { label: "Date",         value: selectedDateLabel },
              { label: "Time",         value: selectedSlotLabel },
              { label: "Session Type", value: "FREE Demo (30 min)" },
              { label: "Status",       value: bookingResult?.zoomReady ? "✅ Confirmed" : "⏳ Pending confirmation" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-on-surface-variant">{label}</span>
                <span className="font-semibold text-on-surface">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/parent" className="w-full btn-primary justify-center py-3">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/" className="block w-full text-center text-sm text-on-surface-variant hover:text-on-surface py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Auth loading ── */
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Login gate (not signed in) ── */
  if (!authUser) {
    const bookDemoUrl = preSubject ? `/book-demo?subject=${encodeURIComponent(preSubject)}` : "/book-demo";
    const signupUrl   = `/auth/signup?redirect=${encodeURIComponent(bookDemoUrl)}`;
    const loginUrl    = `/auth/login?redirect=${encodeURIComponent(bookDemoUrl)}`;
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full text-center">
          {/* Decorative */}
          <div className="text-6xl mb-6 animate-bounce">🎓</div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface mb-2">
            Book a Free Demo Session
          </h1>
          <p className="text-on-surface-variant mb-8 text-base leading-relaxed">
            Create a free account or sign in to book your child&apos;s{" "}
            <span className="font-semibold text-primary">free 30-minute demo session</span> with an expert tutor.
          </p>

          <div className="bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant p-8 space-y-4">
            {/* Benefits strip */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "🆓", label: "Completely Free"    },
                { icon: "👩‍🏫", label: "Expert Tutor"       },
                { icon: "📅", label: "Pick Your Time"     },
                { icon: "🌍", label: "Any Timezone"       },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface">
                  <span className="text-base">{icon}</span> {label}
                </div>
              ))}
            </div>

            <a href={signupUrl}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-primary text-on-primary rounded-2xl font-bold text-base shadow-sm hover:opacity-90 active:scale-95 transition-all">
              <User size={18} /> Create Free Account
            </a>
            <a href={loginUrl}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-surface-container border border-outline-variant text-on-surface rounded-2xl font-bold text-base hover:bg-surface-container-high active:scale-95 transition-all">
              <LogIn size={18} /> Log In to My Account
            </a>

            <p className="text-xs text-on-surface-variant pt-2">
              No credit card required · Takes under 1 minute to sign up
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen bg-surface pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/40 rounded-full px-4 py-2 text-sm font-semibold text-secondary mb-4">
            🎉 Free 30-minute demo · No credit card required
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">Book Your Free Demo Session</h1>
          <p className="text-on-surface-variant mt-2">
            We&apos;ll match you with the best available tutor for your subject automatically.
          </p>
          {/* Pre-selected subject banner (when arriving from Courses page) */}
          {preSubject && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700">
              <CheckCircle size={15} /> Subject pre-selected: <span className="font-bold">{preSubject}</span>
            </div>
          )}
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                step > s.id ? "bg-green-500 text-white" :
                step === s.id ? "bg-primary text-on-primary" :
                               "bg-surface-container text-on-surface-variant"
              }`}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? "text-on-surface" : "text-on-surface-variant"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-outline-variant ml-auto mr-2 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant p-8">

          {/* ── Step 1 — Student Details (no email) ── */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <User size={22} className="text-primary" /> Tell us about your child
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Your Name (Parent)</label>
                  <input type="text" placeholder="e.g. John Smith" value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Child&apos;s Full Name</label>
                  <input type="text" placeholder="e.g. Alex Smith" value={form.childName}
                    onChange={(e) => setForm({ ...form, childName: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Age</label>
                    <input type="number" placeholder="e.g. 8" min={3} max={18} value={form.childAge}
                      onChange={(e) => setForm({ ...form, childAge: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Grade / Year</label>
                    <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="input-field">
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                    <Globe size={15} className="text-primary" /> Your Timezone
                  </label>
                  <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="input-field">
                    {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                    <Phone size={15} className="text-primary" /> WhatsApp Number
                    <span className="text-on-surface-variant font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg select-none">💬</span>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    We'll send session reminders &amp; updates on WhatsApp
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2 — Subject (logged-in: no OTP needed) ── */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <BookOpen size={22} className="text-primary" /> Choose a Subject
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                We&apos;ll automatically match your child with the best available tutor.
              </p>

              {/* Logged-in indicator */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-5">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Booking as <span className="font-bold">{authUser.name}</span></p>
                  <p className="text-xs text-green-600">{authUser.email} · Already verified</p>
                </div>
              </div>

              {/* ── Subject section ── */}
              {preSubject ? (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Subject pre-selected</p>
                    <p className="text-base font-bold text-on-surface">{preSubject}</p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-base font-bold text-on-surface mb-2 flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" /> What subject does your child need?
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Select the subject and we&apos;ll assign the best available tutor automatically.
                  </p>
                  {!subjectsLoaded ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-surface-container animate-pulse" />
                      ))}
                    </div>
                  ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {activeSubjects.map((s) => {
                      const hasTutor = !!(dbTutorBySubject[s] || tutorPool[s]);
                      return (
                        <button key={s} onClick={() => setForm({ ...form, subject: s })}
                          className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                            form.subject === s
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-outline-variant text-on-surface-variant hover:border-primary/50 hover:bg-surface-container"
                          }`}>
                          <p className="font-semibold">{s}</p>
                          {hasTutor && <p className="text-xs text-on-surface-variant mt-1 font-normal">Free demo available</p>}
                        </button>
                      );
                    })}
                  </div>
                  )}
                </>
              )}

              {/* Tutor assignment notice */}
              {form.subject && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white shrink-0">
                    <Sparkles size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles size={13} className="text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">Tutor for {form.subject}</span>
                    </div>
                    <p className="font-bold text-on-surface">Best-matched tutor will be assigned</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">You&apos;ll see your tutor&apos;s details once the session is confirmed</p>
                  </div>
                  <CheckCircle size={20} className="text-primary shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* ── Step 3 — Time Slot ── */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
                <Calendar size={22} className="text-primary" /> Select Date &amp; Time
              </h2>
              <p className="text-sm text-on-surface-variant mb-4">
                Showing times in <span className="font-medium text-on-surface">{tzLabel}</span>
                {hasDbTutor && tutorHasAnyAvail && (
                  <> · <span className="text-primary font-medium">
                    Available slots only
                  </span></>
                )}
                {hasDbTutor && !tutorHasAnyAvail && (
                  <> · <span className="text-amber-600 font-medium">
                    Availability pending — tutor will confirm
                  </span></>
                )}
              </p>

              {/* Tutor availability summary — only when the DB tutor has declared slots */}
              {tutorHasAnyAvail && (
                <div className="mb-5 p-3 bg-primary/5 border border-primary/15 rounded-2xl flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mr-1">
                    Available days:
                  </span>
                  {(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const).map(day => {
                    const slots = tutorAvail[day];
                    const hasSlots = Array.isArray(slots) && slots.length > 0;
                    return hasSlots ? (
                      <span key={day}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        title={slots.join(", ")}>
                        {day} · {slots.length} slot{slots.length > 1 ? "s" : ""}
                      </span>
                    ) : null;
                  })}
                  <span className="text-[11px] text-on-surface-variant ml-auto">
                    ● green dot = preferred day
                  </span>
                </div>
              )}

              {/* Date picker */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {calendarDates.map((d, i) => {
                  const dayDeclaredSlots = tutorAvail[d.dayShort];
                  const hasDeclaredSlots = Array.isArray(dayDeclaredSlots) && dayDeclaredSlots.length > 0;
                  // Dim if tutor has availability on OTHER days but not this one
                  const dimDay = tutorHasAnyAvail && !hasDeclaredSlots;
                  return (
                    <button key={d.fullDate}
                      onClick={() => setForm({ ...form, selectedDateIdx: i, selectedSlot: null })}
                      title={dimDay ? `No declared slots on ${d.dayShort}s — all times shown as fallback` : ""}
                      className={`relative flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all ${
                        form.selectedDateIdx === i
                          ? "bg-primary text-on-primary shadow-sm"
                          : dimDay
                          ? "bg-surface-container text-on-surface-variant/40"
                          : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                      }`}>
                      <span className="text-xs font-medium">{d.dayShort}</span>
                      <span className="text-lg font-bold mt-0.5">{d.dateNum}</span>
                      <span className="text-[10px] font-medium mt-0.5 opacity-80">{d.monthShort}</span>
                      {/* Green dot for days with declared tutor slots */}
                      {hasDeclaredSlots && form.selectedDateIdx !== i && (
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Amber banner when tutor exists but hasn't set availability */}
              {hasDbTutor && !tutorHasAnyAvail && (
                <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                  <span className="text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Tutor schedule not yet declared
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      All time slots are shown for now. Pick your preferred slot and your tutor will confirm the session.
                    </p>
                  </div>
                </div>
              )}

              {timeSlots.every(s => !s.available) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="text-4xl mb-3">📅</span>
                  <p className="font-semibold text-on-surface">
                    {timeSlots.some(s => s.isPast && !s.available)
                      ? "All slots for today have passed"
                      : `No available slots on ${selectedDateEntry?.dayShort}s`}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {timeSlots.some(s => s.isPast)
                      ? "Please select a future date to book your demo."
                      : "Please pick a date with a 🟢 dot — those are days with declared availability."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((slot) => {
                      const isSelected   = form.selectedSlot === slot.id;
                      const bookedByName = bookedSlots[slot.time];
                      const isTaken      = !!bookedByName;
                      return (
                        <button key={slot.id}
                          disabled={!slot.available || isTaken}
                          onClick={() => setForm({ ...form, selectedSlot: slot.id })}
                          title={
                            isTaken       ? `Already booked (${bookedByName})` :
                            slot.isPast   ? "This slot has already passed" :
                            !slot.available ? "Tutor unavailable at this time" : ""}
                          className={`relative p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                            isTaken
                              ? "bg-red-50 border border-red-200 text-red-400 cursor-not-allowed"
                              : !slot.available
                              ? "bg-surface-container text-on-surface-variant/30 cursor-not-allowed opacity-50"
                              : isSelected
                              ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary/30"
                              : "bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary border border-outline-variant"
                          }`}>
                          <Clock size={13} />
                          <span>{slot.time}</span>
                          {isTaken     && <span className="absolute -top-1.5 -right-1 text-[9px] bg-red-400 text-white px-1 rounded-full">Taken</span>}
                          {isSelected  && <CheckCircle size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-on-surface-variant/60 mt-4 text-center">
                    {tutorHasAnyAvail
                      ? `Dimmed = outside tutor's declared hours · Red = already booked · Times in your timezone`
                      : hasDbTutor
                      ? `Red = already booked · All other slots subject to tutor confirmation`
                      : "Dimmed slots have already passed · Times shown in your local timezone"}
                  </p>

                  {/* Slot selected indicator — tutor identity revealed only after booking */}
                  {form.selectedSlot && (
                    <div className="mt-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">Slot selected</p>
                        <p className="font-bold text-on-surface">Your tutor will be revealed after booking</p>
                      </div>
                      <CheckCircle size={18} className="text-primary ml-auto shrink-0" />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Step 4 — Review & Confirm (no OTP needed — already verified) ── */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-primary" /> Review &amp; Confirm
              </h2>

              {/* Tutor assignment notice */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/70 flex items-center justify-center text-white shrink-0">
                  <Zap size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={13} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Tutor Assignment</span>
                  </div>
                  <p className="font-bold text-on-surface">Our best tutor for {form.subject || "your subject"}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Tutor details will be revealed once the session is confirmed by our team</p>
                </div>
                <Clock size={18} className="text-on-surface-variant shrink-0" />
              </div>

              {/* Booking summary */}
              <div className="bg-surface-container rounded-2xl p-5 space-y-3 mb-5 text-sm">
                {[
                  { label: "Parent",       value: form.parentName || "Not provided" },
                  { label: "Email",        value: form.parentEmail },
                  ...(form.whatsappNumber ? [{ label: "WhatsApp", value: form.whatsappNumber }] : []),
                  { label: "Student",      value: form.childName || "Not provided" },
                  { label: "Grade",        value: form.grade || "Not selected" },
                  { label: "Subject",      value: form.subject || "Not selected" },
                  { label: "Date",         value: selectedDateLabel },
                  { label: "Time",         value: selectedSlotLabel },
                  { label: "Timezone",     value: tzLabel },
                  { label: "Session",      value: "FREE Demo (30 minutes)" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-semibold text-on-surface text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Email verified indicator */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <p className="text-sm text-green-700">
                  Booking as <span className="font-semibold">{authUser.name}</span> · <span className="font-semibold">{authUser.email}</span>
                </p>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Additional notes <span className="text-on-surface-variant font-normal">(optional)</span>
                </label>
                <textarea placeholder="Any specific topics, learning difficulties, or goals for the tutor to know..."
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field h-24 resize-none" />
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">
                  This is a <strong>free 30-minute demo</strong> — no payment required.
                  Subscribe to a <strong>monthly plan</strong> from your dashboard after the session.
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {bookingError && (
            <div className="mt-4 bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium">
              {bookingError}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/30">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {/* Step 1, 3 → simple Continue */}
            {(step === 1 || step === 3) && (
              <button onClick={nextStep} className="btn-primary">
                Continue <ChevronRight size={18} />
              </button>
            )}

            {/* Step 2 → logged-in: just need a subject picked */}
            {step === 2 && (
              <button
                onClick={nextStep}
                disabled={!form.subject}
                className="btn-primary px-8 disabled:opacity-60"
              >
                Continue <ChevronRight size={18} />
              </button>
            )}

            {/* Step 4 → direct confirm (OTP already in state) */}
            {step === 4 && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="btn-primary px-8 disabled:opacity-60"
              >
                {confirming
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Confirm Booking</span><CheckCircle size={18} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <BookDemoInner />
    </Suspense>
  );
}

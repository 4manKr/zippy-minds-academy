"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle, ChevronRight, User, BookOpen, Calendar,
  Clock, Globe, ArrowRight, Star, Sparkles, Zap, Video,
} from "lucide-react";
import { SUBJECTS, GRADES, TIMEZONES } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "Student Details" },
  { id: 2, label: "Select Subject" },
  { id: 3, label: "Pick Time Slot" },
  { id: 4, label: "Confirm" },
];

const tutorPool: Record<string, { name: string; initials: string; color: string; rating: number; experience: string; monthlyPrice: number }> = {
  "Phonics":                 { name: "Ms. Ananya Singh",  initials: "AS", color: "from-pink-400 to-rose-500",     rating: 4.9, experience: "10 years", monthlyPrice: 199 },
  "English Grammar":         { name: "Ms. Priya Sharma",  initials: "PS", color: "from-blue-400 to-blue-600",     rating: 4.8, experience: "8 years",  monthlyPrice: 219 },
  "Mathematics":             { name: "Mr. Rahul Verma",   initials: "RV", color: "from-purple-400 to-purple-600", rating: 4.9, experience: "9 years",  monthlyPrice: 229 },
  "Public Speaking":         { name: "Ms. Kavya Nair",    initials: "KN", color: "from-orange-400 to-yellow-400", rating: 4.8, experience: "7 years",  monthlyPrice: 219 },
  "Writing & Communication": { name: "Ms. Sunita Rao",    initials: "SR", color: "from-teal-400 to-cyan-500",     rating: 4.7, experience: "6 years",  monthlyPrice: 199 },
  "Coding":                  { name: "Mr. Arjun Mehta",   initials: "AM", color: "from-indigo-400 to-blue-600",   rating: 4.9, experience: "5 years",  monthlyPrice: 249 },
  "Science":                 { name: "Dr. Meera Patel",   initials: "MP", color: "from-green-400 to-emerald-500", rating: 4.8, experience: "9 years",  monthlyPrice: 229 },
  "Life Skills":             { name: "Mr. Rohan Gupta",   initials: "RG", color: "from-yellow-400 to-orange-400", rating: 4.7, experience: "8 years",  monthlyPrice: 199 },
  "Hindi":                   { name: "Ms. Kavita Sharma", initials: "KS", color: "from-red-400 to-orange-500",    rating: 4.7, experience: "7 years",  monthlyPrice: 199 },
  "General Knowledge":       { name: "Mr. Vikram Nair",   initials: "VN", color: "from-cyan-400 to-teal-500",     rating: 4.6, experience: "6 years",  monthlyPrice: 199 },
  "Creative Arts":           { name: "Ms. Divya Iyer",    initials: "DI", color: "from-fuchsia-400 to-pink-500",  rating: 4.8, experience: "5 years",  monthlyPrice: 199 },
  "Social Studies":          { name: "Ms. Rekha Pillai",  initials: "RP", color: "from-amber-400 to-orange-400",  rating: 4.7, experience: "6 years",  monthlyPrice: 199 },
};

const DEFAULT_TUTOR = { name: "Available Tutor", initials: "AT", color: "from-primary to-primary-container", rating: 4.8, experience: "5+ years", monthlyPrice: 249 };

const timeSlots = [
  { id: 1, time: "9:00 AM",  available: true  },
  { id: 2, time: "10:00 AM", available: true  },
  { id: 3, time: "11:00 AM", available: false },
  { id: 4, time: "2:00 PM",  available: true  },
  { id: 5, time: "3:00 PM",  available: true  },
  { id: 6, time: "4:00 PM",  available: false },
  { id: 7, time: "5:00 PM",  available: true  },
  { id: 8, time: "6:00 PM",  available: true  },
  { id: 9, time: "7:00 PM",  available: true  },
];

const DAY_NAMES   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function buildCalendarDates() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dayShort:  DAY_NAMES[d.getDay()],
      dateNum:   d.getDate(),
      monthShort: MONTH_SHORT[d.getMonth()],
      fullDate:  `${MONTH_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    };
  });
}

interface BookingResult {
  zoomLink?:  string | null;
  zoomReady?: boolean;
  booking?:   { id: string; date?: string; timeSlot?: string };
}

export default function BookDemoPage() {
  const [step, setStep]               = useState<Step>(1);
  const [confirmed, setConfirmed]     = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [otpPhase, setOtpPhase]       = useState<"idle" | "sent" | "verifying">("idle");
  const [otp, setOtp]                 = useState("");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // Build dynamic calendar dates once (client-side only to avoid SSR mismatch)
  const calendarDates = useMemo(() => buildCalendarDates(), []);

  const [form, setForm] = useState({
    parentName: "", parentEmail: "",
    childName: "", childAge: "", grade: "",
    timezone: "Asia/Kolkata", subject: "",
    selectedDateIdx: 0,       // index into calendarDates
    selectedSlot: null as number | null,
    notes: "",
  });

  // Auto-detect browser timezone on mount
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setForm((f) => ({ ...f, timezone: detected }));
  }, []);

  const selectedDateEntry   = calendarDates[form.selectedDateIdx];
  const selectedDateLabel   = selectedDateEntry?.fullDate ?? "";
  const assignedTutor       = tutorPool[form.subject] ?? DEFAULT_TUTOR;
  const selectedSlotLabel   = timeSlots.find((s) => s.id === form.selectedSlot)?.time ?? "Not selected";
  const tzLabel             = TIMEZONES.find((t) => t.value === form.timezone)?.label ?? form.timezone;

  const nextStep = () => setStep((s) => Math.min(4, s + 1) as Step);
  const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

  // Step 4 phase 1: send OTP
  const handleSendOtp = async () => {
    if (!form.parentEmail) { setBookingError("Please enter your email address."); return; }
    setConfirming(true);
    setBookingError("");
    try {
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

  // Step 4 phase 2: verify OTP + create booking
  const handleConfirm = async () => {
    if (!otp || otp.length < 6) { setBookingError("Enter the 6-digit code sent to your email."); return; }
    setConfirming(true);
    setOtpPhase("verifying");
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
          notes: form.notes, monthlyPrice: assignedTutor.monthlyPrice,
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
      setOtpPhase("sent");
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

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-4 text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${assignedTutor.color} flex items-center justify-center text-white font-bold font-display shrink-0`}>
              {assignedTutor.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Auto-Assigned Tutor</span>
              </div>
              <p className="font-bold text-on-surface">{assignedTutor.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star size={11} fill="#fdd000" stroke="#fdd000" />
                <span className="text-xs text-on-surface-variant">{assignedTutor.rating} · {assignedTutor.experience} exp.</span>
              </div>
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
        </div>

        {/* Progress stepper */}
        <div className="flex items-center mb-8 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                step > s.id   ? "bg-green-500 text-white" :
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

          {/* Step 1 — Student Details */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <User size={22} className="text-primary" /> Tell us about your child
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Your Name (Parent)</label>
                    <input type="text" placeholder="e.g. John Smith" value={form.parentName}
                      onChange={(e) => setForm({ ...form, parentName: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Your Email</label>
                    <input type="email" placeholder="you@example.com" value={form.parentEmail}
                      onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} className="input-field" required />
                  </div>
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
              </div>
            </div>
          )}

          {/* Step 2 — Subject */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-2 flex items-center gap-2">
                <BookOpen size={22} className="text-primary" /> What subject does your child need?
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                We&apos;ll automatically assign the best available tutor for the subject you choose.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((s) => {
                  const tutor = tutorPool[s];
                  return (
                    <button key={s} onClick={() => setForm({ ...form, subject: s })}
                      className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                        form.subject === s
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary/50 hover:bg-surface-container"
                      }`}>
                      <p className="font-semibold">{s}</p>
                      {tutor && <p className="text-xs text-on-surface-variant mt-1 font-normal">Free demo available</p>}
                    </button>
                  );
                })}
              </div>

              {form.subject && tutorPool[form.subject] && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutorPool[form.subject].color} flex items-center justify-center text-white font-bold font-display shrink-0`}>
                    {tutorPool[form.subject].initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles size={13} className="text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">Auto-Assigned for {form.subject}</span>
                    </div>
                    <p className="font-bold text-on-surface">{tutorPool[form.subject].name}</p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                      <span className="flex items-center gap-1"><Star size={11} fill="#fdd000" stroke="#fdd000" /> {tutorPool[form.subject].rating}</span>
                      <span>{tutorPool[form.subject].experience} experience</span>
                    </div>
                  </div>
                  <CheckCircle size={20} className="text-primary shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Time Slot */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
                <Calendar size={22} className="text-primary" /> Select Date &amp; Time
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Showing times in <span className="font-medium text-on-surface">{tzLabel}</span>
                {" · "}Slots shown for your assigned tutor&apos;s availability
              </p>

              {/* Date picker — dynamic, shows day + date + month */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {calendarDates.map((d, i) => (
                  <button key={d.fullDate} onClick={() => setForm({ ...form, selectedDateIdx: i, selectedSlot: null })}
                    className={`flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all ${
                      form.selectedDateIdx === i
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                    }`}>
                    <span className="text-xs font-medium">{d.dayShort}</span>
                    <span className="text-lg font-bold mt-0.5">{d.dateNum}</span>
                    <span className="text-[10px] font-medium mt-0.5 opacity-80">{d.monthShort}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button key={slot.id} disabled={!slot.available} onClick={() => setForm({ ...form, selectedSlot: slot.id })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      !slot.available
                        ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed line-through"
                        : form.selectedSlot === slot.id
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary border border-outline-variant"
                    }`}>
                    <Clock size={13} />{slot.time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant/60 mt-4 text-center">
                Strikethrough slots are already booked · Times shown in your local timezone
              </p>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-primary" /> Review &amp; Confirm
              </h2>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${assignedTutor.color} flex items-center justify-center text-white font-bold font-display text-lg shrink-0`}>
                  {assignedTutor.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={13} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Auto-Assigned Tutor</span>
                  </div>
                  <p className="font-bold text-on-surface">{assignedTutor.name}</p>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                    <span className="flex items-center gap-1"><Star size={11} fill="#fdd000" stroke="#fdd000" /> {assignedTutor.rating}</span>
                    <span>{assignedTutor.experience} exp.</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container rounded-2xl p-5 space-y-3 mb-5 text-sm">
                {[
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

          {bookingError && (
            <div className="mt-4 bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium">
              {bookingError}
            </div>
          )}

          {/* OTP verification inline (step 4 only) */}
          {step === 4 && otpPhase === "sent" && (
            <div className="mt-5 bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="text-sm font-semibold text-on-surface mb-1 flex items-center gap-2">
                <CheckCircle size={16} className="text-primary" /> Code sent to {form.parentEmail}
              </p>
              <p className="text-xs text-on-surface-variant mb-3">Enter the 6-digit code to confirm your booking</p>
              <input
                type="text" inputMode="numeric" maxLength={6} placeholder="123456"
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="input-field text-center text-xl font-bold tracking-[0.4em] py-3 mb-2"
              />
              <button onClick={() => { setOtpPhase("idle"); setOtp(""); }}
                className="text-xs text-on-surface-variant hover:text-primary">
                ✉ Resend code
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/30">
            <button onClick={prevStep} disabled={step === 1 || otpPhase !== "idle"} className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed">
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="btn-primary">
                Continue <ChevronRight size={18} />
              </button>
            ) : otpPhase === "idle" ? (
              <button onClick={handleSendOtp} disabled={confirming} className="btn-primary px-8 disabled:opacity-60">
                {confirming
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Send Verification Code</span><ChevronRight size={18} /></>}
              </button>
            ) : (
              <button onClick={handleConfirm} disabled={confirming || otp.length < 6} className="btn-primary px-8 disabled:opacity-60">
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

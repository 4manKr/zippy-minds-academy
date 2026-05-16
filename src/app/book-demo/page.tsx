"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle, ChevronRight, User, BookOpen, Calendar,
  Clock, Globe, ArrowRight, Star, Sparkles, Zap,
} from "lucide-react";
import { SUBJECTS, GRADES, TIMEZONES } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "Student Details" },
  { id: 2, label: "Select Subject" },
  { id: 3, label: "Pick Time Slot" },
  { id: 4, label: "Confirm" },
];

// Tutor pool — backend will pick the best available match
const tutorPool: Record<string, { name: string; initials: string; color: string; rating: number; experience: string; monthlyPrice: number }> = {
  Mathematics:        { name: "Dr. Priya Sharma",  initials: "PS", color: "from-blue-400 to-brand-blue",     rating: 4.9, experience: "8 years",  monthlyPrice: 299 },
  Physics:            { name: "Rahul Verma",        initials: "RV", color: "from-purple-400 to-brand-purple", rating: 4.8, experience: "6 years",  monthlyPrice: 269 },
  Chemistry:          { name: "Dr. Vikram Nair",    initials: "VN", color: "from-emerald-400 to-emerald-600", rating: 4.7, experience: "12 years", monthlyPrice: 289 },
  Biology:            { name: "Dr. Meera Patel",    initials: "MP", color: "from-pink-400 to-rose-500",       rating: 4.8, experience: "9 years",  monthlyPrice: 269 },
  English:            { name: "Ananya Singh",       initials: "AS", color: "from-cyan-400 to-brand-cyan",     rating: 4.9, experience: "10 years", monthlyPrice: 249 },
  Hindi:              { name: "Kavita Sharma",      initials: "KS", color: "from-yellow-400 to-orange-400",   rating: 4.7, experience: "7 years",  monthlyPrice: 219 },
  "Computer Science": { name: "Arjun Mehta",        initials: "AM", color: "from-orange-400 to-red-500",      rating: 4.9, experience: "5 years",  monthlyPrice: 319 },
  Economics:          { name: "Rohan Gupta",        initials: "RG", color: "from-teal-400 to-cyan-600",       rating: 4.6, experience: "8 years",  monthlyPrice: 249 },
  Science:            { name: "Dr. Priya Sharma",   initials: "PS", color: "from-blue-400 to-brand-blue",     rating: 4.9, experience: "8 years",  monthlyPrice: 269 },
  History:            { name: "Sunita Rao",         initials: "SR", color: "from-indigo-400 to-brand-blue",   rating: 4.8, experience: "7 years",  monthlyPrice: 219 },
  Geography:          { name: "Sunita Rao",         initials: "SR", color: "from-indigo-400 to-brand-blue",   rating: 4.8, experience: "7 years",  monthlyPrice: 219 },
  Accountancy:        { name: "Rohan Gupta",        initials: "RG", color: "from-teal-400 to-cyan-600",       rating: 4.6, experience: "8 years",  monthlyPrice: 249 },
  "Business Studies": { name: "Rohan Gupta",        initials: "RG", color: "from-teal-400 to-cyan-600",       rating: 4.6, experience: "8 years",  monthlyPrice: 249 },
};

const DEFAULT_TUTOR = { name: "Available Tutor", initials: "AT", color: "from-brand-blue to-brand-purple", rating: 4.8, experience: "5+ years", monthlyPrice: 249 };

const timeSlots = [
  { id: 1, time: "9:00 AM",  available: true },
  { id: 2, time: "10:00 AM", available: true },
  { id: 3, time: "11:00 AM", available: false },
  { id: 4, time: "2:00 PM",  available: true },
  { id: 5, time: "3:00 PM",  available: true },
  { id: 6, time: "4:00 PM",  available: false },
  { id: 7, time: "5:00 PM",  available: true },
  { id: 8, time: "6:00 PM",  available: true },
  { id: 9, time: "7:00 PM",  available: true },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates    = [19, 20, 21, 22, 23, 24, 25];

export default function BookDemoPage() {
  const [step, setStep]           = useState<Step>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm]           = useState({
    childName:    "",
    childAge:     "",
    grade:        "",
    timezone:     "America/New_York",
    subject:      "",
    selectedDate: 20,
    selectedSlot: null as number | null,
    notes:        "",
  });

  const assignedTutor = tutorPool[form.subject] ?? DEFAULT_TUTOR;
  const selectedSlotLabel = timeSlots.find((s) => s.id === form.selectedSlot)?.time ?? "Not selected";
  const tzLabel = TIMEZONES.find((t) => t.value === form.timezone)?.label ?? form.timezone;

  const nextStep = () => setStep((s) => Math.min(4, s + 1) as Step);
  const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Booked!</h2>
          <p className="text-gray-500 mb-6 text-sm">
            We&apos;ve auto-assigned an available tutor for your demo.
            You&apos;ll receive a Zoom link within 2 hours.
          </p>

          {/* Auto-assigned tutor card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 flex items-center gap-4 text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${assignedTutor.color} flex items-center justify-center text-white font-bold shrink-0`}>
              {assignedTutor.initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap size={13} className="text-brand-blue" />
                <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">Auto-Assigned Tutor</span>
              </div>
              <p className="font-bold text-gray-900">{assignedTutor.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} fill="gold" stroke="gold" />
                <span className="text-xs text-gray-500">{assignedTutor.rating} · {assignedTutor.experience} experience</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 space-y-3 text-sm">
            {[
              { label: "Student",      value: form.childName || "Your child" },
              { label: "Subject",      value: form.subject || "—" },
              { label: "Date",         value: `May ${form.selectedDate}, 2025` },
              { label: "Time",         value: selectedSlotLabel },
              { label: "Session Type", value: "FREE Demo (30 min)" },
              { label: "Status",       value: "⏳ Pending confirmation" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/parent" className="w-full btn-primary justify-center py-3">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/" className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-4 text-sm font-medium text-brand-blue">
            🎉 Free 30-minute demo · No credit card required
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Book Your Free Demo Session</h1>
          <p className="text-gray-500 mt-2">
            We&apos;ll match you with the best available tutor for your subject automatically.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                step > s.id  ? "bg-green-500 text-white" :
                step === s.id ? "bg-brand-blue text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? "text-gray-900" : "text-gray-400"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-gray-300 ml-auto mr-2 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">

          {/* ── STEP 1: Student Details ── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={22} className="text-brand-blue" /> Tell us about your child
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Child&apos;s Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Smith"
                    value={form.childName}
                    onChange={(e) => setForm({ ...form, childName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 14"
                      min={4} max={20}
                      value={form.childAge}
                      onChange={(e) => setForm({ ...form, childAge: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade / Year</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Globe size={15} className="text-brand-cyan" /> Your Timezone
                  </label>
                  <select
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="input-field"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Subject ── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen size={22} className="text-brand-blue" /> What subject does your child need?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                We&apos;ll automatically assign the best available tutor for the subject you choose.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((s) => {
                  const tutor = tutorPool[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, subject: s })}
                      className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                        form.subject === s
                          ? "border-brand-blue bg-blue-50 text-brand-blue"
                          : "border-gray-200 text-gray-600 hover:border-brand-blue/50 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold">{s}</p>
                      {tutor && (
                        <p className="text-xs text-gray-400 mt-1 font-normal">
                          from ${tutor.monthlyPrice}/mo
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Preview auto-assigned tutor */}
              {form.subject && tutorPool[form.subject] && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tutorPool[form.subject].color} flex items-center justify-center text-white font-bold shrink-0`}>
                    {tutorPool[form.subject].initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles size={13} className="text-brand-blue" />
                      <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">Auto-Assigned for {form.subject}</span>
                    </div>
                    <p className="font-bold text-gray-900">{tutorPool[form.subject].name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Star size={11} fill="gold" stroke="gold" /> {tutorPool[form.subject].rating}
                      </span>
                      <span>{tutorPool[form.subject].experience} experience</span>
                      <span className="font-bold text-brand-blue">${tutorPool[form.subject].monthlyPrice}/month</span>
                    </div>
                  </div>
                  <CheckCircle size={20} className="text-brand-blue shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Time Slot ── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Calendar size={22} className="text-brand-blue" /> Select Date & Time
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Showing times in <span className="font-medium text-gray-700">{tzLabel}</span>
                {" · "}Slots shown for your assigned tutor&apos;s availability
              </p>

              {/* Date strip */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {weekDays.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setForm({ ...form, selectedDate: dates[i], selectedSlot: null })}
                    className={`flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all ${
                      form.selectedDate === dates[i]
                        ? "bg-brand-blue text-white shadow-glow-blue"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="text-xs font-medium">{day}</span>
                    <span className="text-lg font-bold mt-1">{dates[i]}</span>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setForm({ ...form, selectedSlot: slot.id })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      !slot.available
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        : form.selectedSlot === slot.id
                        ? "bg-brand-blue text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue border border-gray-200"
                    }`}
                  >
                    <Clock size={13} />
                    {slot.time}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Grey slots are already booked · Times shown in your local timezone
              </p>
            </div>
          )}

          {/* ── STEP 4: Confirm ── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-brand-blue" /> Review & Confirm
              </h2>

              {/* Auto-assigned tutor highlight */}
              <div className="bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 border border-brand-blue/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${assignedTutor.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {assignedTutor.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={13} className="text-brand-blue" />
                    <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">Auto-Assigned Tutor</span>
                  </div>
                  <p className="font-bold text-gray-900">{assignedTutor.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Star size={11} fill="gold" stroke="gold" /> {assignedTutor.rating}</span>
                    <span>{assignedTutor.experience} exp.</span>
                    <span className="font-bold text-brand-blue">${assignedTutor.monthlyPrice}/month after demo</span>
                  </div>
                </div>
              </div>

              {/* Booking summary */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-5 text-sm">
                {[
                  { label: "Student",       value: form.childName || "Not provided" },
                  { label: "Grade",         value: form.grade || "Not selected" },
                  { label: "Subject",       value: form.subject || "Not selected" },
                  { label: "Date",          value: `May ${form.selectedDate}, 2025` },
                  { label: "Time",          value: selectedSlotLabel },
                  { label: "Timezone",      value: tzLabel },
                  { label: "Session",       value: "FREE Demo (30 minutes)" },
                  { label: "Monthly Plan",  value: `$${assignedTutor.monthlyPrice}/month (after demo)` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  placeholder="Any specific topics, learning difficulties, goals, or anything else for the tutor to know..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field h-24 resize-none"
                />
              </div>

              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">
                  This is a <strong>free 30-minute demo</strong> — no payment required.
                  If you love the session, you can subscribe to a <strong>monthly plan</strong> from your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="btn-primary">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => setConfirmed(true)} className="btn-primary px-8">
                Confirm Booking <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

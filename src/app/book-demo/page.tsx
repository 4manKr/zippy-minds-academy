"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ChevronRight, User, BookOpen, GraduationCap, Calendar, Clock, Globe, ArrowRight, Star } from "lucide-react";
import { SUBJECTS, GRADES, TIMEZONES } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const steps = [
  { id: 1, label: "Student Details" },
  { id: 2, label: "Select Subject" },
  { id: 3, label: "Choose Tutor" },
  { id: 4, label: "Pick Time Slot" },
  { id: 5, label: "Confirm" },
];

const tutors = [
  { id: 1, name: "Dr. Priya Sharma", subjects: ["Mathematics", "Physics"], rating: 4.9, reviews: 342, experience: "8 years", initials: "PS", color: "from-blue-400 to-brand-blue", price: 25 },
  { id: 2, name: "Rahul Verma", subjects: ["Physics", "Chemistry"], rating: 4.8, reviews: 287, experience: "6 years", initials: "RV", color: "from-purple-400 to-brand-purple", price: 22 },
  { id: 3, name: "Ananya Singh", subjects: ["English", "Literature"], rating: 4.9, reviews: 512, experience: "10 years", initials: "AS", color: "from-cyan-400 to-brand-cyan", price: 18 },
];

const timeSlots = [
  { id: 1, time: "9:00 AM", available: true },
  { id: 2, time: "10:00 AM", available: true },
  { id: 3, time: "11:00 AM", available: false },
  { id: 4, time: "2:00 PM", available: true },
  { id: 5, time: "3:00 PM", available: true },
  { id: 6, time: "4:00 PM", available: false },
  { id: 7, time: "5:00 PM", available: true },
  { id: 8, time: "6:00 PM", available: true },
  { id: 9, time: "7:00 PM", available: true },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [19, 20, 21, 22, 23, 24, 25];

export default function BookDemoPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    childName: "",
    childAge: "",
    grade: "",
    timezone: "America/New_York",
    subject: "",
    tutorId: null as number | null,
    selectedDate: 20,
    selectedSlot: null as number | null,
    notes: "",
  });

  const [confirmed, setConfirmed] = useState(false);

  const nextStep = () => setStep((s) => Math.min(6, s + 1) as Step);
  const prevStep = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleConfirm = () => {
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-card-hover p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Demo Requested!</h2>
          <p className="text-gray-500 mb-6">
            Your free demo session request has been sent to the tutor.
            You&apos;ll receive a confirmation within 2 hours.
          </p>
          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Student</span>
              <span className="font-semibold text-gray-900">{form.childName || "Your child"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subject</span>
              <span className="font-semibold text-gray-900">{form.subject || "Mathematics"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold text-gray-900">May {form.selectedDate}, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="badge-yellow">Pending Tutor Approval</span>
            </div>
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
          <p className="text-gray-500 mt-2">Complete the steps below to reserve your slot.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                step > s.id ? "bg-green-500 text-white" :
                step === s.id ? "bg-brand-blue text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {step > s.id ? <CheckCircle size={16} /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-300 ml-auto mr-2" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
          {/* Step 1: Student Details */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={22} className="text-brand-blue" /> Tell us about your child
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Child&apos;s Full Name</label>
                  <input type="text" placeholder="e.g. Alex Smith" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                    <input type="number" placeholder="e.g. 14" min={4} max={20} value={form.childAge} onChange={(e) => setForm({ ...form, childAge: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade / Year</label>
                    <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="input-field">
                      <option value="">Select grade</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Globe size={15} className="text-brand-cyan" /> Your Timezone
                  </label>
                  <select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="input-field">
                    {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Subject */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen size={22} className="text-brand-blue" /> What subject do you need?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, subject: s })}
                    className={`p-4 rounded-2xl border-2 text-sm font-medium transition-all text-left ${
                      form.subject === s
                        ? "border-brand-blue bg-blue-50 text-brand-blue"
                        : "border-gray-200 text-gray-600 hover:border-brand-blue/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Choose tutor */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap size={22} className="text-brand-blue" /> Choose your tutor
              </h2>
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <button
                    key={tutor.id}
                    onClick={() => setForm({ ...form, tutorId: tutor.id })}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                      form.tutorId === tutor.id
                        ? "border-brand-blue bg-blue-50"
                        : "border-gray-200 hover:border-brand-blue/50"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tutor.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {tutor.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{tutor.name}</p>
                      <p className="text-sm text-gray-500">{tutor.subjects.join(", ")} · {tutor.experience}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill="gold" stroke="gold" />
                          <span className="font-semibold text-gray-900">{tutor.rating}</span>
                          ({tutor.reviews})
                        </div>
                        <span className="font-bold text-brand-blue">${tutor.price}/session</span>
                      </div>
                    </div>
                    {form.tutorId === tutor.id && (
                      <CheckCircle size={20} className="text-brand-blue shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Time slot */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar size={22} className="text-brand-blue" /> Select Date & Time
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Showing times in your timezone · {TIMEZONES.find((t) => t.value === form.timezone)?.label}
              </p>

              {/* Date selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {weekDays.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => setForm({ ...form, selectedDate: dates[i] })}
                    className={`flex flex-col items-center p-3 rounded-2xl min-w-[64px] transition-all ${
                      form.selectedDate === dates[i]
                        ? "bg-brand-blue text-white"
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
                        ? "bg-brand-blue text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue border border-gray-200"
                    }`}
                  >
                    <Clock size={13} />
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-brand-blue" /> Review & Confirm
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-6">
                {[
                  { label: "Student", value: form.childName || "Not provided" },
                  { label: "Grade", value: form.grade || "Not selected" },
                  { label: "Subject", value: form.subject || "Not selected" },
                  { label: "Tutor", value: tutors.find((t) => t.id === form.tutorId)?.name || "Not selected" },
                  { label: "Date", value: `May ${form.selectedDate}, 2025` },
                  { label: "Time", value: timeSlots.find((s) => s.id === form.selectedSlot)?.time || "Not selected" },
                  { label: "Timezone", value: TIMEZONES.find((t) => t.value === form.timezone)?.label || form.timezone },
                  { label: "Session Type", value: "FREE Demo (30 minutes)" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional notes (optional)</label>
                <textarea placeholder="Any specific topics, learning difficulties, or goals..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field h-24 resize-none" />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-green-700">
                  This is a <strong>free demo session</strong> — no payment required. The tutor will confirm within 2 hours.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={prevStep} disabled={step === 1} className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed">
              ← Back
            </button>
            {step < 5 ? (
              <button onClick={nextStep} className="btn-primary">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleConfirm} className="btn-primary px-8">
                Confirm Booking <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

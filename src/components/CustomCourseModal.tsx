"use client";

import { useState } from "react";
import {
  X, Sparkles, User, Baby, GraduationCap, BookOpen,
  Calendar, Target, Phone, Wallet, MessageSquare, Send,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const SUBJECT_OPTIONS = [
  "Phonics", "English Grammar", "Mathematics", "Public Speaking",
  "Coding", "Writing & Communication", "Science", "Life Skills",
  "Hindi", "General Knowledge", "Creative Arts", "Social Studies",
  "Other (describe below)",
];

const DAY_OPTIONS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIME_OPTIONS = ["Early Morning (6–9 AM IST)","Morning (9 AM–12 PM IST)","Afternoon (12–4 PM IST)","Evening (4–7 PM IST)","Night (7–10 PM IST)"];
const BUDGET_OPTIONS = ["< ₹2,000 / month","₹2,000–4,000 / month","₹4,000–6,000 / month","₹6,000+ / month","< $30 / month","$30–60 / month","$60+ / month","Flexible / discuss"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CustomCourseModal({ open, onClose }: Props) {
  const { whatsappNumber } = useSiteSettings();

  const [form, setForm] = useState({
    parentName:   "",
    childName:    "",
    childAge:     "",
    grade:        "",
    subjects:     [] as string[],
    preferredDays:[] as string[],
    preferredTime:"",
    goals:        "",
    waNumber:     "",
    budget:       "",
    special:      "",
  });

  const [sent, setSent] = useState(false);

  if (!open) return null;

  function toggleSubject(s: string) {
    setForm(f => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s],
    }));
  }

  function toggleDay(d: string) {
    setForm(f => ({
      ...f,
      preferredDays: f.preferredDays.includes(d) ? f.preferredDays.filter(x => x !== d) : [...f.preferredDays, d],
    }));
  }

  function handleSend() {
    const lines = [
      `🎓 *Custom Course Request — Zippy Minds Academy*`,
      ``,
      `👤 *Parent Name:* ${form.parentName || "—"}`,
      `👦 *Child:* ${form.childName || "—"} (${form.childAge ? form.childAge + " yrs" : "?"}, ${form.grade ? "Grade " + form.grade : "grade not provided"})`,
      `📚 *Subjects of Interest:* ${form.subjects.length ? form.subjects.join(", ") : "—"}`,
      `🗓️ *Preferred Days:* ${form.preferredDays.length ? form.preferredDays.join(", ") : "—"}`,
      `⏰ *Preferred Timing:* ${form.preferredTime || "—"}`,
      `🎯 *Learning Goals:* ${form.goals || "—"}`,
      `📱 *WhatsApp / Contact:* ${form.waNumber || "—"}`,
      `💰 *Budget:* ${form.budget || "Flexible"}`,
      form.special ? `📝 *Special Requirements:* ${form.special}` : "",
      ``,
      `Please reach out to discuss a custom learning plan! 🙏`,
    ].filter(l => l !== undefined) as string[];

    const msg = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
    setSent(true);
  }

  const canSend = form.parentName.trim() && form.childName.trim() && form.waNumber.trim();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-violet-600 to-purple-700 rounded-t-3xl px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white leading-tight">Build Your Custom Course</h2>
              <p className="text-white/80 text-sm mt-0.5">Tell us what your child needs — we'll design it just for them</p>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="p-10 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">Request sent on WhatsApp!</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Our team will review your requirements and get back to you within 24 hours to discuss your custom course plan.
            </p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Parent + Child details */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <User size={13} /> Basic Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder="Parent / Guardian name"
                      value={form.parentName}
                      onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Child's Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Baby size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder="Child's first name"
                      value={form.childName}
                      onChange={e => setForm(f => ({ ...f, childName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Child's Age</label>
                  <div className="relative">
                    <Baby size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder="e.g. 8"
                      type="number" min={2} max={18}
                      value={form.childAge}
                      onChange={e => setForm(f => ({ ...f, childAge: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Grade / Class</label>
                  <div className="relative">
                    <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder="e.g. Grade 3 / KG"
                      value={form.grade}
                      onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Subjects */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <BookOpen size={13} /> Subjects of Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.subjects.includes(s)
                        ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                        : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-violet-400 hover:text-violet-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Schedule */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Calendar size={13} /> Preferred Schedule
              </h3>
              <p className="text-xs text-on-surface-variant mb-2">Select preferred days:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {DAY_OPTIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.preferredDays.includes(d)
                        ? "bg-primary border-primary text-on-primary shadow-sm"
                        : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              <select
                className="input-field text-sm"
                value={form.preferredTime}
                onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
              >
                <option value="">Select preferred time (IST)</option>
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </section>

            {/* Goals */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Target size={13} /> Learning Goals
              </h3>
              <textarea
                className="input-field text-sm h-20 resize-none"
                placeholder="What do you want your child to achieve? (e.g. improve reading fluency, learn Python, build exam confidence...)"
                value={form.goals}
                onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              />
            </section>

            {/* Contact + Budget */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Phone size={13} /> Contact &amp; Budget
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Your WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      className="input-field pl-9 text-sm"
                      placeholder="+91 9876543210"
                      value={form.waNumber}
                      onChange={e => setForm(f => ({ ...f, waNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Budget Range</label>
                  <div className="relative">
                    <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <select
                      className="input-field pl-9 text-sm"
                      value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                    >
                      <option value="">Select budget (optional)</option>
                      {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Special requirements */}
            <section>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <MessageSquare size={13} /> Special Requirements
              </h3>
              <textarea
                className="input-field text-sm h-16 resize-none"
                placeholder="Any special needs, learning difficulties, languages preferred, or anything else we should know..."
                value={form.special}
                onChange={e => setForm(f => ({ ...f, special: e.target.value }))}
              />
            </section>

            {/* Send button */}
            <div className="pt-2">
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  canSend
                    ? "bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send via WhatsApp
                <Send size={15} />
              </button>
              {!canSend && (
                <p className="text-center text-xs text-on-surface-variant/60 mt-2">
                  Please fill in your name, child's name, and WhatsApp number to continue
                </p>
              )}
              <p className="text-center text-xs text-on-surface-variant/50 mt-3">
                Your details are sent directly to our team via WhatsApp. No spam, ever.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

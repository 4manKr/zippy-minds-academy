"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Phone, MessageSquare, IndianRupee, Sparkles, BookOpen } from "lucide-react";

// Subject → monthly price (must stay in sync with courses data)
const SUBJECT_PRICES: Record<string, number> = {
  "Phonics":                 199,
  "English Grammar":         219,
  "Mathematics":             229,
  "Public Speaking":         219,
  "Writing & Communication": 199,
  "Coding":                  249,
  "Science":                 229,
  "Life Skills":             199,
  "Hindi":                   199,
  "General Knowledge":       199,
  "Creative Arts":           199,
  "Social Studies":          199,
};

const DEFAULT_PRICE = 199;

const WHATSAPP_NUMBER = "919311483555"; // +91 93114 83555
const SUPPORT_EMAIL   = "zippymindsacademy@gmail.com";

const INCLUDES = [
  "Live 1-on-1 sessions with your assigned tutor",
  "Personalised learning plan for your child",
  "Session recordings shared after every class",
  "Progress reports every month",
  "WhatsApp support from your tutor",
  "Free rescheduling with 24 h notice",
];

function EnrollInner() {
  const searchParams = useSearchParams();
  const subject  = searchParams.get("subject") ?? "";
  const price    = SUBJECT_PRICES[subject] ?? DEFAULT_PRICE;
  const hasSubject = !!subject;

  const waMsg  = encodeURIComponent(
    `Hi! I'd like to enroll${hasSubject ? ` in ${subject}` : ""} at Zippy Minds Academy. Please share payment details.`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700 mb-4">
            <CheckCircle size={15} /> Free demo completed — time to enroll!
          </div>
          <h1 className="font-display text-3xl font-bold text-on-surface">
            {hasSubject ? `Enroll in ${subject}` : "Enroll in a Course"}
          </h1>
          <p className="text-on-surface-variant mt-2">
            Your free demo is done. Subscribe to start regular sessions with your tutor.
          </p>
        </div>

        {/* Price card */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Monthly Subscription</p>
              <div className="flex items-end gap-1">
                <IndianRupee size={26} className="text-primary mb-1" />
                <span className="font-display text-5xl font-extrabold text-primary">{price}</span>
                <span className="text-on-surface-variant text-lg mb-1">/month</span>
              </div>
              {hasSubject && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <BookOpen size={12} /> {subject}
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              📚
            </div>
          </div>

          {/* What's included */}
          <div className="space-y-2.5 mb-8">
            {INCLUDES.map(item => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-on-surface">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA — WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95 mb-3"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageSquare size={20} />
            Pay & Enroll via WhatsApp
          </a>

          <p className="text-center text-xs text-on-surface-variant">
            Our team will share the payment link on WhatsApp within a few minutes
          </p>
        </div>

        {/* Other options */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 mb-6">
          <p className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Other ways to enroll
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href={`tel:+919311483555`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-all text-sm font-medium text-on-surface">
              <Phone size={16} className="text-primary shrink-0" />
              Call +91 93114 83555
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Enrollment${hasSubject ? ` — ${subject}` : ""}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-all text-sm font-medium text-on-surface">
              <MessageSquare size={16} className="text-primary shrink-0" />
              Email us
            </a>
          </div>
        </div>

        {/* Browse other courses */}
        <div className="text-center space-y-3">
          <p className="text-sm text-on-surface-variant">Want to enroll in a different subject?</p>
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Browse all courses <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dashboard link */}
        <div className="mt-8 text-center">
          <Link href="/dashboard/parent"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            ← Back to my dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <EnrollInner />
    </Suspense>
  );
}

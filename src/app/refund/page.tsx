import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Zippy Minds Academy refund and cancellation policy for online tutoring sessions.",
};

const sections = [
  {
    title: "Free Demo Sessions",
    content: [
      "Free 30-minute demo sessions are complimentary and require no payment.",
      "There is no refund applicable for demo sessions as they are provided free of charge.",
      "Each parent/student is eligible for one free demo session per subject.",
    ],
  },
  {
    title: "Monthly Subscription Plans",
    content: [
      "Monthly subscriptions are billed at the beginning of each billing cycle.",
      "A full refund is available if requested within 48 hours of payment, provided no sessions have been conducted in that billing cycle.",
      "If one or more sessions have been completed, a pro-rated refund will be issued for the remaining unused sessions.",
      "No refund is available after 7 days from the billing date, regardless of sessions used.",
    ],
  },
  {
    title: "Session Cancellations",
    content: [
      "Sessions cancelled at least 24 hours in advance will be credited to your account for rescheduling — no charge applies.",
      "Sessions cancelled with less than 24 hours notice will be counted as completed and are non-refundable.",
      "In the event a tutor cancels a session, the full session fee will be credited back to your account.",
      "Technical failures on our platform (server outages, Zoom link failures) are treated as tutor cancellations — full credit applies.",
    ],
  },
  {
    title: "Tutor No-Shows",
    content: [
      "If your assigned tutor does not join a confirmed session within 10 minutes of the scheduled start time, it is considered a no-show.",
      "No-show sessions are fully refunded or credited — your choice.",
      "You will also receive priority rescheduling with a senior tutor at no additional cost.",
    ],
  },
  {
    title: "Technical Issues",
    content: [
      "If a session is disrupted due to technical issues on our end (platform outage, Zoom failures), a full refund or free reschedule will be offered.",
      "Technical issues on the student's side (internet connectivity, device failure) are not grounds for a refund, but we will work to reschedule the session where possible.",
      "Please report technical issues within 24 hours of the scheduled session time.",
    ],
  },
  {
    title: "How to Request a Refund",
    content: [
      "Email us at zippymindsacademy@gmail.com with your name, booking ID, and reason for the refund request.",
      "Alternatively, raise a support ticket from your parent dashboard.",
      "Refund requests are reviewed within 2 business days.",
      "Approved refunds are processed within 5–7 business days via the original payment method.",
    ],
  },
  {
    title: "Non-Refundable Situations",
    content: [
      "Refunds are not issued for dissatisfaction with a tutor after 3 or more sessions have been completed (we encourage you to raise concerns after the first session so we can reassign).",
      "Refunds are not provided for sessions missed by the student without prior notice.",
      "Promotional or discounted sessions are non-refundable unless cancelled by us.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "For all refund queries, please contact our support team:",
      "📧 zippymindsacademy@gmail.com",
      "📞 +91 93114 83555",
      "We aim to resolve all refund requests fairly and promptly.",
    ],
  },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Refund Policy
          </span>
          <h1 className="font-display text-4xl font-extrabold text-on-surface mb-3">
            Refund & Cancellation Policy
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            We believe in fair, transparent pricing. Here&apos;s everything you need to know
            about refunds and cancellations at Zippy Minds Academy.
          </p>
          <p className="text-xs text-on-surface-variant mt-3">Last updated: January 2025</p>
        </div>

        {/* Quick summary box */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-10">
          <h2 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <span className="text-lg">✅</span> Quick Summary
          </h2>
          <ul className="space-y-2 text-sm text-green-700">
            <li>• <strong>Free demo</strong> — no payment, no refund needed</li>
            <li>• <strong>Within 48 hours of payment</strong> — full refund (if no sessions held)</li>
            <li>• <strong>Session cancelled 24h+ ahead</strong> — free reschedule credit</li>
            <li>• <strong>Tutor no-show</strong> — full refund or free reschedule</li>
            <li>• <strong>Platform failure</strong> — full credit, no questions asked</li>
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <div key={section.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
              <h2 className="font-display text-lg font-bold text-on-surface mb-4 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.content.map((line, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-on-surface-variant leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 mt-2" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="mt-10 pt-8 border-t border-outline-variant flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  );
}

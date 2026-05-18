"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const faqCategories = [
  {
    label: "Getting Started",
    faqs: [
      { q: "What is a free demo session?", a: "A free 30-minute trial lesson with any tutor of your choice. No payment required. It gives you and your child a chance to experience our teaching quality." },
      { q: "How do I book my first session?", a: "Click 'Book Free Demo', sign up or log in, enter your child's details, choose a subject, pick a tutor, and select a time slot. The entire process takes under 10 minutes." },
      { q: "Do I need to create an account?", a: "Yes. An account helps us match you with the right tutors, manage your bookings, and securely handle payments." },
    ],
  },
  {
    label: "Scheduling & Timezone",
    faqs: [
      { q: "How does timezone scheduling work?", a: "Our platform auto-detects your timezone and shows all tutor availability in your local time. When you book, both you and the tutor receive confirmations in your respective timezones." },
      { q: "Can I book sessions late at night?", a: "Absolutely. Many Indian tutors offer early morning slots (India time) which fall in the evening for UK/US parents. We support sessions across all timezones." },
      { q: "Can I reschedule a session?", a: "Yes. Sessions can be rescheduled up to 24 hours before the scheduled time from your parent dashboard." },
    ],
  },
  {
    label: "Tutors & Quality",
    faqs: [
      { q: "How are tutors verified?", a: "Every tutor goes through a 5-stage process: degree verification, subject knowledge test, demo session, background check, and parent satisfaction assessment. Only top 3% are approved." },
      { q: "Can I switch tutors if I'm not happy?", a: "Yes. If after the demo session you feel the tutor isn't the right fit, you can book a demo with any other tutor at no extra cost." },
      { q: "What qualifications do tutors have?", a: "Our tutors hold degrees in their respective subjects from reputed Indian universities. Many hold post-graduate degrees, PhDs, or professional certifications." },
    ],
  },
  {
    label: "Payments",
    faqs: [
      { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, PayPal, and Razorpay (for Indian parents). All payments are encrypted and secure." },
      { q: "Can I get a refund?", a: "If a session is cancelled by the tutor or a technical issue occurs, a full refund is issued within 3–5 business days." },
      { q: "Are there subscription packages?", a: "Yes. We offer weekly and monthly packages at discounted rates. View our pricing page for more details." },
    ],
  },
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-primary py-16 pt-24">
        <div className="max-w-3xl mx-auto px-4 text-center text-on-primary">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">Help Center</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
          <p className="text-on-primary/80 text-lg">Everything you need to know about Zippy Minds Academy.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        {faqCategories.map((cat) => (
          <div key={cat.label}>
            <h2 className="font-display text-xl font-bold text-on-surface mb-4">{cat.label}</h2>
            <div className="space-y-3">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.label}-${i}`;
                return (
                  <div key={key} className={cn("border rounded-2xl overflow-hidden transition-all bg-surface-container-lowest", openItem === key ? "border-primary/30 shadow-sm" : "border-outline-variant")}>
                    <button onClick={() => setOpenItem(openItem === key ? null : key)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                      <span className="font-semibold text-on-surface">{faq.q}</span>
                      <ChevronDown size={18} className={cn("shrink-0 text-primary transition-transform", openItem === key ? "rotate-180" : "")} />
                    </button>
                    {openItem === key && (
                      <div className="px-6 pb-5">
                        <p className="text-on-surface-variant leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-primary rounded-3xl p-8 text-on-primary text-center">
          <h3 className="font-display text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-on-primary/80 mb-5">Our support team is here to help, 7 days a week.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-fixed font-bold px-6 py-3 rounded-xl squishy-hover">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

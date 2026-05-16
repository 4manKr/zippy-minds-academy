"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "What is a free demo session?", a: "A free 30-minute trial lesson with any tutor of your choice. No payment required. It gives you and your child a chance to experience our teaching quality and platform before committing." },
  { q: "How does timezone scheduling work?", a: "Our platform automatically detects your timezone and shows tutor availability in your local time. When you book a slot, both you and the tutor receive confirmation in your respective timezones." },
  { q: "Are sessions conducted via Zoom?", a: "Yes! Once a session is confirmed, our system automatically generates a unique Zoom meeting link. Both the parent and tutor receive the link via email and WhatsApp." },
  { q: "How are tutors verified?", a: "Every tutor undergoes a 5-stage verification: degree verification, subject knowledge test, demo session review, background check, and parent satisfaction assessment. Only the top 3% are approved." },
  { q: "Can I cancel or reschedule a session?", a: "Yes. Sessions can be rescheduled or cancelled up to 24 hours before the scheduled time from your parent dashboard. Cancellations within 24 hours may be subject to our cancellation policy." },
  { q: "What subjects are available?", a: "We offer tutoring in Mathematics, Physics, Chemistry, Biology, English, Hindi, Computer Science, History, Geography, Economics, Accountancy, and more — covering grades 1 through 12." },
  { q: "What are the pricing options?", a: "Session prices vary by tutor and subject, typically ranging from $15–$35 USD per hour. We also offer subscription packages for ongoing learning at discounted rates." },
  { q: "Is my child's session recorded?", a: "Recordings depend on tutor settings and parent preference. We prioritize safety and can provide session recordings for review upon request with proper parental consent." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="badge-blue mb-4 inline-block">FAQ</span>
          <h2 className="section-heading">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-2xl overflow-hidden transition-all duration-300",
                openIndex === index ? "border-brand-blue/30 shadow-sm" : "border-gray-100"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={cn(
                    "shrink-0 text-brand-blue transition-transform duration-300",
                    openIndex === index ? "rotate-180" : ""
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

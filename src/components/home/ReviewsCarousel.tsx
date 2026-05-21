"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Priya M.",
    country: "Dubai, UAE",
    avatar: "PM",
    avatarBg: "bg-primary",
    subject: "Phonics",
    text: "Classes are interactive, well-structured, and genuinely enjoyable. My son now reads with so much more confidence.",
  },
  {
    id: 2,
    name: "Anita R.",
    country: "London, UK",
    avatar: "AR",
    avatarBg: "bg-tertiary",
    subject: "Public Speaking",
    text: "The public speaking sessions helped my daughter become more expressive and confident in school.",
  },
  {
    id: 3,
    name: "James K.",
    country: "Toronto, Canada",
    avatar: "JK",
    avatarBg: "bg-secondary",
    subject: "Grammar",
    text: "The teachers are incredibly patient and make online learning feel engaging and personal.",
  },
];

const AUTO_INTERVAL = 4500;

export default function ReviewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((i) => (i + 1) % reviews.length), []);
  const prev = () => setCurrent((i) => (i - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      className="py-24 bg-inverse-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block text-secondary-fixed font-bold tracking-widest text-xs uppercase mb-3">
            Parent Feedback
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-inverse-on-surface mb-4">
            Loved by Parents.{" "}
            <span className="text-secondary-container">Enjoyed by Children.</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={18} fill="#fdd000" stroke="#fdd000" />)}
            </div>
            <span className="text-lg font-bold text-inverse-on-surface">4.9/5</span>
            <span className="text-surface-variant text-sm">from 2,400+ reviews</span>
          </div>
        </div>

        {/* Single card spotlight */}
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-[32px] border border-white/15 shadow-xl text-center transition-all duration-500">
            <div className="flex justify-center mb-5">
              {[1,2,3,4,5].map((s) => <Star key={s} size={22} fill="#fdd000" stroke="#fdd000" />)}
            </div>
            <p className="text-inverse-on-surface text-xl leading-relaxed italic font-medium mb-8">
              &ldquo;{reviews[current].text}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-full ${reviews[current].avatarBg} flex items-center justify-center text-white font-bold shrink-0`}>
                {reviews[current].avatar}
              </div>
              <div className="text-left">
                <p className="font-bold text-inverse-on-surface">{reviews[current].name}</p>
                <p className="text-xs text-surface-variant">{reviews[current].country} · {reviews[current].subject}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={prev}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-inverse-on-surface hover:bg-white/10 transition-all">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 8000); }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? "bg-secondary-container w-8" : "bg-white/30 w-2.5 hover:bg-white/50"}`}
                />
              ))}
            </div>
            <button onClick={next}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-inverse-on-surface hover:bg-white/10 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

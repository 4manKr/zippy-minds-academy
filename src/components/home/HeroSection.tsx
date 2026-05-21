"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import DemoCTA from "@/components/DemoCTA";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const floatingCards = [
  { emoji: "🔤", label: "Phonics" },
  { emoji: "📐", label: "Mathematics" },
  { emoji: "🎤", label: "Public Speaking" },
  { emoji: "✍️", label: "Grammar" },
];

export default function HeroSection() {
  const { whatsappNumber } = useSiteSettings();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f6ff] via-white to-[#fffbf0] pt-6 pb-24">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[88vh]">

          {/* ── Left ── */}
          <div className="space-y-8 text-center lg:text-left">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant shadow-sm">
              <Sparkles size={14} className="text-secondary-container fill-secondary-container shrink-0" />
              ✨ Global Learning Community
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-display text-[2.6rem] sm:text-5xl md:text-[3.2rem] lg:text-[3.5rem] font-extrabold text-primary leading-[1.1] tracking-tight">
                Fun online classes that build strong
              </h1>
              <h1 className="font-display text-[2.6rem] sm:text-5xl md:text-[3.2rem] lg:text-[3.5rem] font-extrabold text-secondary leading-[1.1] tracking-tight">
                Academic Foundations
              </h1>
              <p className="font-display text-xl md:text-2xl font-bold text-on-surface-variant mt-3 leading-snug">
                Building Strong Readers, Thinkers &amp; Speakers
              </p>
            </div>

            {/* Description */}
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              At Zippy Minds Academy, children aged <strong className="text-on-surface">3–14</strong> explore
              learning through engaging live online classes in Phonics, Grammar, Mathematics,
              and Public Speaking — designed to spark confidence, creativity, and lifelong learning.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start flex-wrap">
              <DemoCTA className="btn-yellow text-base px-8 py-4 justify-center flex items-center gap-2 rounded-2xl font-extrabold shadow-lg" />
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-md text-base"
              >
                <MessageCircle size={18} />
                WhatsApp Us
              </a>
              <Link href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary font-bold px-8 py-4 rounded-2xl hover:bg-primary/5 transition-all text-base">
                Explore Programs <ArrowRight size={16} />
              </Link>
            </div>

            {/* Floating label */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-2">
                <span className="text-sm font-bold text-primary tracking-wide">Learn &bull; Speak &bull; Shine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-on-surface-variant font-medium">Free Trial Available</span>
              </div>
            </div>
          </div>

          {/* ── Right — subject cards grid ── */}
          <div className="hidden lg:grid grid-cols-2 gap-5 py-8">
            {[
              { emoji: "🔤", subject: "Phonics & Reading",        color: "from-pink-500 to-rose-600",     age: "Ages 3–8",   highlight: "Build fluent readers" },
              { emoji: "📐", subject: "Mathematics",              color: "from-purple-500 to-indigo-600", age: "Ages 5–14",  highlight: "Logical thinkers" },
              { emoji: "🎤", subject: "Public Speaking",          color: "from-orange-500 to-yellow-500", age: "Ages 6–14",  highlight: "Confident speakers" },
              { emoji: "✍️", subject: "English Grammar",          color: "from-blue-500 to-cyan-500",     age: "Ages 4–14",  highlight: "Strong communicators" },
            ].map((card, i) => (
              <div key={card.subject}
                className={`relative rounded-3xl overflow-hidden shadow-xl border-2 border-white group hover:-translate-y-1 transition-all duration-300 ${i === 1 ? "mt-8" : i === 3 ? "mt-8" : ""}`}>
                <div className={`bg-gradient-to-br ${card.color} p-6`}>
                  <span className="text-4xl block mb-2">{card.emoji}</span>
                  <p className="font-display font-extrabold text-white text-lg leading-tight">{card.subject}</p>
                  <p className="text-white/80 text-xs mt-1">{card.age}</p>
                </div>
                <div className="bg-white px-5 py-3">
                  <p className="text-sm font-semibold text-on-surface-variant">{card.highlight}</p>
                </div>
              </div>
            ))}

            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-xl border border-outline-variant z-10 whitespace-nowrap">
              <span className="text-lg">🌍</span>
              <span className="font-bold text-on-surface text-sm">Trusted by families in 50+ countries</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles, Video } from "lucide-react";
import DemoCTA from "@/components/DemoCTA";
import { useSiteSettings } from "@/context/SiteSettingsContext";

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

          {/* ── Right — hero image ── */}
          <div className="hidden lg:flex items-center justify-center py-10">
            <div className="relative w-full max-w-[480px]">

              {/* Yellow backing card — matches screenshot */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#F5C518] rounded-[2rem] z-0" />

              {/* Main image card */}
              <div className="relative z-10 rounded-[2rem] overflow-hidden border-[5px] border-[#F5C518] shadow-2xl aspect-[4/3]">
                <Image
                  src="/hero-student.jpg"
                  alt="Happy student learning online"
                  fill
                  className="object-cover object-top"
                  priority
                />

                {/* Live session card — overlaid on bottom of image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                      <Video size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm leading-tight">Live 1-on-1 Session</p>
                      <p className="text-xs text-on-surface-variant font-medium">Expert tutor · Active Now</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-red-500 tracking-wide">REC</span>
                  </div>
                </div>
              </div>

              {/* Floating stats badge — top left */}
              <div className="absolute -top-5 -left-6 z-20 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-outline-variant flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-base">🌍</span>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface text-sm leading-tight">5,000+ Kids</p>
                  <p className="text-xs text-on-surface-variant font-medium">Learning Worldwide</p>
                </div>
              </div>

              {/* Floating rating badge — top right */}
              <div className="absolute -top-5 -right-6 z-20 bg-white rounded-2xl px-4 py-2.5 shadow-xl border border-outline-variant flex items-center gap-2">
                <span className="text-yellow-400 text-lg">⭐</span>
                <div>
                  <p className="font-extrabold text-on-surface text-sm leading-tight">4.9 / 5</p>
                  <p className="text-xs text-on-surface-variant font-medium">Parent Rating</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

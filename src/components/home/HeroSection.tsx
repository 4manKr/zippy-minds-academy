"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Video } from "lucide-react";
import DemoCTA from "@/components/DemoCTA";

const featureCards = [
  { icon: "🎓", title: "Top 1% Tutors",   desc: "Rigorous selection from premier Indian institutions.", color: "border-primary" },
  { icon: "⏰", title: "Flexi-Time",       desc: "Classes that fit your family's global schedule.",    color: "border-tertiary" },
  { icon: "🌍", title: "Global Reach",     desc: "Students from 50+ countries learning together.",    color: "border-secondary-container" },
  { icon: "🏆", title: "Results Driven",   desc: "Focus on confidence and core subject mastery.",     color: "border-primary-container" },
];

const avatarEmojis = ["🧑🏻", "👧🏽", "🧒🏿", "👦🏼", "👧🏻"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[82vh]">

          {/* ── Left ── */}
          <div className="space-y-7 text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant shadow-sm">
              <CheckCircle size={15} className="text-primary shrink-0" />
              The Future of Global Learning
              <Zap size={14} className="text-secondary-container fill-secondary-container shrink-0" />
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="font-display text-[2.8rem] sm:text-5xl md:text-[3.5rem] lg:text-[3.8rem] font-extrabold text-primary leading-[1.1] tracking-tight">
                Future-Ready Kids,
              </h1>
              <h2 className="font-display text-[2.8rem] sm:text-5xl md:text-[3.5rem] lg:text-[3.8rem] font-extrabold text-tertiary leading-[1.1] tracking-tight">
                One Class at a Time.
              </h2>
            </div>

            {/* Description */}
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Empower your child with 1-on-1 personalized sessions led by expert tutors.
              We build confidence through interactive learning that kids actually love.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <DemoCTA className="btn-yellow text-base px-8 py-4 justify-center flex items-center gap-2" />
              <Link href="/courses" className="btn-secondary text-base px-8 py-4 justify-center">
                View Courses
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2.5">
                {avatarEmojis.map((em, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-base shadow-sm">
                    {em}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">
                Trusted by <span className="text-primary font-bold">5,000+</span> Parents Worldwide
              </p>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="relative hidden lg:flex items-center justify-center py-10">
            {/* Yellow backing card — offset top-right */}
            <div className="absolute top-4 right-0 w-[88%] h-[88%] bg-secondary-container rounded-3xl z-0" />

            {/* Main image card */}
            <div className="relative z-10 w-[88%] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <div className="aspect-[4/3] relative">

                {/* Hero student photo — fills the entire card */}
                <Image
                  src="/hero-student.jpg"
                  alt="Student learning online at Zippy Minds Academy"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 1280px) 50vw, 640px"
                />

                {/* Subtle gradient at bottom for card readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10" />

                {/* Floating stats — top-left */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 shadow-lg border border-white/60 flex items-center gap-2">
                    <span className="text-lg">🎓</span>
                    <div>
                      <p className="text-[11px] font-bold text-on-surface leading-none">5,000+ Kids</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Learning Worldwide</p>
                    </div>
                  </div>
                </div>

                {/* Floating rating — top-right */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 shadow-lg border border-white/60 flex items-center gap-1.5">
                    <span className="text-yellow-400 text-base">⭐</span>
                    <div>
                      <p className="text-[11px] font-bold text-on-surface leading-none">4.9 / 5</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Parent Rating</p>
                    </div>
                  </div>
                </div>

                {/* Live Session floating card — bottom */}
                <div className="absolute bottom-5 left-5 right-5 z-20">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl border border-white/60">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#2d8cff] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <Video size={20} color="white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-none">Live 1-on-1 Session</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Expert tutor · Active Now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-500 font-bold text-sm tracking-wide">REC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Feature cards ── */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((f) => (
            <div key={f.title} className={`bg-surface-container-lowest p-6 rounded-3xl shadow-card border-t-4 ${f.color} card-hover`}>
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h4 className="font-display font-bold text-on-surface text-base mb-1">{f.title}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

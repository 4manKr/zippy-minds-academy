"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const featureCards = [
  { icon: "🎓", title: "Top 1% Tutors",   desc: "Rigorous selection from premier Indian institutions.", color: "border-primary" },
  { icon: "⏰", title: "Flexi-Time",       desc: "Classes that fit your family's global schedule.",    color: "border-tertiary" },
  { icon: "🌍", title: "Global Reach",     desc: "Students from 50+ countries learning together.",    color: "border-secondary-container" },
  { icon: "🏆", title: "Results Driven",   desc: "Focus on confidence and core subject mastery.",     color: "border-primary-container" },
];

const checks = ["Free Demo Session", "Ages 3–15", "Any Timezone", "100% Online"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface pt-8 pb-20">
      {/* Floating decorative elements */}
      <div className="absolute top-16 right-16 text-secondary-container opacity-40 text-7xl animate-float select-none pointer-events-none" style={{ animationDelay: "1s" }}>🚀</div>
      <div className="absolute bottom-32 left-12 text-tertiary opacity-30 text-5xl animate-float select-none pointer-events-none" style={{ animationDelay: "2s" }}>✦</div>
      <div className="absolute top-1/3 left-1/4 text-primary opacity-20 text-4xl animate-float select-none pointer-events-none" style={{ animationDelay: "0.5s" }}>⚡</div>
      <div className="absolute top-20 left-[40%] text-tertiary-fixed opacity-50 text-3xl animate-float select-none pointer-events-none" style={{ animationDelay: "1.5s" }}>⭐</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left ── */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-secondary border border-secondary-container/40 rounded-full px-4 py-2 text-sm font-semibold">
              <span>✅</span> The Future of Global Learning
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight">
                Future-Ready Kids,
              </h1>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-tertiary leading-tight tracking-tight">
                One Class at a Time.
              </h2>
            </div>

            <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Empower your child with 1-on-1 personalized sessions led by expert tutors.
              We build confidence through interactive learning that kids actually love.
            </p>

            {/* Checks */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {checks.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
                  <CheckCircle size={15} className="text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link href="/book-demo" className="btn-yellow text-base px-8 py-4 justify-center">
                Book a Demo <ArrowRight size={20} />
              </Link>
              <Link href="/courses" className="btn-secondary text-base px-8 py-4 justify-center">
                View Courses
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start pt-2">
              <div className="flex -space-x-2">
                {["🧑🏻", "👧🏽", "🧒🏿", "👦🏼", "👧🏻"].map((em, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-base">
                    {em}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">Trusted by <span className="text-primary font-bold">10,000+</span> Parents Worldwide</p>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="relative hidden lg:block">
            {/* Decorative back layers */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-secondary-container rounded-3xl rotate-3 -z-10" />
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-tertiary-fixed/40 rounded-3xl -rotate-3 -z-20" />

            {/* Hero card */}
            <div className="relative rounded-3xl overflow-hidden shadow-card-hover border-4 border-white/60">
              <div className="bg-gradient-to-br from-primary-fixed to-surface-container-high aspect-[4/3] flex items-center justify-center relative">
                <Image
                  src="/zippy-logo.jpeg"
                  alt="Zippy Minds Academy"
                  width={200}
                  height={200}
                  className="object-contain drop-shadow-2xl rounded-2xl"
                  priority
                />
                {/* Live session badge */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary text-white p-1.5 rounded-xl">
                        <span className="text-xs">📹</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface leading-none">Live Session</p>
                        <p className="text-[10px] text-on-surface-variant">Active Now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
                      <span className="text-error font-bold text-[11px]">REC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feature cards grid ── */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

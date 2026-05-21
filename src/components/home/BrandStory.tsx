"use client";

import { Heart, Lightbulb, Smile } from "lucide-react";

const pillars = [
  { icon: Heart,      color: "bg-pink-100 text-pink-600",   label: "Nurturing Environment" },
  { icon: Lightbulb, color: "bg-yellow-100 text-yellow-600", label: "Curiosity-Driven Learning" },
  { icon: Smile,     color: "bg-green-100 text-green-600",   label: "Confidence Building" },
];

export default function BrandStory() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 to-secondary-container/20 rounded-[40px] p-10 flex flex-col gap-6">
              {/* Quote */}
              <div className="bg-white rounded-3xl p-7 shadow-card border border-outline-variant">
                <p className="font-display text-xl font-bold text-on-surface leading-snug mb-3">
                  &ldquo;When children love learning, growth comes naturally.&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">ZM</div>
                  <span className="text-sm font-semibold text-primary">Zippy Minds Academy</span>
                </div>
              </div>

              {/* Before → After */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-outline-variant">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">📈 Growth Journey</p>
                <div className="space-y-3">
                  {[
                    { before: "Hesitant reader",       after: "Fluent reader" },
                    { before: "Shy speaker",           after: "Confident communicator" },
                    { before: "Struggling learner",    after: "Active participant" },
                  ].map(({ before, after }) => (
                    <div key={before} className="flex items-center gap-3 text-sm">
                      <span className="text-on-surface-variant line-through opacity-60 flex-1 text-right">{before}</span>
                      <span className="text-primary font-bold text-base">→</span>
                      <span className="font-bold text-green-600 flex-1">{after}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pillars */}
              <div className="flex gap-3 flex-wrap">
                {pillars.map(({ icon: Icon, color, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm border border-outline-variant">
                    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div className="space-y-7">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              Our Story
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
              Learning That Feels{" "}
              <span className="text-primary">Inspiring,</span>
              <br />Not Overwhelming
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed font-semibold">
              Every child learns differently — and that&apos;s exactly what we celebrate.
            </p>
            <p className="text-on-surface-variant text-base leading-relaxed">
              At Zippy Minds Academy, we create interactive learning experiences that help children
              feel confident, curious, and excited to participate. Our programs combine strong
              academic foundations with creativity, communication, and critical thinking skills
              in a fun online environment children genuinely enjoy.
            </p>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Because when children love learning, growth comes naturally.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

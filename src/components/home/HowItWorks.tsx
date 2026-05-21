"use client";

import Link from "next/link";
import { Calendar, Users, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Calendar,
    title: "Book a Free Trial Class",
    desc: "Choose a convenient schedule and experience our teaching approach firsthand.",
    color: "bg-primary/10 text-primary border-primary/20",
    numColor: "text-primary",
  },
  {
    step: "02",
    icon: Users,
    title: "Meet Our Educators",
    desc: "Our expert teachers assess your child's learning needs and level.",
    color: "bg-secondary-container/15 text-secondary border-secondary-container/30",
    numColor: "text-secondary",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Begin Learning With Confidence",
    desc: "Join interactive sessions designed to help your child grow academically and personally.",
    color: "bg-tertiary/10 text-tertiary border-tertiary/20",
    numColor: "text-tertiary",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Getting Started
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
            Start Your Child&apos;s{" "}
            <span className="text-primary">Learning Journey</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-20" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex flex-col items-center text-center group">
                {/* Circle */}
                <div className="relative mb-7">
                  <div className={`w-20 h-20 rounded-3xl ${s.color} border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-card`}>
                    <Icon size={32} />
                  </div>
                  <span className={`absolute -top-2 -right-2 text-xs font-extrabold ${s.numColor} bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-outline-variant`}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-on-surface text-xl mb-3 leading-snug">{s.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-14">
          <Link href="/book-demo"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-extrabold px-10 py-4 rounded-2xl hover:opacity-90 transition-all shadow-md text-base">
            Book Free Trial <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Users, Globe, CheckCircle, Play } from "lucide-react";

const floatingCards = [
  { icon: "🇬🇧", country: "UK Parent", text: "My son improved 2 grades!", top: "15%", left: "2%", delay: "0s" },
  { icon: "🇺🇸", country: "USA Parent", text: "Excellent tutors!", top: "60%", left: "0%", delay: "1s" },
  { icon: "🇦🇺", country: "Australia", text: "Best investment ever!", top: "20%", right: "2%", delay: "0.5s" },
  { icon: "🇸🇬", country: "Singapore", text: "Highly recommend!", top: "65%", right: "0%", delay: "1.5s" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-cyan/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="text-white">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="flex -space-x-1">
                {["🇺🇸","🇬🇧","🇦🇺","🇸🇬","🇨🇦"].map((flag) => (
                  <span key={flag} className="text-lg">{flag}</span>
                ))}
              </div>
              <span className="text-sm font-medium">Trusted by 10,000+ families worldwide</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Personalized{" "}
              <span className="text-brand-cyan">1-to-1</span>{" "}
              Indian Tutors for{" "}
              <span className="underline decoration-brand-cyan decoration-4 underline-offset-4">
                Students Worldwide
              </span>
            </h1>

            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
              Connect your child with India&apos;s finest tutors. Expert, affordable, and
              timezone-flexible learning sessions — all from the comfort of your home.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                "Free Demo Session",
                "Certified Tutors",
                "Any Timezone",
                "All Subjects",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-white/90">
                  <CheckCircle size={16} className="text-brand-cyan" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue font-bold px-8 py-4 rounded-2xl hover:bg-brand-cyan hover:text-white transition-all duration-300 hover:shadow-glow hover:-translate-y-1 text-base"
              >
                Book Free Demo
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 text-base backdrop-blur-sm"
              >
                <Play size={18} />
                Explore Courses
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              {[
                { value: "500+", label: "Expert Tutors" },
                { value: "10K+", label: "Happy Students" },
                { value: "50+", label: "Countries" },
                { value: "4.9★", label: "Average Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Illustration + Floating Cards */}
          <div className="relative hidden lg:block">
            {/* Central image placeholder */}
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/20 flex items-center justify-center">
                  <div className="text-center text-white/60 p-8">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                      <Globe size={64} className="text-brand-cyan" />
                    </div>
                    <p className="text-xl font-semibold text-white">Global Learning Hub</p>
                    <p className="text-sm mt-2 text-white/60">Connect · Learn · Grow</p>
                  </div>
                </div>
              </div>

              {/* Live session card */}
              <div className="absolute -bottom-6 -left-10 bg-white rounded-2xl shadow-card-hover p-4 max-w-xs animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Live Session</p>
                    <p className="text-xs text-gray-500">Mathematics — Grade 8</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </div>
                </div>
              </div>

              {/* Rating card */}
              <div className="absolute -top-6 -right-8 bg-white rounded-2xl shadow-card-hover p-4 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} fill="gold" stroke="gold" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">4.9/5</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">10,000+ Reviews</p>
              </div>
            </div>

            {/* Floating country cards */}
            {floatingCards.map((card) => (
              <div
                key={card.country}
                className="absolute bg-white/95 backdrop-blur-sm rounded-xl shadow-card px-3 py-2 border border-white/40 animate-float text-sm hidden xl:flex items-center gap-2"
                style={{
                  top: card.top,
                  left: card.left,
                  right: (card as { right?: string }).right,
                  animationDelay: card.delay,
                }}
              >
                <span className="text-xl">{card.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">{card.country}</p>
                  <p className="text-gray-500 text-xs">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 0 900 80 720 40C540 0 240 80 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

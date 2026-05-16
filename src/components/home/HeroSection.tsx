"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Play, Star } from "lucide-react";

const trustFlags = ["🇺🇸","🇬🇧","🇦🇺","🇸🇬","🇨🇦","🇦🇪","🇳🇿","🇿🇦"];

const highlights = [
  { icon: "🎓", label: "Live Interactive Classes" },
  { icon: "👩‍🏫", label: "Experienced Teachers" },
  { icon: "🛡️", label: "Safe & Supportive" },
  { icon: "💡", label: "Personalized Learning" },
];

const subjects = [
  { icon: "🔤", label: "Phonics",         color: "bg-pink-100 text-pink-700"   },
  { icon: "💬", label: "English Grammar", color: "bg-blue-100 text-blue-700"   },
  { icon: "🔢", label: "Mathematics",     color: "bg-purple-100 text-purple-700"},
  { icon: "🎤", label: "Public Speaking", color: "bg-orange-100 text-orange-700"},
  { icon: "✏️",  label: "Writing",         color: "bg-teal-100 text-teal-700"   },
  { icon: "💻", label: "Coding",          color: "bg-indigo-100 text-indigo-700"},
  { icon: "🔬", label: "Science",         color: "bg-green-100 text-green-700" },
  { icon: "🌟", label: "Life Skills",     color: "bg-yellow-100 text-yellow-700"},
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl" />

      {/* Star sparkles */}
      {["top-20 left-[8%]","top-32 right-[12%]","bottom-40 left-[15%]","bottom-20 right-[20%]"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} text-yellow-300 text-2xl animate-bounce`} style={{ animationDelay: `${i * 0.4}s` }}>✦</div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left ── */}
          <div className="text-white">
            {/* Global trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="flex -space-x-1">
                {trustFlags.map((f) => <span key={f} className="text-base">{f}</span>)}
              </div>
              <span className="text-sm font-medium">Enrolling Students Globally!</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-3">
              <span className="text-yellow-300">Fun</span> &{" "}
              <span className="text-pink-300">Interactive</span>
            </h1>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 text-white">
              Online Classes
            </h2>
            <div className="inline-block bg-yellow-400 text-brand-navy font-bold text-lg px-5 py-2 rounded-full mb-6">
              For Future-Ready Kids! 🚀
            </div>

            {/* Tagline */}
            <p className="text-white/80 text-lg mb-4 font-medium">
              Learn Smart.{" "}
              <span className="text-teal-300">Speak Confident.</span>{" "}
              <span className="text-pink-300">Shape Tomorrow.</span>
            </p>

            <p className="text-white/70 text-base mb-8 max-w-lg leading-relaxed">
              Connecting young minds worldwide with India&apos;s finest educators
              for personalized 1-to-1 live sessions — Phonics, English, Math,
              Public Speaking, Coding &amp; more!
            </p>

            {/* Checks */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["Free Demo Session", "Ages 3–15", "Any Timezone", "100% Online"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-white/90">
                  <CheckCircle size={15} className="text-teal-300" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-brand-navy font-bold px-8 py-4 rounded-2xl hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange text-base"
              >
                Enroll Now! <ArrowRight size={20} />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 text-base backdrop-blur-sm"
              >
                <Play size={18} fill="white" /> Explore Courses
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/20">
              {[
                { value: "500+", label: "Expert Tutors" },
                { value: "10K+", label: "Happy Students" },
                { value: "50+",  label: "Countries" },
                { value: "4.9★", label: "Avg Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right ── */}
          <div className="relative hidden lg:flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="relative w-56 h-56 animate-float">
              <Image
                src="/zippy-logo.jpeg"
                alt="Zippy Minds Academy"
                fill
                className="object-contain drop-shadow-2xl rounded-3xl"
                priority
              />
            </div>

            {/* Subject pills grid */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
              {subjects.map((s) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl ${s.color} text-center card-hover`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Floating card — live session */}
            <div className="absolute -bottom-4 -left-12 bg-white rounded-2xl shadow-card-hover p-4 max-w-[220px] animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-600">Live Now</span>
              </div>
              <p className="text-sm font-bold text-gray-900">Phonics Class</p>
              <p className="text-xs text-gray-500">with Ms. Ananya · 12 students</p>
              <div className="flex mt-2">
                {[1,2,3,4,5].map((s) => <Star key={s} size={10} fill="gold" stroke="gold" />)}
              </div>
            </div>

            {/* Floating card — global */}
            <div className="absolute -top-2 -right-10 bg-white rounded-2xl shadow-card-hover p-3 animate-float" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs font-bold text-gray-900">🌍 Joining globally!</p>
              <p className="text-xs text-gray-400 mt-0.5">UK · USA · Australia · UAE</p>
            </div>
          </div>
        </div>

        {/* Bottom highlight bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
              <span className="text-2xl">{h.icon}</span>
              <span className="text-sm font-semibold text-white">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1200 0 900 80 720 40C540 0 240 80 0 40L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}

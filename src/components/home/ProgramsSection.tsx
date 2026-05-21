"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const programs = [
  {
    emoji: "🔤",
    title: "Phonics & Reading Skills",
    desc: "Helping children become confident readers through sounds, blending, pronunciation, spelling, and comprehension activities.",
    gradient: "from-pink-500 to-rose-500",
    age: "Ages 3–8",
    tag: "Most Popular",
  },
  {
    emoji: "✍️",
    title: "Grammar & English Communication",
    desc: "Strengthen vocabulary, sentence structure, writing ability, and spoken English through engaging lessons.",
    gradient: "from-blue-500 to-cyan-500",
    age: "Ages 4–14",
    tag: "Core Skill",
  },
  {
    emoji: "➕",
    title: "Mathematics",
    desc: "Interactive math learning that develops logical thinking, accuracy, and problem-solving confidence.",
    gradient: "from-purple-500 to-indigo-600",
    age: "Ages 5–14",
    tag: "Foundation",
  },
  {
    emoji: "🎤",
    title: "Public Speaking & Communication",
    desc: "Helping children speak confidently, present ideas clearly, and overcome stage fear in a supportive environment.",
    gradient: "from-orange-500 to-yellow-500",
    age: "Ages 6–14",
    tag: "Life Skill",
  },
];

export default function ProgramsSection() {
  const { whatsappNumber } = useSiteSettings();

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Our Programs
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
            Programs Designed for{" "}
            <span className="text-secondary">Growing Minds</span>
          </h2>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {programs.map((p) => (
            <div key={p.title}
              className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-card border border-outline-variant hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 flex flex-col">
              {/* Card header */}
              <div className={`bg-gradient-to-br ${p.gradient} px-6 pt-6 pb-5 relative`}>
                <span className="absolute top-3 right-3 bg-white/25 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {p.tag}
                </span>
                <span className="text-5xl block mb-3">{p.emoji}</span>
                <h3 className="font-display font-extrabold text-white text-lg leading-tight">{p.title}</h3>
                <p className="text-white/75 text-xs mt-1 font-semibold">{p.age}</p>
              </div>
              {/* Card body */}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-on-surface-variant leading-relaxed flex-1">{p.desc}</p>
                <Link href="/book-demo"
                  className="mt-4 flex items-center gap-1.5 text-primary text-sm font-bold hover:gap-3 transition-all">
                  Book Free Trial <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-on-surface-variant font-semibold mb-5 text-base">
            Discover the Right Program for Your Child
          </p>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold px-8 py-4 rounded-2xl shadow-md transition-all text-base">
            <MessageCircle size={20} />
            Connect on WhatsApp
          </a>
        </div>

      </div>
    </section>
  );
}

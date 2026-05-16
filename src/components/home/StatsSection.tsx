"use client";

import { Users, BookOpen, Globe, Star, Clock, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "Happy Students", color: "blue" },
  { icon: BookOpen, value: "500+", label: "Expert Tutors", color: "purple" },
  { icon: Globe, value: "50+", label: "Countries Served", color: "cyan" },
  { icon: Star, value: "4.9/5", label: "Average Rating", color: "blue" },
  { icon: Clock, value: "1M+", label: "Sessions Completed", color: "purple" },
  { icon: Award, value: "98%", label: "Satisfaction Rate", color: "cyan" },
];

const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-brand-blue", value: "text-brand-blue" },
  purple: { bg: "bg-purple-50", icon: "text-brand-purple", value: "text-brand-purple" },
  cyan: { bg: "bg-cyan-50", icon: "text-brand-cyan", value: "text-brand-cyan" },
};

export default function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Numbers that speak{" "}
            <span className="text-brand-cyan underline decoration-4 underline-offset-4">for themselves</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Thousands of families worldwide trust Zippy Minds Academy for their children&apos;s education.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.color];
            return (
              <div
                key={stat.label}
                className="text-center group"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110`}>
                  <Icon size={28} className="text-white" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

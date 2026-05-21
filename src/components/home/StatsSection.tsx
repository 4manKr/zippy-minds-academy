"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, Globe, Star, Clock, Award } from "lucide-react";

interface LiveStats {
  parents:  number;
  tutors:   number;
  sessions: number;
  courses:  number;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`;
  if (n > 0)     return `${n}+`;
  return "—";
}

// Minimum thresholds — live DB count only shown when it exceeds these
const MIN_STUDENTS = 10000;
const MIN_TUTORS   = 500;
const MIN_SESSIONS = 1000000;

export default function StatsSection() {
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setLive(d); })
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: Users,
      value: live && live.parents  > MIN_STUDENTS ? formatCount(live.parents)  : "10,000+",
      label: "Happy Students",
    },
    {
      icon: BookOpen,
      value: live && live.tutors   > MIN_TUTORS   ? formatCount(live.tutors)   : "500+",
      label: "Expert Tutors",
    },
    { icon: Globe,  value: "50+",    label: "Countries Served" },
    { icon: Star,   value: "4.9/5",  label: "Average Rating" },
    {
      icon: Clock,
      value: live && live.sessions > MIN_SESSIONS ? formatCount(live.sessions) : "1M+",
      label: "Sessions Completed",
    },
    { icon: Award,  value: "98%",    label: "Satisfaction Rate" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Numbers that speak{" "}
            <span className="text-secondary-container underline decoration-4 underline-offset-4">for themselves</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Thousands of families worldwide trust Zippy Minds Academy for their children&apos;s education.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
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

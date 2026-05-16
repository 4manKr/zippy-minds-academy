"use client";

import { Globe, Clock, CheckCircle } from "lucide-react";

const timezones = [
  { flag: "🇮🇳", country: "India (IST)", time: "9:00 AM", tutorTime: "Available" },
  { flag: "🇬🇧", country: "UK (GMT)", time: "3:30 AM", parentTime: "Your time" },
  { flag: "🇺🇸", country: "USA (EST)", time: "10:30 PM", parentTime: "Your time" },
  { flag: "🇦🇺", country: "Australia (AEST)", time: "1:30 PM", parentTime: "Your time" },
  { flag: "🇸🇬", country: "Singapore (SGT)", time: "11:30 AM", parentTime: "Your time" },
  { flag: "🇦🇪", country: "Dubai (GST)", time: "7:30 AM", parentTime: "Your time" },
];

const features = [
  "Tutor availability shown in your local timezone",
  "Automatic timezone detection",
  "No manual timezone math — ever",
  "Supports 150+ world timezones",
  "Smart slot locking to prevent double-booking",
  "Daylight saving time handled automatically",
];

export default function TimezoneFeature() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="badge-cyan mb-4 inline-block">Global Scheduling</span>
            <h2 className="section-heading mb-6">
              Book sessions in{" "}
              <span className="gradient-text">your timezone</span>
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Our intelligent scheduling system automatically converts tutor
              availability into your local time. No confusion, no mistakes, no late arrivals.
            </p>
            <ul className="space-y-3 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-brand-cyan shrink-0 mt-0.5" />
                  <span className="text-gray-600">{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center shrink-0">
                <Globe size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Available in 50+ countries</p>
                <p className="text-sm text-gray-500">Parents from UK, US, Australia, Gulf, Singapore & more</p>
              </div>
            </div>
          </div>

          {/* Right — Timezone clock visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900 to-brand-blue/90 rounded-3xl p-8 text-white shadow-card-hover">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Clock size={20} className="text-brand-cyan" />
                </div>
                <div>
                  <p className="font-bold">Smart Timezone Scheduler</p>
                  <p className="text-xs text-white/60">Tutor available: 9 AM IST</p>
                </div>
              </div>

              <div className="space-y-3">
                {timezones.map((tz) => (
                  <div
                    key={tz.country}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tz.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{tz.country}</p>
                        <p className="text-xs text-white/50">{tz.parentTime || tz.tutorTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-cyan">{tz.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-white/60">All times auto-detected · No manual input needed</p>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

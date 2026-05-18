"use client";

import Link from "next/link";
import { ChevronRight, Timer, Users, CreditCard, Star, Settings, LogOut, LayoutDashboard, Calendar, BookOpen, History, User, Plus } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "#" },
  { icon: Calendar,        label: "Schedule",        href: "#", active: true },
  { icon: BookOpen,        label: "Learning Center", href: "#" },
  { icon: History,         label: "History",         href: "#" },
  { icon: User,            label: "Profile",         href: "#" },
  { icon: CreditCard,      label: "Payments",        href: "#" },
];

const stats = [
  { icon: Timer,      label: "Hours Taught",    value: "1,240", color: "border-primary",           iconColor: "text-primary" },
  { icon: Users,      label: "Active Students", value: "85",    color: "border-tertiary",          iconColor: "text-tertiary" },
  { icon: CreditCard, label: "Total Earnings",  value: "₹3,20,000",color: "border-secondary-container",iconColor: "text-secondary" },
  { icon: Star,       label: "Avg. Rating",     value: "4.9/5", color: "border-primary-container", iconColor: "text-primary-container" },
];

const sessions = [
  { subject: "Mathematics",     student: "Emma S.",  time: "Today, 2:30 PM – 3:30 PM",  color: "border-primary" },
  { subject: "Phonics",         student: "Noah J.",  time: "Today, 4:00 PM – 4:45 PM",  color: "border-tertiary" },
  { subject: "English Grammar", student: "Maya K.",  time: "Tomorrow, 10:00 AM",         color: "border-secondary-container" },
  { subject: "Public Speaking", student: "Leo V.",   time: "Tomorrow, 1:00 PM",          color: "border-primary" },
];

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const availability: Record<string, Record<string, string>> = {
  "08:00": { Mon: "available", Tue: "",          Wed: "available", Thu: "",          Fri: "available", Sat: "", Sun: "" },
  "09:00": { Mon: "available", Tue: "available", Wed: "available", Thu: "available", Fri: "available", Sat: "", Sun: "" },
  "10:00": { Mon: "available", Tue: "available", Wed: "available", Thu: "available", Fri: "available", Sat: "busy", Sun: "busy" },
  "11:00": { Mon: "",          Tue: "",          Wed: "available", Thu: "",          Fri: "",          Sat: "", Sun: "" },
  "12:00": { Mon: "break",     Tue: "break",     Wed: "break",     Thu: "break",     Fri: "break",     Sat: "", Sun: "" },
};

const toolkits = [
  { icon: "🔤", label: "Phonics Kit",     bg: "bg-tertiary-fixed" },
  { icon: "💬", label: "Grammar Play",    bg: "bg-primary/10" },
  { icon: "🔢", label: "Math Lab",        bg: "bg-secondary-container/20" },
  { icon: "🎤", label: "Public Speaking", bg: "bg-tertiary/10" },
  { icon: "📚", label: "Resources",       bg: "bg-surface-container-high" },
];

export default function TutorDashboard() {
  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant py-6 gap-1">
        <div className="px-6 mb-6">
          <h1 className="font-display font-bold text-primary text-lg leading-none">Zippy Explorer</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Level 4 Tutor</p>
        </div>

        <nav className="flex flex-col flex-grow gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className={item.active ? "sidebar-link-active" : "sidebar-link"}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pb-4 space-y-1">
          <button className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 shadow-md squishy-hover flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> Book New Session
          </button>
          <Link href="#" className="sidebar-link"><Settings size={18} /> Settings</Link>
          <Link href="/" className="sidebar-link"><LogOut size={18} /> Sign Out</Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-grow lg:ml-64 px-4 md:px-8 lg:px-10 py-10 bg-surface space-y-8">

        {/* Welcome + Next session */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-2xl shadow-card border-t-4 border-primary">
            <h1 className="font-display font-bold text-on-surface text-xl mb-1">Welcome back, Tutor Sarah! 👋</h1>
            <p className="text-on-surface-variant">Your students are excited for another week of Fun &amp; Interactive Online Classes.</p>
          </div>
          <div className="bg-secondary-container p-5 rounded-2xl shadow-card relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">Next Session</span>
              <h3 className="font-display font-bold text-on-secondary-fixed text-base mt-1">Phonics with Liam</h3>
              <p className="text-sm font-semibold text-on-secondary-fixed/80">Starts in 15 mins</p>
              <button className="mt-3 bg-on-secondary-fixed text-secondary-container px-4 py-2 rounded-full font-bold text-xs squishy-hover">
                Join Class →
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 group-hover:rotate-12 transition-transform select-none">🚀</div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map(({ icon: Icon, label, value, color, iconColor }) => (
            <div key={label} className={`bg-surface-container-lowest p-5 rounded-2xl shadow-card flex flex-col items-center text-center border-b-4 ${color}`}>
              <Icon size={32} className={`${iconColor} mb-2`} />
              <span className="font-display font-bold text-2xl text-on-surface">{value}</span>
              <span className="text-xs text-on-surface-variant mt-0.5">{label}</span>
            </div>
          ))}
        </section>

        {/* Availability + Upcoming sessions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Availability grid */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl shadow-card">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-bold text-on-surface text-base">Manage Availability</h3>
              <div className="flex gap-2">
                <button className="bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold">Clear All</button>
                <button className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm squishy-hover">Save Changes</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="w-14" />
                    {days.map((d) => (
                      <th key={d} className="font-semibold text-on-surface-variant pb-3 text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="h-10">
                      <td className="text-right pr-3 text-on-surface-variant font-semibold">{slot}</td>
                      {days.map((day) => {
                        const state = availability[slot]?.[day] ?? "";
                        return (
                          <td key={day} className={`border border-outline-variant/30 cursor-pointer hover:bg-primary/10 transition-colors ${
                            state === "available" ? "bg-primary-fixed" :
                            state === "break"     ? "bg-tertiary-fixed" :
                            state === "busy"      ? "bg-surface-container-high" :
                            ""
                          }`} />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-3 italic">* Click and drag to paint your available teaching slots.</p>
          </div>

          {/* Upcoming sessions */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-card flex flex-col">
            <h3 className="font-display font-bold text-on-surface mb-4 flex items-center gap-2 text-base">
              📋 Upcoming Sessions
            </h3>
            <div className="space-y-3 flex-grow">
              {sessions.map((s) => (
                <div key={s.student} className={`p-3 bg-surface-container-low rounded-xl border-l-4 ${s.color} flex items-center justify-between group hover:bg-surface-container-high transition-colors`}>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">{s.subject}: {s.student}</p>
                    <p className="text-xs text-on-surface-variant">{s.time}</p>
                  </div>
                  <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
            <button className="mt-4 w-full border border-primary text-primary py-2.5 rounded-xl text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all">
              View Full Agenda
            </button>
          </div>
        </section>

        {/* Enhance Your Classes */}
        <section className="bg-primary/5 p-8 rounded-3xl border-2 border-dashed border-primary-container/30">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="font-display font-bold text-primary text-xl mb-1">Enhance Your Classes</h2>
            <p className="text-on-surface-variant text-sm">Use our digital toolkits to make learning fun and future-ready.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {toolkits.map((t) => (
              <button key={t.label} className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm hover:-translate-y-1 transition-transform group">
                <div className={`w-12 h-12 ${t.bg} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                  {t.icon}
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">{t.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard, Calendar, Clock, DollarSign, Bell, User,
  LogOut, Video, CheckCircle, XCircle, AlertCircle, Menu, X,
  TrendingUp, Users, BookOpen, Settings, BarChart3, Plus, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/tutor", active: true },
  { icon: Calendar, label: "Availability", href: "/dashboard/tutor/availability" },
  { icon: AlertCircle, label: "Session Requests", href: "/dashboard/tutor/requests", badge: 2 },
  { icon: Video, label: "Upcoming Sessions", href: "/dashboard/tutor/sessions" },
  { icon: Clock, label: "Session History", href: "/dashboard/tutor/history" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/tutor/analytics" },
  { icon: DollarSign, label: "Earnings", href: "/dashboard/tutor/earnings" },
  { icon: Bell, label: "Notifications", href: "/dashboard/tutor/notifications", badge: 5 },
  { icon: User, label: "Profile", href: "/dashboard/tutor/profile" },
];

const pendingRequests = [
  { id: 1, parent: "Sarah Mitchell", child: "Emma", subject: "Mathematics", grade: "Grade 10", date: "May 20, 2025", time: "3:00 PM IST", duration: "60 min", type: "Demo", country: "🇬🇧 UK" },
  { id: 2, parent: "James Anderson", child: "Ryan", subject: "Physics", grade: "Grade 11", date: "May 21, 2025", time: "5:00 PM IST", duration: "60 min", type: "Regular", country: "🇺🇸 USA" },
];

const upcomingSessions = [
  { id: 1, parent: "Preethi R.", child: "Aarav", subject: "Mathematics", time: "Today 4:00 PM", initials: "PR", color: "from-blue-400 to-brand-blue", zoomLink: "#" },
  { id: 2, parent: "Mohammed A.", child: "Zara", subject: "Chemistry", time: "Tomorrow 6:00 PM", initials: "MA", color: "from-purple-400 to-brand-purple", zoomLink: "#" },
];

const stats = [
  { label: "Total Hours Taught", value: "248h", icon: Clock, color: "blue", change: "+12h this week" },
  { label: "Active Students", value: "42", icon: Users, color: "purple", change: "+3 this month" },
  { label: "Sessions Completed", value: "186", icon: CheckCircle, color: "cyan", change: "98% completion" },
  { label: "This Month Earnings", value: "$1,240", icon: DollarSign, color: "green", change: "+$180 vs last" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const availabilitySlots = [
  { day: "Mon", slots: ["9-10", "10-11", "4-5", "5-6"] },
  { day: "Tue", slots: ["9-10", "11-12", "4-5"] },
  { day: "Wed", slots: ["10-11", "2-3", "5-6", "6-7"] },
  { day: "Thu", slots: ["9-10", "4-5", "6-7"] },
  { day: "Fri", slots: ["9-10", "10-11", "2-3"] },
  { day: "Sat", slots: ["10-11", "11-12", "12-1"] },
  { day: "Sun", slots: [] },
];

export default function TutorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestActions, setRequestActions] = useState<Record<number, "accepted" | "rejected" | null>>({ 1: null, 2: null });

  const handleRequest = (id: number, action: "accepted" | "rejected") => {
    setRequestActions((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="relative w-10 h-10">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Zippy Minds</p>
            <p className="text-xs text-purple-500 font-medium">Tutor Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, href, active, badge }) => (
            <Link key={href} href={href} className={active ? "sidebar-link-active" : "sidebar-link"}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">{badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold text-sm">PS</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Dr. Priya Sharma</p>
              <p className="text-xs text-gray-400 truncate">Mathematics · Physics</p>
            </div>
            <LogOut size={16} className="text-gray-400 shrink-0" />
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Tutor Dashboard</h1>
              <p className="text-xs text-gray-500">Wednesday, May 19, 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-50 border border-gray-200">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <Link href="/dashboard/tutor/availability" className="btn-primary text-sm py-2">
              <Settings size={16} /> Manage Availability
            </Link>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="stat-card">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    stat.color === "blue" ? "bg-blue-50 text-brand-blue" :
                    stat.color === "purple" ? "bg-purple-50 text-brand-purple" :
                    stat.color === "cyan" ? "bg-cyan-50 text-brand-cyan" :
                    "bg-green-50 text-green-600"
                  )}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Session Requests */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900 text-lg">Pending Requests</h2>
                <span className="badge-yellow">2 new</span>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingRequests.map((req) => {
                const action = requestActions[req.id];
                return (
                  <div key={req.id} className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold shrink-0">
                        {req.parent[0]}{req.child[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900">{req.child}</p>
                          <span className="text-gray-400 text-sm">via {req.parent}</span>
                          <span className="text-sm">{req.country}</span>
                          <span className={`badge text-xs ${req.type === "Demo" ? "badge-green" : "badge-blue"}`}>{req.type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{req.subject} · {req.grade}</p>
                        <p className="text-xs text-gray-400 mt-1">{req.date} · {req.time} · {req.duration}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {action === null ? (
                          <>
                            <button onClick={() => handleRequest(req.id, "rejected")} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all">
                              <XCircle size={15} /> Decline
                            </button>
                            <button onClick={() => handleRequest(req.id, "accepted")} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all">
                              <CheckCircle size={15} /> Accept
                            </button>
                          </>
                        ) : (
                          <span className={`badge ${action === "accepted" ? "badge-green" : "badge-red"}`}>
                            {action === "accepted" ? "✓ Accepted" : "✗ Declined"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming sessions */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="px-6 py-4 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {s.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{s.child} · {s.subject}</p>
                      <p className="text-xs text-gray-500">{s.time}</p>
                    </div>
                    <a href={s.zoomLink} className="flex items-center gap-1 bg-brand-blue text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90">
                      <Video size={12} /> Start
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly availability */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">This Week&apos;s Availability</h2>
                <Link href="/dashboard/tutor/availability" className="text-sm text-brand-blue hover:underline">Edit</Link>
              </div>
              <div className="p-5 space-y-2">
                {availabilitySlots.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-medium text-gray-500">{day.day}</span>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {day.slots.length > 0 ? (
                        day.slots.map((slot) => (
                          <span key={slot} className="badge badge-blue text-xs">{slot}</span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-300">No availability set</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

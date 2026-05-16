"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard, Calendar, BookOpen, CreditCard, Bell, User,
  LogOut, Video, Clock, ChevronRight, Star, TrendingUp, CheckCircle,
  XCircle, AlertCircle, Menu, X, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/parent", active: true },
  { icon: Calendar, label: "Upcoming Sessions", href: "/dashboard/parent/sessions" },
  { icon: BookOpen, label: "My Courses", href: "/dashboard/parent/courses" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/parent/payments" },
  { icon: Bell, label: "Notifications", href: "/dashboard/parent/notifications", badge: 3 },
  { icon: TrendingUp, label: "Child Progress", href: "/dashboard/parent/progress" },
  { icon: User, label: "Profile", href: "/dashboard/parent/profile" },
];

const upcomingSessions = [
  { id: 1, subject: "Mathematics", tutor: "Dr. Priya Sharma", date: "Today", time: "4:00 PM IST", duration: "60 min", status: "confirmed", initials: "PS", color: "from-blue-400 to-brand-blue", zoomLink: "#" },
  { id: 2, subject: "Physics", tutor: "Rahul Verma", date: "Tomorrow", time: "6:00 PM IST", duration: "60 min", status: "confirmed", initials: "RV", color: "from-purple-400 to-brand-purple", zoomLink: "#" },
  { id: 3, subject: "English", tutor: "Ananya Singh", date: "May 22", time: "5:00 PM IST", duration: "45 min", status: "pending", initials: "AS", color: "from-cyan-400 to-brand-cyan", zoomLink: null },
];

const notifications = [
  { id: 1, type: "confirmed", text: "Dr. Priya confirmed your session for today at 4:00 PM", time: "2h ago" },
  { id: 2, type: "payment", text: "Payment of $25 processed successfully for Math session", time: "1d ago" },
  { id: 3, type: "reminder", text: "Upcoming session with Rahul Verma tomorrow at 6 PM", time: "5h ago" },
];

const stats = [
  { label: "Total Sessions", value: "24", icon: Calendar, color: "blue", change: "+3 this month" },
  { label: "Hours Learned", value: "36h", icon: Clock, color: "purple", change: "+5h this week" },
  { label: "Courses Enrolled", value: "3", icon: BookOpen, color: "cyan", change: "Active" },
  { label: "Avg. Rating Given", value: "4.9", icon: Star, color: "yellow", change: "Excellent" },
];

export default function ParentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="relative w-10 h-10">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Zippy Minds</p>
            <p className="text-xs text-gray-400">Parent Portal</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, href, active, badge }) => (
            <Link
              key={href}
              href={href}
              className={active ? "sidebar-link-active" : "sidebar-link"}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">Parent Account</p>
            </div>
            <LogOut size={16} className="text-gray-400 shrink-0" />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Good afternoon, John! 👋</h1>
              <p className="text-xs text-gray-500">Your child&apos;s learning journey at a glance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-50 border border-gray-200">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link href="/book-demo" className="btn-primary text-sm py-2">
              <Plus size={16} /> Book Demo
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
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      stat.color === "blue" ? "bg-blue-50 text-brand-blue" :
                      stat.color === "purple" ? "bg-purple-50 text-brand-purple" :
                      stat.color === "cyan" ? "bg-cyan-50 text-brand-cyan" :
                      "bg-yellow-50 text-yellow-600"
                    )}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Upcoming sessions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-lg">Upcoming Sessions</h2>
              <Link href="/dashboard/parent/sessions" className="text-sm text-brand-blue hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center text-white font-bold shrink-0`}>
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{session.subject}</p>
                    <p className="text-sm text-gray-500">with {session.tutor}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{session.date} · {session.time} · {session.duration}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "badge text-xs",
                      session.status === "confirmed" ? "badge-green" : "badge-yellow"
                    )}>
                      {session.status === "confirmed" ? <CheckCircle size={11} className="inline mr-1" /> : <AlertCircle size={11} className="inline mr-1" />}
                      {session.status}
                    </span>
                    {session.status === "confirmed" && session.zoomLink && (
                      <a href={session.zoomLink} className="flex items-center gap-1 bg-brand-blue text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90">
                        <Video size={13} /> Join
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Notifications */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
                <span className="badge-red">3 new</span>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div key={n.id} className="px-6 py-4 flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      n.type === "confirmed" ? "bg-green-100" :
                      n.type === "payment" ? "bg-blue-100" : "bg-yellow-100"
                    )}>
                      {n.type === "confirmed" ? <CheckCircle size={14} className="text-green-600" /> :
                       n.type === "payment" ? <CreditCard size={14} className="text-blue-600" /> :
                       <Bell size={14} className="text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 text-lg">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: "Book New Demo", href: "/book-demo", color: "blue" },
                  { icon: BookOpen, label: "Browse Courses", href: "/courses", color: "purple" },
                  { icon: User, label: "Find Tutors", href: "/tutors", color: "cyan" },
                  { icon: CreditCard, label: "View Payments", href: "/dashboard/parent/payments", color: "green" },
                ].map(({ icon: Icon, label, href, color }) => (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed text-sm font-medium transition-all hover:border-solid hover:-translate-y-0.5",
                      color === "blue" ? "border-blue-200 text-brand-blue hover:bg-blue-50" :
                      color === "purple" ? "border-purple-200 text-brand-purple hover:bg-purple-50" :
                      color === "cyan" ? "border-cyan-200 text-brand-cyan hover:bg-cyan-50" :
                      "border-green-200 text-green-600 hover:bg-green-50"
                    )}
                  >
                    <Icon size={22} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

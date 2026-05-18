"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  BarChart3, Bell, Shield, LogOut, Menu, X, TrendingUp,
  CheckCircle, XCircle, Clock, DollarSign, Eye, Search,
  AlertTriangle, Settings, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin", active: true },
  { icon: Users, label: "Users", href: "/dashboard/admin/users" },
  { icon: GraduationCap, label: "Tutor Approvals", href: "/dashboard/admin/tutors", badge: 4 },
  { icon: BookOpen, label: "Courses", href: "/dashboard/admin/courses" },
  { icon: Calendar, label: "Sessions", href: "/dashboard/admin/sessions" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/admin/payments" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
  { icon: MessageSquare, label: "Support", href: "/dashboard/admin/support", badge: 7 },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
];

import { Calendar } from "lucide-react";

const platformStats = [
  { label: "Total Users", value: "12,450", icon: Users, color: "blue", change: "+234 this week" },
  { label: "Active Sessions", value: "1,284", icon: Clock, color: "purple", change: "+89 today" },
  { label: "Revenue (Month)", value: "₹38,50,000", icon: DollarSign, color: "green", change: "+₹3,35,000 vs last" },
  { label: "Tutor Approvals", value: "4 pending", icon: AlertTriangle, color: "yellow", change: "Action needed" },
];

const pendingTutors = [
  { id: 1, name: "Dr. Arun Mishra", subject: "Mathematics", exp: "5 years", location: "Lucknow", applied: "2 days ago", docs: true },
  { id: 2, name: "Pooja Nair", subject: "Biology", exp: "7 years", location: "Kochi", applied: "3 days ago", docs: true },
  { id: 3, name: "Suresh Patel", subject: "Economics", exp: "4 years", location: "Surat", applied: "1 day ago", docs: false },
  { id: 4, name: "Lakshmi Iyer", subject: "English", exp: "9 years", location: "Coimbatore", applied: "5 days ago", docs: true },
];

const recentTransactions = [
  { id: 1, parent: "Sarah M.", tutor: "Dr. Priya S.", amount: 1999, subject: "Mathematics", status: "success", date: "May 19" },
  { id: 2, parent: "James A.", tutor: "Rahul V.", amount: 1799, subject: "Physics", status: "success", date: "May 19" },
  { id: 3, parent: "Emily C.", tutor: "Dr. Meera P.", amount: 1799, subject: "Biology", status: "refunded", date: "May 18" },
  { id: 4, parent: "Mohammed A.", tutor: "Dr. Vikram N.", amount: 2299, subject: "Chemistry", status: "success", date: "May 18" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tutorActions, setTutorActions] = useState<Record<number, "approved" | "rejected" | null>>({ 1: null, 2: null, 3: null, 4: null });

  const handleTutor = (id: number, action: "approved" | "rejected") => {
    setTutorActions((prev) => ({ ...prev, [id]: action }));
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="relative w-10 h-10">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Zippy Minds</p>
            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
              <Shield size={10} /> Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarLinks.map(({ icon: Icon, label, href, active, badge }) => (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer",
              active
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">Super Admin</p>
            </div>
            <LogOut size={16} className="text-gray-500 shrink-0" />
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface-container">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-bold text-on-surface flex items-center gap-2">
                <Shield size={18} className="text-error" /> Platform Overview
              </h1>
              <p className="text-xs text-on-surface-variant">Real-time admin dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input type="text" placeholder="Search users, sessions..." className="input-field pl-9 py-2 w-64 text-sm" />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-surface-container border border-outline-variant/30">
              <Bell size={18} className="text-on-surface-variant" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="stat-card">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    stat.color === "blue" ? "bg-primary/10 text-primary" :
                    stat.color === "purple" ? "bg-tertiary-fixed/50 text-tertiary" :
                    stat.color === "green" ? "bg-green-50 text-green-600" :
                    "bg-secondary-container/30 text-secondary"
                  )}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                  <p className={`text-xs mt-1 ${stat.color === "yellow" ? "text-secondary" : "text-green-600"}`}>{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Tutor Approvals */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-on-surface text-lg">Pending Tutor Approvals</h2>
                <span className="badge-yellow">4 pending</span>
              </div>
              <Link href="/dashboard/admin/tutors" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tutor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pendingTutors.map((tutor) => {
                    const action = tutorActions[tutor.id];
                    return (
                      <tr key={tutor.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-white font-bold text-sm">
                              {tutor.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface text-sm">{tutor.name}</p>
                              <p className="text-xs text-on-surface-variant">{tutor.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{tutor.subject}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{tutor.exp}</td>
                        <td className="px-6 py-4">
                          <span className={`badge text-xs ${tutor.docs ? "badge-green" : "badge-red"}`}>
                            {tutor.docs ? "✓ Complete" : "✗ Missing"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{tutor.applied}</td>
                        <td className="px-6 py-4">
                          {action === null ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleTutor(tutor.id, "rejected")} className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                                <XCircle size={16} />
                              </button>
                              <button onClick={() => handleTutor(tutor.id, "approved")} className="p-1.5 rounded-lg border border-green-200 text-green-500 hover:bg-green-50">
                                <CheckCircle size={16} />
                              </button>
                              <button className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container">
                                <Eye size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className={`badge text-xs ${action === "approved" ? "badge-green" : "badge-red"}`}>
                              {action === "approved" ? "✓ Approved" : "✗ Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-card">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
              <h2 className="font-bold text-on-surface text-lg">Recent Transactions</h2>
              <Link href="/dashboard/admin/payments" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Parent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Tutor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">{tx.parent}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.tutor}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.subject}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">₹{tx.amount}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`badge text-xs ${tx.status === "success" ? "badge-green" : "badge-red"}`}>
                          {tx.status === "success" ? "✓ Success" : "↩ Refunded"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

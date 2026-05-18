"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, ChevronRight, Plus, Settings, LogOut, LayoutDashboard,
  Calendar, BookOpen, CreditCard, HelpCircle, CheckCircle,
  Video, Clock, Flame, Trophy, Target, TrendingUp, PlayCircle,
  FileText, Download, BookMarked, BarChart2, ChevronLeft,
  Zap, Bell, Menu, X, RefreshCw,
} from "lucide-react";

type Section = "dashboard" | "schedule" | "learning";

interface Booking {
  id: string; childName: string; subject: string; tutorName: string;
  date: string; timeSlot: string; status: string; monthlyPrice: number;
  zoomLink?: string | null; notes?: string; createdAt?: string;
}
interface UserInfo { name: string; email: string; role: string; }

// ── Learning resources data ─────────────────────────────────────────────────
const subjectProgress = [
  { subject: "Phonics",         progress: 65, color: "from-pink-400 to-rose-500",     sessions: 8,  icon: "🔤" },
  { subject: "Mathematics",     progress: 48, color: "from-purple-400 to-purple-600", sessions: 5,  icon: "🔢" },
  { subject: "English Grammar", progress: 80, color: "from-blue-400 to-blue-600",     sessions: 12, icon: "📝" },
  { subject: "Science",         progress: 30, color: "from-green-400 to-emerald-500", sessions: 3,  icon: "🔬" },
];

const resources = [
  { title: "Phonics Workbook — Level 1",      type: "PDF",   subject: "Phonics",         size: "2.4 MB", icon: "📄" },
  { title: "Number Patterns Practice Sheet",   type: "PDF",   subject: "Mathematics",     size: "1.1 MB", icon: "📄" },
  { title: "Grammar Rules Cheat Sheet",        type: "PDF",   subject: "English Grammar", size: "0.8 MB", icon: "📄" },
  { title: "Reading Comprehension Pack",       type: "PDF",   subject: "English Grammar", size: "3.2 MB", icon: "📄" },
  { title: "Science Experiments at Home",      type: "PDF",   subject: "Science",         size: "1.7 MB", icon: "📄" },
  { title: "Multiplication Tables Poster",     type: "Image", subject: "Mathematics",     size: "0.5 MB", icon: "🖼️" },
];

const videoLessons = [
  { title: "Introduction to Letter Sounds",   subject: "Phonics",         duration: "12:30", thumbnail: "🔤", views: "2.1k" },
  { title: "Blending CVC Words",              subject: "Phonics",         duration: "15:45", thumbnail: "🔤", views: "1.8k" },
  { title: "Place Value Explained Simply",    subject: "Mathematics",     duration: "18:20", thumbnail: "🔢", views: "3.4k" },
  { title: "Parts of Speech — Fun Way",       subject: "English Grammar", duration: "14:10", thumbnail: "📝", views: "2.7k" },
  { title: "Solar System for Kids",           subject: "Science",         duration: "20:00", thumbnail: "🔬", views: "4.1k" },
  { title: "Creative Story Writing Tips",     subject: "English Grammar", duration: "11:55", thumbnail: "✍️", views: "1.5k" },
];

const achievements = [
  { title: "First Session",   icon: "🎯", desc: "Completed your first demo",   earned: true  },
  { title: "Quick Learner",   icon: "⚡", desc: "5 sessions in one week",       earned: true  },
  { title: "Star Student",    icon: "⭐", desc: "10 sessions completed",        earned: false },
  { title: "Consistent",      icon: "🔥", desc: "7-day streak",                 earned: false },
  { title: "Subject Master",  icon: "🏆", desc: "Complete a full subject path", earned: false },
  { title: "Reading Champ",   icon: "📚", desc: "Read 5 resource PDFs",         earned: false },
];

const assignments = [
  { title: "Phonics Worksheet — Set A",  subject: "Phonics",     due: "Tomorrow",  status: "pending"  },
  { title: "Counting to 100 — Practice", subject: "Mathematics", due: "In 3 days", status: "pending"  },
  { title: "Write a Short Paragraph",    subject: "English",     due: "Completed",  status: "done"     },
  { title: "Name 5 Animals with Sounds", subject: "Phonics",     due: "Completed",  status: "done"     },
];

export default function ParentDashboard() {
  const router = useRouter();
  const [section, setSection]       = useState<Section>("dashboard");
  const [user, setUser]             = useState<UserInfo | null>(null);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("All");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/bookings").then(r => r.json()),
    ]).then(([userData, bookingData]) => {
      if (userData.user)      setUser(userData.user);
      if (bookingData.bookings) setBookings(bookingData.bookings);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const upcomingBookings = bookings.filter(b => b.status !== "CANCELLED");
  const nextSession      = upcomingBookings[0] ?? null;
  const totalSessions    = bookings.length;
  const confirmedSessions = bookings.filter(b => b.status === "CONFIRMED").length;

  const navItems = [
    { id: "dashboard" as Section, icon: LayoutDashboard, label: "Dashboard"      },
    { id: "schedule"  as Section, icon: Calendar,        label: "Schedule"       },
    { id: "learning"  as Section, icon: BookOpen,        label: "Learning Center"},
    { id: null,                   icon: CreditCard,      label: "Payments"       },
    { id: null,                   icon: HelpCircle,      label: "Support"        },
  ];

  const SidebarContent = () => (
    <>
      <div className="px-6 mb-6 mt-2">
        <h1 className="font-display font-bold text-primary text-lg leading-none">{user?.name ?? "Explorer"}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">{user?.email ?? "Parent Account"}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <Flame size={13} className="text-orange-500" />
          <span className="text-xs font-semibold text-on-surface-variant">3 day streak 🔥</span>
        </div>
      </div>

      <nav className="flex flex-col flex-grow gap-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === section;
          const isDisabled = item.id === null;
          if (isDisabled) {
            return (
              <span key={item.label} className="sidebar-link opacity-40 cursor-not-allowed select-none">
                <Icon size={18} /><span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-surface-container px-1.5 py-0.5 rounded-full">Soon</span>
              </span>
            );
          }
          return (
            <button key={item.label} onClick={() => { setSection(item.id!); setSidebarOpen(false); }}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}>
              <Icon size={18} /><span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 space-y-1">
        <Link href="/book-demo"
          className="w-full bg-primary text-on-primary font-bold rounded-full py-3 shadow-md flex items-center justify-center gap-2 text-sm hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Book New Session
        </Link>
        <button className="sidebar-link w-full text-left"><Settings size={18} /> Settings</button>
        <button onClick={handleLogout} className="sidebar-link w-full text-left"><LogOut size={18} /> Sign Out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant py-6 gap-1 z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface-container-low flex flex-col py-6 gap-1 shadow-xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-on-surface-variant">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-grow lg:ml-64 px-4 md:px-8 lg:px-10 py-6 min-h-screen">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-surface-container border border-outline-variant">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-primary text-base">
            {section === "dashboard" ? "Dashboard" : section === "schedule" ? "Schedule" : "Learning Center"}
          </span>
          <button className="p-2 rounded-xl bg-surface-container border border-outline-variant">
            <Bell size={18} />
          </button>
        </div>

        {/* ══════════════════════════════════════════
            SECTION: DASHBOARD OVERVIEW
        ══════════════════════════════════════════ */}
        {section === "dashboard" && (
          <div className="space-y-6">
            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
                  Welcome back, {user?.name?.split(" ")[0] ?? "Explorer"} 👋
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <Link href="/book-demo" className="btn-primary self-start sm:self-auto whitespace-nowrap">
                <Plus size={16} /> Book Demo
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Sessions",    value: totalSessions,      icon: Calendar,   color: "text-primary",    bg: "bg-primary/10"      },
                { label: "Confirmed",         value: confirmedSessions,  icon: CheckCircle,color: "text-green-600",  bg: "bg-green-50"        },
                { label: "Streak",            value: "3 days 🔥",        icon: Flame,      color: "text-orange-500", bg: "bg-orange-50"       },
                { label: "Subjects Active",   value: subjectProgress.length, icon: BookOpen,color: "text-purple-600", bg: "bg-purple-50"    },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-card">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-2xl font-bold text-on-surface font-display">{value}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Next session + progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Next session */}
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> Next Session
                </h3>
                {nextSession ? (
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-on-surface">{nextSession.subject}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          nextSession.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>{nextSession.status}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">👤 {nextSession.tutorName}</p>
                      <p className="text-sm text-on-surface-variant">👦 {nextSession.childName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant mt-1">
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" /> {nextSession.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} className="text-primary" /> {nextSession.timeSlot}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      {nextSession.zoomLink ? (
                        <a href={nextSession.zoomLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                          style={{ backgroundColor: "#2D8CFF" }}>
                          <Video size={15} /> Join Zoom
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                          <Clock size={15} /> Link Pending
                        </span>
                      )}
                      <button onClick={() => setSection("schedule")}
                        className="text-xs text-primary hover:underline flex items-center gap-1">
                        View all sessions <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 text-2xl">📅</div>
                    <p className="font-semibold text-on-surface mb-1">No sessions yet</p>
                    <p className="text-sm text-on-surface-variant mb-4">Book your free demo to get started!</p>
                    <Link href="/book-demo" className="btn-primary text-sm px-6 py-2.5">Book Free Demo</Link>
                  </div>
                )}
              </div>

              {/* Quick learning progress */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Progress
                </h3>
                <div className="space-y-4">
                  {subjectProgress.slice(0, 3).map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-on-surface">{s.icon} {s.subject}</span>
                        <span className="text-xs font-bold text-primary">{s.progress}%</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all`}
                          style={{ width: `${s.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSection("learning")}
                  className="mt-4 text-xs text-primary hover:underline flex items-center gap-1">
                  Full Learning Center <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* All bookings list */}
            {bookings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                    <Video size={18} className="text-primary" /> Your Sessions
                  </h3>
                  <button onClick={() => setSection("schedule")} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.slice(0, 3).map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Book Session",    icon: Plus,        color: "bg-primary/10 text-primary",       action: () => router.push("/book-demo") },
                { label: "My Schedule",     icon: Calendar,    color: "bg-blue-50 text-blue-600",          action: () => setSection("schedule")   },
                { label: "Study Materials", icon: BookOpen,    color: "bg-purple-50 text-purple-600",      action: () => setSection("learning")   },
                { label: "My Progress",     icon: BarChart2,   color: "bg-green-50 text-green-600",        action: () => setSection("learning")   },
              ].map(({ label, icon: Icon, color, action }) => (
                <button key={label} onClick={action}
                  className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-center">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: SCHEDULE
        ══════════════════════════════════════════ */}
        {section === "schedule" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">My Schedule</h2>
                <p className="text-sm text-on-surface-variant mt-1">All your booked and upcoming sessions</p>
              </div>
              <Link href="/book-demo" className="btn-primary self-start sm:self-auto whitespace-nowrap">
                <Plus size={16} /> Book New Session
              </Link>
            </div>

            {/* Weekly overview strip */}
            <WeekStrip bookings={bookings} />

            {/* Upcoming sessions */}
            <div>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <Zap size={16} className="text-primary" /> Upcoming Sessions
              </h3>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="No sessions booked yet"
                  desc="Book a free demo session to get started!"
                  action={<Link href="/book-demo" className="btn-primary text-sm px-6 py-2.5">Book Free Demo</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <ScheduleRow key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>

            {/* Past / all sessions */}
            {bookings.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-on-surface-variant" /> Session History
                </h3>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Subject</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Student</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Tutor</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Time</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id} className={`border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors ${i === bookings.length - 1 ? "border-b-0" : ""}`}>
                          <td className="px-5 py-4 font-semibold text-on-surface">{b.subject}</td>
                          <td className="px-5 py-4 text-on-surface-variant hidden sm:table-cell">{b.childName}</td>
                          <td className="px-5 py-4 text-on-surface-variant hidden md:table-cell">{b.tutorName}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{b.date}</td>
                          <td className="px-5 py-4 text-on-surface-variant hidden sm:table-cell">{b.timeSlot}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                              b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700" :
                                                         "bg-surface-container text-on-surface-variant"
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            {b.zoomLink && (
                              <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex items-center gap-1 whitespace-nowrap"
                                style={{ backgroundColor: "#2D8CFF" }}>
                                <Video size={11} /> Join
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Pro Tip</h4>
                <p className="text-sm text-on-surface-variant">
                  Regular sessions 3–4 times a week show the best results.
                  Book recurring slots from your tutor to lock in the best times!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: LEARNING CENTER
        ══════════════════════════════════════════ */}
        {section === "learning" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">Learning Center</h2>
                <p className="text-sm text-on-surface-variant mt-1">Track progress, access resources &amp; grow every day</p>
              </div>
              <div className="flex items-center gap-2 text-sm bg-secondary-container/20 border border-secondary-container/40 rounded-full px-4 py-2">
                <Flame size={15} className="text-orange-500" /> <span className="font-semibold text-on-surface">3 day streak!</span>
              </div>
            </div>

            {/* Subject Progress */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <Target size={18} className="text-primary" /> Subject Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjectProgress.map((s) => (
                  <div key={s.subject} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>
                      {s.icon}
                    </div>
                    <p className="font-bold text-on-surface text-sm mb-1">{s.subject}</p>
                    <p className="text-xs text-on-surface-variant mb-3">{s.sessions} sessions completed</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                          style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-on-surface shrink-0">{s.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Assignments */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Assignments &amp; Homework
              </h3>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
                {assignments.map((a, i) => (
                  <div key={a.title} className={`flex items-center gap-4 px-5 py-4 ${i < assignments.length - 1 ? "border-b border-outline-variant/50" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      a.status === "done" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {a.status === "done" ? <CheckCircle size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${a.status === "done" ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                        {a.title}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{a.subject}</p>
                    </div>
                    <span className={`text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full ${
                      a.status === "done"
                        ? "bg-green-100 text-green-600"
                        : a.due === "Tomorrow" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                    }`}>{a.due}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Study Resources */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                  <BookMarked size={18} className="text-primary" /> Study Resources
                </h3>
                {/* Subject filter */}
                <div className="flex gap-2 overflow-x-auto">
                  {["All", "Phonics", "Mathematics", "English Grammar", "Science"].map((f) => (
                    <button key={f} onClick={() => setSubjectFilter(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                        subjectFilter === f
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                      }`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources
                  .filter(r => subjectFilter === "All" || r.subject === subjectFilter)
                  .map((r) => (
                  <div key={r.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface leading-snug">{r.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{r.subject} · {r.type} · {r.size}</p>
                    </div>
                    <button className="shrink-0 p-2 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all">
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Video Lessons */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <PlayCircle size={18} className="text-primary" /> Video Lessons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoLessons
                  .filter(v => subjectFilter === "All" || v.subject === subjectFilter)
                  .map((v) => (
                  <div key={v.title} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden hover:shadow-card-hover transition-shadow group cursor-pointer">
                    {/* Thumbnail */}
                    <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                      <span className="text-5xl">{v.thumbnail}</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                          <PlayCircle size={24} className="text-primary" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                        {v.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-on-surface leading-snug">{v.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-on-surface-variant">{v.subject}</span>
                        <span className="text-xs text-on-surface-variant">{v.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-primary" /> Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {achievements.map((a) => (
                  <div key={a.title} className={`rounded-2xl border p-4 text-center transition-all ${
                    a.earned
                      ? "bg-secondary-container/20 border-secondary-container/50 shadow-card"
                      : "bg-surface-container border-outline-variant opacity-50"
                  }`}>
                    <div className={`text-3xl mb-2 ${!a.earned ? "grayscale" : ""}`}>{a.icon}</div>
                    <p className="text-xs font-bold text-on-surface">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">{a.desc}</p>
                    {a.earned && <p className="text-[10px] font-bold text-primary mt-1">Earned! ✓</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Daily tip */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary-container/10 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
              <div className="text-3xl">🌟</div>
              <div>
                <h4 className="font-bold text-on-surface mb-1">Today&apos;s Learning Tip</h4>
                <p className="text-sm text-on-surface-variant">
                  Practice phonics for just <strong>10 minutes daily</strong> — consistency beats long sessions.
                  Try reading 3 new words with your child tonight before bedtime!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function BookingCard({ booking: b }: { booking: Booking }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-on-surface text-sm">{b.subject}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">for {b.childName}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
          b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700" : "bg-surface-container text-on-surface-variant"
        }`}>{b.status}</span>
      </div>
      <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
        <div className="flex items-center gap-2"><Calendar size={12} className="text-primary" /> {b.date}</div>
        <div className="flex items-center gap-2"><Clock size={12} className="text-primary" /> {b.timeSlot}</div>
        <div className="flex items-center gap-2"><Video size={12} className="text-primary" /> {b.tutorName}</div>
      </div>
      {b.zoomLink ? (
        <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-bold text-xs py-2.5 rounded-xl transition-all text-white hover:opacity-90"
          style={{ backgroundColor: "#2D8CFF" }}>
          <Video size={14} /> Join Zoom Session
        </a>
      ) : (
        <div className="flex items-center justify-center gap-2 w-full bg-surface-container text-on-surface-variant text-xs py-2.5 rounded-xl border border-outline-variant">
          <Clock size={13} /> Zoom link pending
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ booking: b }: { booking: Booking }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Date badge */}
      <div className="bg-primary/10 rounded-xl px-4 py-3 text-center min-w-[70px] shrink-0">
        <p className="text-[10px] font-bold text-primary uppercase tracking-wide">
          {b.date.split(" ")[0]}
        </p>
        <p className="text-2xl font-extrabold text-primary leading-none">
          {b.date.split(" ")[1]?.replace(",", "") ?? "--"}
        </p>
        <p className="text-[10px] text-primary/70 font-medium">
          {b.date.split(" ")[2] ?? ""}
        </p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-on-surface">{b.subject}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
            b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700" : "bg-surface-container text-on-surface-variant"
          }`}>{b.status}</span>
        </div>
        <p className="text-sm text-on-surface-variant">👤 {b.tutorName} &nbsp;·&nbsp; 👦 {b.childName}</p>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
          <Clock size={11} className="text-primary" /> {b.timeSlot} &nbsp;·&nbsp; FREE Demo (30 min)
        </p>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {b.zoomLink ? (
          <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#2D8CFF" }}>
            <Video size={15} /> Join Zoom
          </a>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container text-on-surface-variant border border-outline-variant">
            <Clock size={14} /> Pending
          </div>
        )}
      </div>
    </div>
  );
}

function WeekStrip({ bookings }: { bookings: Booking[] }) {
  const today   = new Date();
  const days    = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const DAY  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MON  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-on-surface text-sm flex items-center gap-2">
          <Calendar size={15} className="text-primary" /> This Week
        </h3>
        <span className="text-xs text-on-surface-variant">
          {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const label = `${MON[d.getMonth()]} ${d.getDate()}`;
          const hasSession = bookings.some(b => b.date.includes(String(d.getDate())) && b.date.includes(MON[d.getMonth()]));
          const isToday = i === 0;
          return (
            <div key={i} className={`flex flex-col items-center p-2 rounded-xl text-center ${
              isToday ? "bg-primary text-on-primary" :
              hasSession ? "bg-secondary-container/30 border border-secondary-container" :
              "bg-surface-container"
            }`}>
              <span className="text-[10px] font-bold uppercase">{DAY[d.getDay()]}</span>
              <span className="text-base font-extrabold mt-0.5">{d.getDate()}</span>
              <span className="text-[9px] mt-0.5 opacity-70">{MON[d.getMonth()]}</span>
              {hasSession && !isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
              {isToday && <div className="w-1.5 h-1.5 rounded-full bg-on-primary/60 mt-1" />}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-on-surface-variant mt-3 text-center flex items-center justify-center gap-2">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-container inline-block border border-secondary-container" /> Has session</span>
      </p>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="font-bold text-on-surface mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant mb-5 max-w-xs">{desc}</p>
      {action}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, ChevronRight, Plus, Settings, LogOut, LayoutDashboard,
  Calendar, BookOpen, CreditCard, HelpCircle, CheckCircle,
  Video, Clock, Flame, Trophy, Target, TrendingUp, PlayCircle,
  FileText, Download, BookMarked, BarChart2, ChevronDown,
  Zap, Bell, Menu, X, User, Phone, Mail, IndianRupee,
  MessageSquare, Send, AlertCircle, ChevronLeft, RefreshCw,
  Lock, Unlock, XCircle, FolderOpen, ExternalLink,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Section = "dashboard" | "schedule" | "learning" | "payments" | "support";

interface Booking {
  id: string; childName: string; subject: string; tutorName: string;
  date: string; timeSlot: string; status: string; monthlyPrice: number;
  zoomLink?: string | null; notes?: string; createdAt?: string;
  parentName?: string; parentEmail?: string;
}

interface UserInfo {
  id: string; name: string; email: string; phone?: string | null;
  role: string; createdAt?: string;
}

interface Ticket {
  id: string; subject: string; message: string; priority: string;
  status: string; reply?: string | null; createdAt: string;
}

/* ─── Enrollment & Payment types ────────────────────────────────────────── */

interface ParentPayment {
  id: string; childName: string; courseName: string; amount: number;
  currency: string; gateway: string; status: string; createdAt: string;
}

interface ParentEnrollment {
  id: string; childName: string; subject: string; courseName: string;
  dayOfWeek: string; timeSlot: string; timezone: string;
  startDate: string; endDate: string; totalSessions: number; status: string;
  createdAt: string;
  sessions: { id: string; date: string; status: string; zoomLink?: string | null }[];
}

/* ─── DB-backed content types ───────────────────────────────────────────── */

interface Resource {
  id: string; title: string; type: string; subject: string;
  size: string; icon: string; url: string; status: string;
}

interface VideoLesson {
  id: string; title: string; subject: string; duration: string;
  thumbnail: string; videoUrl: string; views: number; status: string;
}

interface TutorMaterial {
  id: string; tutorName: string; studentName: string; subject: string;
  title: string; fileUrl: string; fileType: string; fileSize: string;
  notes: string; visibility: string; createdAt: string;
}

interface TRecording {
  id: string; title: string; description: string; subject: string;
  studentName: string; tutorName: string; videoUrl: string;
  duration: string; uploadedByRole: string; visibility: string; createdAt: string;
}

const FAQS = [
  { q: "How do I join my Zoom session?",           a: "Click the 'Join Zoom' button next to your confirmed session. The link is active 10 minutes before the session starts." },
  { q: "Can I reschedule a booking?",              a: "Yes! Please contact support at least 24 hours before your session and we'll arrange a new slot with your tutor." },
  { q: "How long is a demo session?",              a: "Free demo sessions are 30 minutes. Regular sessions are 60 minutes." },
  { q: "What subjects do you teach?",              a: "We offer Phonics, Mathematics, English Grammar, Science, and many more subjects for KG to Grade 8." },
  { q: "How do I track my child's progress?",      a: "Visit the Learning Center section to see subject-by-subject progress tracked from your session history." },
  { q: "What if my tutor doesn't show up?",        a: "Raise a support ticket immediately and we'll reschedule at no cost and apply a credit to your account." },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function getSubjectStyle(subject: string) {
  const map: Record<string, { color: string; bg: string; gradient: string; icon: string }> = {
    "Phonics":         { color: "text-pink-600",   bg: "bg-pink-50",   gradient: "from-pink-400 to-rose-500",     icon: "🔤" },
    "Mathematics":     { color: "text-purple-600", bg: "bg-purple-50", gradient: "from-purple-400 to-purple-600", icon: "🔢" },
    "English Grammar": { color: "text-blue-600",   bg: "bg-blue-50",   gradient: "from-blue-400 to-blue-600",     icon: "📝" },
    "Science":         { color: "text-green-600",  bg: "bg-green-50",  gradient: "from-green-400 to-emerald-500", icon: "🔬" },
  };
  return map[subject] ?? { color: "text-orange-600", bg: "bg-orange-50", gradient: "from-orange-400 to-amber-500", icon: "📚" };
}

function calculateStreak(bookings: Booking[]): number {
  const confirmed = bookings.filter(b => b.status === "CONFIRMED");
  if (!confirmed.length) return 0;
  const parsed = confirmed.map(b => {
    const d = new Date(b.date);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }).filter(Boolean) as number[];
  if (!parsed.length) return 0;
  const unique = [...new Set(parsed)].sort((a, b) => b - a);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0; let cur = today.getTime();
  for (const ts of unique) {
    if (ts === cur) { streak++; cur -= 86400000; }
    else if (ts < cur) break;
  }
  return streak;
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */

export default function ParentDashboard() {
  const router = useRouter();

  /* ── State ── */
  const [section, setSection]         = useState<Section>("dashboard");
  const [user, setUser]               = useState<UserInfo | null>(null);
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [tickets, setTickets]         = useState<Ticket[]>([]);
  const [resources, setResources]         = useState<Resource[]>([]);
  const [videos, setVideos]               = useState<VideoLesson[]>([]);
  const [tutorMaterials, setTutorMaterials] = useState<TutorMaterial[]>([]);
  const [recordings, setRecordings]         = useState<TRecording[]>([]);
  const [parentPayments, setParentPayments]   = useState<ParentPayment[]>([]);
  const [parentEnrollments, setParentEnrollments] = useState<ParentEnrollment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Schedule filters
  const [scheduleTab, setScheduleTab] = useState<"upcoming" | "confirmed" | "cancelled">("upcoming");

  // Learning
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Cancel booking
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Real-time refresh toast
  const [liveToast, setLiveToast] = useState<{ subject: string; tutorName: string } | null>(null);

  // Support form
  const [ticketForm, setTicketForm]     = useState({ subject: "", message: "", priority: "medium" });
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketDone, setTicketDone]     = useState(false);
  const [ticketError, setTicketError]   = useState("");
  const [supportTab, setSupportTab]     = useState<"new" | "history" | "faq">("new");
  const [expandedFaq, setExpandedFaq]   = useState<number | null>(null);

  // Profile modal
  const [profileOpen, setProfileOpen]   = useState(false);
  const [profileForm, setProfileForm]   = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]     = useState("");

  /* ── Data loading ── */
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/profile").then(r => r.json()),
      fetch("/api/bookings").then(r => r.json()),
      fetch("/api/parent/support").then(r => r.json()),
      fetch("/api/parent/resources").then(r => r.json()),
      fetch("/api/parent/videos").then(r => r.json()),
      fetch("/api/parent/materials").then(r => r.json()),
      fetch("/api/recordings").then(r => r.json()),
      fetch("/api/enrollments").then(r => r.json()).catch(() => ({})),
      fetch("/api/parent/payments").then(r => r.json()).catch(() => ({})),
    ]).then(([profileData, bookingData, ticketData, resourceData, videoData, matData, recData, enrData, payData]) => {
      if (!profileData.user) { router.push("/auth/login"); return; }
      // Role guard — redirect tutors/admins to their correct dashboard
      if (profileData.user.role === "TUTOR") { router.push("/dashboard/tutor"); return; }
      if (profileData.user.role === "ADMIN") { router.push("/dashboard/admin"); return; }
      setUser(profileData.user);
      setProfileForm({ name: profileData.user.name ?? "", phone: profileData.user.phone ?? "" });
      if (bookingData.bookings)           setBookings(bookingData.bookings);
      if (ticketData.tickets)             setTickets(ticketData.tickets);
      if (resourceData.resources)         setResources(resourceData.resources);
      if (videoData.videos)               setVideos(videoData.videos);
      if (matData.materials)              setTutorMaterials(matData.materials);
      if (recData.recordings)             setRecordings(recData.recordings);
      if (enrData.enrollments)            setParentEnrollments(enrData.enrollments);
      if (payData.payments)               setParentPayments(payData.payments);
    }).catch(() => {
      router.push("/auth/login");
    }).finally(() => setLoading(false));
  }, [router]);

  /* ── Real-time polling: re-fetch bookings every 15 s ── */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) return;
        const data = await res.json();
        if (!data.bookings) return;
        const fresh: Booking[] = data.bookings;
        setBookings(prev => {
          // Detect any booking that just moved to CONFIRMED
          const newlyConfirmed = fresh.filter(fb =>
            fb.status === "CONFIRMED" &&
            prev.find(pb => pb.id === fb.id && pb.status !== "CONFIRMED")
          );
          if (newlyConfirmed.length > 0) {
            const b = newlyConfirmed[0];
            setLiveToast({ subject: b.subject, tutorName: b.tutorName });
            setTimeout(() => setLiveToast(null), 7000);
          }
          return fresh;
        });
      } catch {/* silent */}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ── Derived data ── */
  const totalSessions     = bookings.length;
  const confirmedSessions = bookings.filter(b => b.status === "CONFIRMED").length;
  const streak            = useMemo(() => calculateStreak(bookings), [bookings]);
  const nextSession       = bookings.find(b => b.status !== "CANCELLED") ?? null;

  // Subject breakdown from real bookings
  const subjectMap = useMemo(() =>
    bookings.reduce((acc, b) => {
      acc[b.subject] = (acc[b.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  [bookings]);

  const subjectData = useMemo(() =>
    Object.entries(subjectMap)
      .sort((a, b) => b[1] - a[1])
      .map(([subject, count]) => ({
        subject, sessions: count,
        progress: Math.min(Math.round((count / 20) * 100), 100),
        ...getSubjectStyle(subject),
      })),
  [subjectMap]);

  // Achievements from real data
  const achievements = useMemo(() => [
    { title: "First Session",  icon: "🎯", desc: "Completed your first booking",       earned: totalSessions >= 1 },
    { title: "Quick Learner",  icon: "⚡", desc: "5 sessions booked",                  earned: totalSessions >= 5 },
    { title: "Star Student",   icon: "⭐", desc: "10 confirmed sessions",              earned: confirmedSessions >= 10 },
    { title: "On Fire!",       icon: "🔥", desc: "3+ day active streak",               earned: streak >= 3 },
    { title: "Subject Master", icon: "🏆", desc: "20 sessions in one subject",         earned: Object.values(subjectMap).some(v => v >= 20) },
    { title: "Explorer",       icon: "🌍", desc: "Tried 3 or more subjects",           earned: Object.keys(subjectMap).length >= 3 },
  ], [totalSessions, confirmedSessions, streak, subjectMap]);

  // Schedule filtered lists
  const filteredBookings = useMemo(() => {
    if (scheduleTab === "upcoming")  return bookings.filter(b => b.status !== "CANCELLED");
    if (scheduleTab === "confirmed") return bookings.filter(b => b.status === "CONFIRMED");
    return bookings.filter(b => b.status === "CANCELLED");
  }, [bookings, scheduleTab]);


  /* ── Handlers ── */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "CANCELLED" }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b));
      }
    } finally {
      setCancellingId(null);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setTicketError("Please fill in subject and message.");
      return;
    }
    setTicketSending(true); setTicketError("");
    try {
      const res = await fetch("/api/parent/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setTickets(prev => [data.ticket, ...prev]);
        setTicketForm({ subject: "", message: "", priority: "medium" });
        setTicketDone(true);
        setSupportTab("history");
        setTimeout(() => setTicketDone(false), 4000);
      } else {
        setTicketError(data.error ?? "Failed to submit ticket.");
      }
    } catch {
      setTicketError("Network error. Please try again.");
    } finally {
      setTicketSending(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => { setProfileMsg(""); setProfileOpen(false); }, 1800);
      } else {
        setProfileMsg(data.error ?? "Failed to update.");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Nav items ── */
  const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"       },
    { id: "schedule",  icon: Calendar,        label: "Schedule"        },
    { id: "learning",  icon: BookOpen,        label: "Learning Center" },
    { id: "payments",  icon: CreditCard,      label: "Payments"        },
    { id: "support",   icon: HelpCircle,      label: "Support"         },
  ];

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <>
      <div className="px-6 mb-6 mt-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl mb-3">
          {user?.name?.[0]?.toUpperCase() ?? "P"}
        </div>
        <h1 className="font-display font-bold text-primary text-lg leading-none">{user?.name ?? "Parent"}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user?.email ?? ""}</p>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Flame size={13} className="text-orange-500" />
            <span className="text-xs font-semibold text-on-surface-variant">{streak} day streak 🔥</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col flex-grow gap-0.5 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id === section;
          return (
            <button key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}>
              <Icon size={18} /><span>{item.label}</span>
              {item.id === "support" && tickets.some(t => t.status === "open" && t.reply) && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 space-y-1">
        <Link href="/book-demo"
          className="w-full bg-primary text-on-primary font-bold rounded-full py-3 shadow-md flex items-center justify-center gap-2 text-sm hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Book New Session
        </Link>
        <button onClick={() => { setProfileOpen(true); setSidebarOpen(false); }}
          className="sidebar-link w-full text-left"><Settings size={18} /> Edit Profile</button>
        <button onClick={handleLogout} className="sidebar-link w-full text-left"><LogOut size={18} /> Sign Out</button>
      </div>
    </>
  );

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Live confirmation toast ── */}
      {liveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl max-w-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Session Confirmed! 🎉</p>
              <p className="text-xs text-green-100 truncate">
                {liveToast.subject} with {liveToast.tutorName}
              </p>
            </div>
            <button onClick={() => setLiveToast(null)} className="text-white/70 hover:text-white shrink-0 ml-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
            {navItems.find(n => n.id === section)?.label ?? "Dashboard"}
          </span>
          <button onClick={() => setProfileOpen(true)} className="p-2 rounded-xl bg-surface-container border border-outline-variant">
            <User size={18} />
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
                <Plus size={16} /> Book Session
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Sessions",  value: totalSessions,             icon: Calendar,    color: "text-primary",    bg: "bg-primary/10"      },
                { label: "Confirmed",        value: confirmedSessions,          icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50"        },
                { label: "Day Streak",       value: streak > 0 ? `${streak} 🔥` : "–", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                { label: "Subjects Active",  value: Object.keys(subjectMap).length || "–", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
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
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </h3>
                {nextSession ? (
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-on-surface">{nextSession.subject}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          nextSession.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                          nextSession.status === "PENDING"   ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {nextSession.status === "PENDING" ? "⏳ Awaiting Tutor Confirmation" : nextSession.status}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        👤 Tutor: {nextSession.status === "CONFIRMED" ? nextSession.tutorName : <span className="italic text-on-surface-variant/60">Will be revealed after confirmation</span>}
                      </p>
                      <p className="text-sm text-on-surface-variant">👦 Student: {nextSession.childName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant mt-1">
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" />{nextSession.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} className="text-primary" />{nextSession.timeSlot}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end shrink-0">
                      {nextSession.zoomLink ? (
                        <a href={nextSession.zoomLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
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
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon="📅" title="No sessions yet"
                    desc="Book your free demo to get started!"
                    action={<Link href="/book-demo" className="btn-primary text-sm px-6 py-2.5">Book Free Demo</Link>} />
                )}
              </div>

              {/* Subject progress preview */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Progress
                </h3>
                {subjectData.length > 0 ? (
                  <div className="space-y-4">
                    {subjectData.slice(0, 3).map(s => (
                      <div key={s.subject}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-on-surface">{s.icon} {s.subject}</span>
                          <span className="text-xs font-bold text-primary">{s.progress}%</span>
                        </div>
                        <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all`}
                            style={{ width: `${s.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant text-center py-4">Progress will appear once you complete sessions.</p>
                )}
                <button onClick={() => setSection("learning")}
                  className="mt-4 text-xs text-primary hover:underline flex items-center gap-1">
                  Full Learning Center <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Recent bookings */}
            {bookings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                    <Video size={18} className="text-primary" /> Recent Sessions
                  </h3>
                  <button onClick={() => setSection("schedule")} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.slice(0, 3).map(b => (
                    <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancellingId === b.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Book Session",    icon: Plus,        color: "bg-primary/10 text-primary",     action: () => router.push("/book-demo") },
                { label: "My Schedule",     icon: Calendar,    color: "bg-blue-50 text-blue-600",        action: () => setSection("schedule")   },
                { label: "Study Materials", icon: BookOpen,    color: "bg-purple-50 text-purple-600",    action: () => setSection("learning")   },
                { label: "Get Support",     icon: HelpCircle,  color: "bg-orange-50 text-orange-600",    action: () => setSection("support")    },
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
                <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                  {bookings.length} total bookings
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </span>
                </p>
              </div>
              <Link href="/book-demo" className="btn-primary self-start sm:self-auto whitespace-nowrap">
                <Plus size={16} /> Book New Session
              </Link>
            </div>

            {/* Week strip */}
            <WeekStrip bookings={bookings} />

            {/* Tab filter */}
            <div className="flex gap-2">
              {(["upcoming", "confirmed", "cancelled"] as const).map(tab => (
                <button key={tab} onClick={() => setScheduleTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                    scheduleTab === tab ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                  }`}>
                  {tab} ({
                    tab === "upcoming"  ? bookings.filter(b => b.status !== "CANCELLED").length :
                    tab === "confirmed" ? bookings.filter(b => b.status === "CONFIRMED").length :
                    bookings.filter(b => b.status === "CANCELLED").length
                  })
                </button>
              ))}
            </div>

            {/* Session list */}
            {filteredBookings.length === 0 ? (
              <EmptyState icon="📅" title="No sessions here"
                desc={scheduleTab === "cancelled" ? "No cancelled sessions." : "Book a session to get started."}
                action={scheduleTab !== "cancelled" ? <Link href="/book-demo" className="btn-primary text-sm px-6 py-2.5">Book Free Demo</Link> : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <ScheduleRow key={b.id} booking={b} onCancel={handleCancel} cancelling={cancellingId === b.id} />
                ))}
              </div>
            )}

            {/* Session history table */}
            {bookings.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-on-surface-variant" /> Full History
                </h3>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container">
                        {["Subject","Student","Tutor","Date","Time","Status",""].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id} className={`border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors ${i === bookings.length - 1 ? "border-b-0" : ""}`}>
                          <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">{b.subject}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{b.childName}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {b.status === "CONFIRMED"
                              ? <span className="text-on-surface-variant">{b.tutorName}</span>
                              : <span className="text-xs italic text-on-surface-variant/50">Pending assignment</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{b.date}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{b.timeSlot}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              b.status === "CONFIRMED"  ? "bg-green-100 text-green-700"   :
                              b.status === "PENDING"    ? "bg-amber-100 text-amber-700"   :
                              b.status === "CANCELLED"  ? "bg-red-100 text-red-600" :
                              "bg-surface-container text-on-surface-variant"
                            }`}>
                              {b.status === "PENDING" ? "⏳ Awaiting Tutor" : b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {b.zoomLink && b.status !== "CANCELLED" && (
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

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-primary mb-1">Pro Tip</h4>
                <p className="text-sm text-on-surface-variant">
                  Regular sessions 3–4 times a week show the best results. Book recurring slots with your tutor for the most consistent progress!
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
              {streak > 0 && (
                <div className="flex items-center gap-2 text-sm bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
                  <Flame size={15} className="text-orange-500" />
                  <span className="font-semibold text-orange-700">{streak} day streak!</span>
                </div>
              )}
            </div>

            {/* Subject Progress */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <Target size={18} className="text-primary" /> Subject Progress
              </h3>
              {subjectData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjectData.map(s => (
                    <div key={s.subject} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-3`}>
                        {s.icon}
                      </div>
                      <p className="font-bold text-on-surface text-sm mb-1">{s.subject}</p>
                      <p className="text-xs text-on-surface-variant mb-3">{s.sessions} session{s.sessions !== 1 ? "s" : ""} completed</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all`}
                            style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-on-surface shrink-0">{s.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
                  <p className="text-3xl mb-3">📊</p>
                  <p className="font-semibold text-on-surface mb-1">No progress data yet</p>
                  <p className="text-sm text-on-surface-variant mb-4">Complete your first session to see subject progress here.</p>
                  <Link href="/book-demo" className="btn-primary text-sm px-6 py-2.5">Book Free Demo</Link>
                </div>
              )}
            </section>

            {/* Achievements */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-primary" /> Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {achievements.map(a => (
                  <div key={a.title} className={`rounded-2xl border p-4 text-center transition-all ${
                    a.earned
                      ? "bg-yellow-50 border-yellow-200 shadow-card"
                      : "bg-surface-container border-outline-variant opacity-50"
                  }`}>
                    <div className={`text-3xl mb-2 ${!a.earned ? "grayscale" : ""}`}>{a.icon}</div>
                    <p className="text-xs font-bold text-on-surface">{a.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">{a.desc}</p>
                    {a.earned && <p className="text-[10px] font-bold text-yellow-600 mt-1">Earned! ✓</p>}
                    {!a.earned && <p className="text-[10px] text-on-surface-variant mt-1 flex items-center justify-center gap-0.5"><Lock size={9} /> Locked</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Study Resources */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                  <BookMarked size={18} className="text-primary" /> Study Resources
                  <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{resources.length} files</span>
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {["All", ...Array.from(new Set(resources.map(r => r.subject)))].map(f => (
                    <button key={f} onClick={() => setSubjectFilter(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                        subjectFilter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                      }`}>{f}</button>
                  ))}
                </div>
              </div>
              {resources.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
                  <p className="text-3xl mb-3">📚</p>
                  <p className="text-sm text-on-surface-variant">Study materials will appear here once uploaded by your tutor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.filter(r => subjectFilter === "All" || r.subject === subjectFilter).map(r => (
                    <div key={r.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl shrink-0">{r.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface leading-snug">{r.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{r.subject} · {r.type}{r.size ? ` · ${r.size}` : ""}</p>
                      </div>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 p-2 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all">
                          <Download size={15} />
                        </a>
                      ) : (
                        <span className="shrink-0 p-2 rounded-xl bg-surface-container text-on-surface-variant/40 cursor-not-allowed" title="No file uploaded yet">
                          <Download size={15} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Video Lessons */}
            <section>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <PlayCircle size={18} className="text-primary" /> Video Lessons
                <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{videos.length} videos</span>
              </h3>
              {videos.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
                  <p className="text-3xl mb-3">🎬</p>
                  <p className="text-sm text-on-surface-variant">Video lessons will appear here once published by your tutor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.filter(v => subjectFilter === "All" || v.subject === subjectFilter).map(v => (
                    <div key={v.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden hover:shadow-card-hover transition-shadow group cursor-pointer"
                      onClick={() => v.videoUrl ? window.open(v.videoUrl, "_blank") : undefined}>
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                        <span className="text-5xl">{v.thumbnail}</span>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                            <PlayCircle size={24} className="text-primary" />
                          </div>
                        </div>
                        {v.duration && (
                          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md">{v.duration}</span>
                        )}
                        {!v.videoUrl && (
                          <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Coming soon</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-on-surface leading-snug">{v.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-on-surface-variant">{v.subject}</span>
                          <span className="text-xs text-on-surface-variant">{v.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* From Your Tutor — personalised materials */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                  <FolderOpen size={18} className="text-primary" /> From Your Tutor
                  {tutorMaterials.length > 0 && (
                    <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {tutorMaterials.length} file{tutorMaterials.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {tutorMaterials.length > 0 && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">New</span>
                  )}
                </h3>
              </div>
              {tutorMaterials.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
                  <p className="text-3xl mb-3">📬</p>
                  <p className="font-semibold text-on-surface mb-1">No tutor materials yet</p>
                  <p className="text-sm text-on-surface-variant">Your tutor will upload worksheets, notes and resources here directly for your child.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tutorMaterials.map(m => {
                    const subjectStyle = getSubjectStyle(m.subject);
                    const fileIcon = m.fileType === "PDF" ? "📄" : m.fileType === "Image" ? "🖼️" : "📋";
                    return (
                      <div key={m.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-card-hover transition-shadow">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">{fileIcon}</div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-on-surface text-sm">{m.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{m.fileType}</span>
                            {m.subject && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectStyle.bg} ${subjectStyle.color}`}>
                                {subjectStyle.icon} {m.subject}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            👤 From: <strong>{m.tutorName}</strong>
                            {" · "}
                            {m.visibility === "all"
                              ? <span>👥 For <strong>all students</strong></span>
                              : <span>👦 For <strong>{m.studentName}</strong></span>
                            }
                            {m.fileSize && <> · {m.fileSize}</>}
                            {" · "}{new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {m.notes && (
                            <p className="text-xs text-primary/70 mt-1 italic flex items-center gap-1">
                              <MessageSquare size={10} /> {m.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary transition-all text-xs font-semibold">
                            <ExternalLink size={13} /> View
                          </a>
                          <a href={m.fileUrl} download
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all text-xs font-semibold">
                            <Download size={13} /> Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recorded Sessions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                  <PlayCircle size={18} className="text-primary" /> Recorded Sessions
                  {recordings.length > 0 && (
                    <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {recordings.length} video{recordings.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h3>
              </div>
              {recordings.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-8 text-center">
                  <p className="text-3xl mb-3">🎬</p>
                  <p className="font-semibold text-on-surface mb-1">No recordings yet</p>
                  <p className="text-sm text-on-surface-variant">Recorded Zoom sessions from your tutor will appear here for rewatching.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recordings.map(r => {
                    const subjectStyle = getSubjectStyle(r.subject);
                    return (
                      <div key={r.id}
                        className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden hover:shadow-card-hover transition-shadow group cursor-pointer"
                        onClick={() => window.open(r.videoUrl, "_blank")}>
                        {/* Thumbnail */}
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                          <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <PlayCircle size={28} className="text-primary" />
                          </div>
                          {r.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-md">⏱ {r.duration}</span>
                          )}
                          {r.uploadedByRole === "ADMIN" && (
                            <span className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-md">Admin</span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-sm font-semibold text-on-surface leading-snug mb-1">{r.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {r.subject && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectStyle.bg} ${subjectStyle.color}`}>
                                {subjectStyle.icon} {r.subject}
                              </span>
                            )}
                            {r.visibility === "all"
                              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">All Students</span>
                              : r.studentName && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">👦 {r.studentName}</span>
                            }
                          </div>
                          <div className="flex items-center justify-between text-xs text-on-surface-variant">
                            <span>🎓 {r.tutorName || "Tutor"}</span>
                            <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          </div>
                          {r.description && <p className="text-xs text-on-surface-variant mt-1.5 italic leading-snug">{r.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

        {/* ══════════════════════════════════════════
            SECTION: PAYMENTS
        ══════════════════════════════════════════ */}
        {section === "payments" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface">Payments &amp; Enrollments</h2>
              <p className="text-sm text-on-surface-variant mt-1">Your payment history and active course enrollments</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Paid",
                  value: parentPayments.filter(p=>p.status==="PAID").reduce((a,p)=>a+(p.currency==="INR"?p.amount:p.amount),0) > 0
                    ? `₹${parentPayments.filter(p=>p.status==="PAID" && p.currency==="INR").reduce((a,p)=>a+p.amount,0).toLocaleString("en-IN")}`
                    : "—",
                  sub: `${parentPayments.filter(p=>p.status==="PAID").length} successful payments`,
                  icon: IndianRupee, color: "text-green-600", bg: "bg-green-50",
                },
                {
                  label: "Active Courses",
                  value: parentEnrollments.filter(e=>e.status==="ACTIVE").length,
                  sub: `${parentEnrollments.filter(e=>e.status==="COMPLETED").length} completed`,
                  icon: BookOpen, color: "text-primary", bg: "bg-primary/10",
                },
                {
                  label: "Sessions Scheduled",
                  value: parentEnrollments.reduce((a,e)=>a+e.totalSessions,0),
                  sub: "Across all enrollments",
                  icon: Calendar, color: "text-blue-600", bg: "bg-blue-50",
                },
              ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={22} className={color} />
                  </div>
                  <p className="text-2xl font-bold text-on-surface font-display">{value}</p>
                  <p className="text-xs font-medium text-on-surface mt-0.5">{label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Enrollments */}
            {parentEnrollments.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" /> My Enrollments
                </h3>
                <div className="space-y-3">
                  {parentEnrollments.map(en => {
                    const done = en.sessions.filter(s => s.status === "COMPLETED").length;
                    const pct  = en.totalSessions > 0 ? Math.round((done / en.totalSessions) * 100) : 0;
                    const nextSession = en.sessions.find(s => s.status === "SCHEDULED");
                    return (
                      <div key={en.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-on-surface">{en.courseName}</p>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                en.status === "ACTIVE"    ? "bg-green-100 text-green-700" :
                                en.status === "COMPLETED" ? "bg-surface-container text-on-surface-variant" :
                                "bg-red-100 text-red-600"
                              }`}>{en.status}</span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-0.5">for {en.childName}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-on-surface-variant">
                              <span>🕐 {en.timeSlot} · Mon–Fri</span>
                              <span>📅 {en.startDate} → {en.endDate}</span>
                              <span>📊 {done}/{en.totalSessions} sessions done</span>
                            </div>
                          </div>
                          {nextSession?.zoomLink && en.status === "ACTIVE" && (
                            <a href={nextSession.zoomLink} target="_blank" rel="noopener noreferrer"
                              className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white flex items-center gap-1"
                              style={{ backgroundColor: "#2D8CFF" }}>
                              <Video size={12} /> Next Session
                            </a>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                            <span>Progress</span><span>{pct}%</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${en.status === "COMPLETED" ? "bg-surface-container-highest" : "bg-primary"}`}
                              style={{ width: `${pct}%` }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment history */}
            {parentPayments.length > 0 ? (
              <div>
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Payment History
                </h3>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] px-5 py-3 bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider gap-4">
                    <span>Course / Student</span>
                    <span>Amount</span>
                    <span>Gateway</span>
                    <span>Date</span>
                    <span>Status</span>
                  </div>
                  {parentPayments.map((p, i) => (
                    <div key={p.id} className={`flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] px-5 py-4 gap-3 sm:gap-4 sm:items-center ${
                      i < parentPayments.length - 1 ? "border-b border-outline-variant/50" : ""
                    }`}>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{p.courseName}</p>
                        <p className="text-xs text-on-surface-variant">for {p.childName}</p>
                      </div>
                      <div className="font-bold text-on-surface">
                        {p.currency === "INR" ? "₹" : p.currency + " "}{p.amount.toLocaleString("en-IN")}
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">{p.gateway}</span>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        p.status === "PAID"    ? "bg-green-100 text-green-700"  :
                        p.status === "FAILED"  ? "bg-red-100 text-red-600"      :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{p.status === "PAID" ? "✓ Paid" : p.status === "FAILED" ? "✗ Failed" : "⏳ Pending"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : parentEnrollments.length === 0 ? (
              <EmptyState icon="💳" title="No payments yet"
                desc="Enroll in a course to get started with Zippy Minds!"
                action={<Link href="/enroll" className="btn-primary text-sm px-6 py-2.5">Browse Courses</Link>} />
            ) : null}

            {/* Payment note */}
            <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex items-start gap-3">
              <AlertCircle size={18} className="text-on-surface-variant mt-0.5 shrink-0" />
              <p className="text-sm text-on-surface-variant">
                For payment issues or to extend your enrollment, please <button onClick={() => setSection("support")} className="text-primary font-semibold hover:underline">raise a support ticket</button>.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: SUPPORT
        ══════════════════════════════════════════ */}
        {section === "support" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface">Support Center</h2>
              <p className="text-sm text-on-surface-variant mt-1">Get help, raise tickets, and browse FAQs</p>
            </div>

            {/* Success toast */}
            {ticketDone && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm font-semibold">Ticket submitted! We&apos;ll reply to your email within 24 hours.</span>
              </div>
            )}

            {/* Support tabs */}
            <div className="flex gap-2 border-b border-outline-variant">
              {(["new", "history", "faq"] as const).map(tab => (
                <button key={tab} onClick={() => setSupportTab(tab)}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${
                    supportTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}>
                  {tab === "new" ? "New Ticket" : tab === "history" ? `My Tickets (${tickets.length})` : "FAQ"}
                </button>
              ))}
            </div>

            {/* ── New Ticket Form ── */}
            {supportTab === "new" && (
              <div className="max-w-2xl">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                  <h3 className="font-display font-bold text-on-surface mb-5 flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" /> Submit a Support Request
                  </h3>
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject *</label>
                      <input
                        type="text"
                        placeholder="e.g. Zoom link not working, Need to reschedule…"
                        value={ticketForm.subject}
                        onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Priority</label>
                      <select
                        value={ticketForm.priority}
                        onChange={e => setTicketForm(f => ({ ...f, priority: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                        <option value="low">Low — General question</option>
                        <option value="medium">Medium — Need help soon</option>
                        <option value="high">High — Urgent issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Message *</label>
                      <textarea
                        rows={5}
                        placeholder="Describe your issue in detail. Include booking date, subject, and any error messages you saw…"
                        value={ticketForm.message}
                        onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                      />
                    </div>

                    {ticketError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={15} /> {ticketError}
                      </div>
                    )}

                    <button type="submit" disabled={ticketSending}
                      className="btn-primary w-full sm:w-auto px-8 disabled:opacity-60">
                      {ticketSending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                          Submitting…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><Send size={15} /> Submit Ticket</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Quick contact */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a href="mailto:zippymindsacademy@gmail.com"
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 flex items-center gap-3 hover:shadow-card transition-shadow">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Mail size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Email Us</p>
                      <p className="text-xs text-on-surface-variant">zippymindsacademy@gmail.com</p>
                    </div>
                  </a>
                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 flex items-center gap-3 hover:shadow-card transition-shadow">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Phone size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">WhatsApp</p>
                      <p className="text-xs text-on-surface-variant">Mon–Sat · 9 AM – 7 PM IST</p>
                    </div>
                  </a>
                </div>
              </div>
            )}

            {/* ── My Tickets ── */}
            {supportTab === "history" && (
              <div>
                {tickets.length === 0 ? (
                  <EmptyState icon="🎫" title="No tickets yet"
                    desc="Haven't raised a support request yet. We're here if you need us!"
                    action={<button onClick={() => setSupportTab("new")} className="btn-primary text-sm px-6 py-2.5">Raise a Ticket</button>} />
                ) : (
                  <div className="space-y-4">
                    {tickets.map(t => (
                      <div key={t.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                t.priority === "high"   ? "bg-red-100 text-red-600"      :
                                t.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                                "bg-surface-container text-on-surface-variant"
                              }`}>{t.priority}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                t.status === "open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                              }`}>{t.status}</span>
                            </div>
                            <p className="font-bold text-on-surface">{t.subject}</p>
                            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{t.message}</p>
                          </div>
                          <p className="text-xs text-on-surface-variant shrink-0">{fmtDate(t.createdAt)}</p>
                        </div>
                        {t.reply && (
                          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
                              <MessageSquare size={12} /> Admin Reply
                            </p>
                            <p className="text-sm text-on-surface">{t.reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── FAQ ── */}
            {supportTab === "faq" && (
              <div className="max-w-2xl space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container/50 transition-colors">
                      <span className="font-semibold text-on-surface text-sm pr-4">{faq.q}</span>
                      <ChevronDown size={16} className={`text-on-surface-variant shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {expandedFaq === i && (
                      <div className="px-5 pb-4 text-sm text-on-surface-variant border-t border-outline-variant/50 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Profile Edit Modal ── */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProfileOpen(false)} />
          <div className="relative bg-surface rounded-3xl border border-outline-variant shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-on-surface text-lg flex items-center gap-2">
                <User size={20} className="text-primary" /> Edit Profile
              </h3>
              <button onClick={() => setProfileOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {profileForm.name?.[0]?.toUpperCase() ?? user?.name?.[0]?.toUpperCase() ?? "P"}
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant">{user?.email}</p>
                  <p className="text-xs text-on-surface-variant capitalize mt-0.5">{user?.role?.toLowerCase()} account</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
                <input type="text" value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Phone Number</label>
                <input type="tel" value={profileForm.phone}
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              </div>

              <div className="bg-surface-container rounded-xl px-4 py-3">
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <Lock size={12} /> Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {profileMsg && (
                <p className={`text-sm font-semibold flex items-center gap-2 ${profileMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {profileMsg.includes("success") ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {profileMsg}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setProfileOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={profileSaving}
                  className="flex-1 btn-primary disabled:opacity-60">
                  {profileSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function BookingCard({ booking: b, onCancel, cancelling }: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-on-surface text-sm">{b.subject}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">for {b.childName}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          b.status === "CONFIRMED" ? "bg-green-100 text-green-700"  :
          b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700":
          b.status === "CANCELLED" ? "bg-red-100 text-red-600"      :
          "bg-surface-container text-on-surface-variant"
        }`}>{b.status}</span>
      </div>
      <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
        <div className="flex items-center gap-2"><Calendar size={12} className="text-primary" />{b.date}</div>
        <div className="flex items-center gap-2"><Clock size={12} className="text-primary" />{b.timeSlot}</div>
        <div className="flex items-center gap-2"><User size={12} className="text-primary" />{b.tutorName || <span className="italic text-on-surface-variant/50">Pending assignment</span>}</div>
      </div>
      {b.status === "CANCELLED" ? (
        <div className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-500 text-xs py-2.5 rounded-xl border border-red-200">
          <XCircle size={13} /> Cancelled
        </div>
      ) : b.zoomLink ? (
        <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-bold text-xs py-2.5 rounded-xl text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#2D8CFF" }}>
          <Video size={14} /> Join Zoom Session
        </a>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 w-full bg-surface-container text-on-surface-variant text-xs py-2.5 rounded-xl border border-outline-variant">
            <Clock size={13} /> Zoom link pending
          </div>
          {b.status === "PENDING" && (
            <button onClick={() => onCancel(b.id)} disabled={cancelling}
              className="w-full text-xs text-red-500 hover:text-red-700 font-semibold py-1 disabled:opacity-50">
              {cancelling ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ booking: b, onCancel, cancelling }: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const [month, day] = b.date.split(" ");
  return (
    <div className={`bg-surface-container-lowest rounded-2xl border shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
      b.status === "CANCELLED" ? "border-red-200 opacity-70" : "border-outline-variant"
    }`}>
      {/* Date badge */}
      <div className={`rounded-xl px-4 py-3 text-center min-w-[70px] shrink-0 ${
        b.status === "CANCELLED" ? "bg-red-50" : "bg-primary/10"
      }`}>
        <p className={`text-[10px] font-bold uppercase tracking-wide ${b.status === "CANCELLED" ? "text-red-400" : "text-primary"}`}>{month}</p>
        <p className={`text-2xl font-extrabold leading-none ${b.status === "CANCELLED" ? "text-red-400" : "text-primary"}`}>
          {day?.replace(",", "") ?? "--"}
        </p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-on-surface">{b.subject}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            b.status === "CONFIRMED" ? "bg-green-100 text-green-700"  :
            b.status === "PENDING"   ? "bg-yellow-100 text-yellow-700":
            b.status === "CANCELLED" ? "bg-red-100 text-red-600"      :
            "bg-surface-container text-on-surface-variant"
          }`}>{b.status === "PENDING" ? "⏳ Awaiting Tutor" : b.status}</span>
        </div>
        <p className="text-sm text-on-surface-variant">👤 {b.tutorName || "Pending assignment"} &nbsp;·&nbsp; 👦 {b.childName}</p>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
          <Clock size={11} className="text-primary" /> {b.timeSlot}
          {b.monthlyPrice > 0 ? ` · ₹${b.monthlyPrice}/mo` : " · Free Demo"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        {b.status === "CANCELLED" ? (
          <span className="flex items-center gap-1 text-xs text-red-400 font-semibold px-3 py-2">
            <XCircle size={13} /> Cancelled
          </span>
        ) : b.zoomLink ? (
          <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: "#2D8CFF" }}>
            <Video size={15} /> Join Zoom
          </a>
        ) : (
          <>
            <span className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm bg-surface-container text-on-surface-variant border border-outline-variant font-medium">
              <Clock size={13} /> Pending
            </span>
            {b.status === "PENDING" && (
              <button onClick={() => onCancel(b.id)} disabled={cancelling}
                className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Cancel booking">
                <XCircle size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WeekStrip({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });
  const DAY = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
          const hasSession = bookings.some(b =>
            b.status !== "CANCELLED" &&
            b.date.includes(String(d.getDate())) &&
            b.date.includes(MON[d.getMonth()])
          );
          const isToday = i === 0;
          return (
            <div key={i} className={`flex flex-col items-center p-2 rounded-xl text-center ${
              isToday    ? "bg-primary text-on-primary" :
              hasSession ? "bg-secondary-container/30 border border-secondary-container" :
              "bg-surface-container"
            }`}>
              <span className="text-[10px] font-bold uppercase">{DAY[d.getDay()]}</span>
              <span className="text-base font-extrabold mt-0.5">{d.getDate()}</span>
              <span className="text-[9px] mt-0.5 opacity-70">{MON[d.getMonth()]}</span>
              {hasSession && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
              {isToday   && <div className="w-1.5 h-1.5 rounded-full bg-on-primary/60 mt-1" />}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-on-surface-variant mt-3 text-center flex items-center justify-center gap-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-container inline-block border border-secondary-container" /> Session booked</span>
      </p>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: {
  icon: string; title: string; desc: string; action?: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="font-bold text-on-surface mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant mb-5 max-w-xs">{desc}</p>
      {action}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Calendar, Users, User, Settings,
  LogOut, Menu, X, Video, Clock, CheckCircle, AlertTriangle,
  ChevronRight, TrendingUp, Search, Star, BookOpen,
  IndianRupee, Phone, Mail, Lock, Save,
  AlertCircle, FileText, XCircle,
  MessageSquare, Award, BarChart2, Upload, Trash2, Download,
  FolderOpen, ExternalLink, Play, Link as LinkIcon,
} from "lucide-react";
import { SUBJECTS } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Section = "dashboard" | "sessions" | "students" | "earnings" | "materials" | "profile";

interface TMaterial {
  id: string; tutorName: string; tutorEmail: string;
  studentName: string; subject: string; title: string;
  fileUrl: string; fileType: string; fileSize: string;
  notes: string; visibility: string; createdAt: string;
}

interface TRecording {
  id: string; title: string; description: string; subject: string;
  studentName: string; tutorName: string; videoUrl: string;
  duration: string; fileSize: string; uploadedBy: string;
  uploadedByRole: string; visibility: string; createdAt: string;
}

interface TSession {
  id: string; childName: string; subject: string; date: string;
  timeSlot: string; status: string; monthlyPrice: number;
  zoomLink?: string | null; zoomStartUrl?: string | null;
  parentName: string; parentEmail: string; notes?: string;
  createdAt: string; tutorName: string; grade?: string;
}

interface UserInfo {
  id: string; name: string; email: string; phone?: string | null;
  role: string; approvalStatus?: string; createdAt?: string;
  subjects?: string[];
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function getSubjectStyle(subject: string) {
  const map: Record<string, { color: string; bg: string; icon: string }> = {
    "Phonics":         { color: "text-pink-600",   bg: "bg-pink-50",   icon: "🔤" },
    "Mathematics":     { color: "text-purple-600", bg: "bg-purple-50", icon: "🔢" },
    "English Grammar": { color: "text-blue-600",   bg: "bg-blue-50",   icon: "📝" },
    "Science":         { color: "text-green-600",  bg: "bg-green-50",  icon: "🔬" },
  };
  return map[subject] ?? { color: "text-orange-600", bg: "bg-orange-50", icon: "📚" };
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TIPS = [
  "Start each session with a 2-minute warm-up game to grab attention.",
  "Use the Zoom whiteboard for live problem solving — students love it!",
  "Send a short recap message to parents after each session.",
  "Vary your teaching pace: fast for revision, slow for new concepts.",
  "Celebrate small wins! A sticker emoji goes a long way. 🌟",
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function TutorDashboard() {
  const router = useRouter();

  /* ── State ── */
  const [section, setSection]         = useState<Section>("dashboard");
  const [user, setUser]               = useState<UserInfo | null>(null);
  const [sessions, setSessions]       = useState<TSession[]>([]);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sessions
  const [sessionTab, setSessionTab]       = useState<"requests" | "upcoming" | "all" | "cancelled">("requests");
  const [sessionSearch, setSessionSearch] = useState("");
  const [actioning, setActioning]         = useState<Record<string, boolean>>({});

  // Profile
  const [profileForm, setProfileForm]     = useState({ name: "", phone: "", subjects: [] as string[] });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState("");
  const [profileEdit, setProfileEdit]     = useState(false);

  // Notes
  const [noteOpen, setNoteOpen]   = useState<string | null>(null);
  const [noteText, setNoteText]   = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  // Materials
  const [materials, setMaterials]           = useState<TMaterial[]>([]);
  const [matStudentFilter, setMatStudentFilter] = useState<string>("All");
  const [matUploading, setMatUploading]     = useState(false);
  const [matUploadMsg, setMatUploadMsg]     = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [matForm, setMatForm]               = useState({ studentName: "", subject: "", title: "", notes: "", visibility: "individual" as "individual" | "all" });
  const [matFile, setMatFile]               = useState<File | null>(null);
  const [showMatForm, setShowMatForm]       = useState(false);

  // Recordings
  const [recordings, setRecordings]             = useState<TRecording[]>([]);
  const [recTab, setRecTab]                     = useState<"materials" | "recordings">("materials");
  const [showRecForm, setShowRecForm]           = useState(false);
  const [recUploading, setRecUploading]         = useState(false);
  const [recUploadMsg, setRecUploadMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [recFile, setRecFile]                   = useState<File | null>(null);
  const [recForm, setRecForm]                   = useState({
    title: "", description: "", subject: "", studentName: "",
    videoUrl: "", duration: "", visibility: "individual" as "individual" | "all",
    useLink: true, // true = paste URL, false = upload file
  });

  const todayTip = TIPS[new Date().getDay() % TIPS.length];

  /* ── Data loading ── */
  useEffect(() => {
    Promise.all([
      fetch("/api/auth/profile").then(r => r.json()),
      fetch("/api/tutor/sessions").then(r => r.json()),
      fetch("/api/tutor/materials").then(r => r.json()),
      fetch("/api/recordings").then(r => r.json()),
    ]).then(([profileData, sessData, matData, recData]) => {
      if (profileData.user) {
        setUser(profileData.user);
        setProfileForm({ name: profileData.user.name ?? "", phone: profileData.user.phone ?? "", subjects: profileData.user.subjects ?? [] });
      }
      if (sessData.sessions)    setSessions(sessData.sessions);
      if (matData.materials)    setMaterials(matData.materials);
      if (recData.recordings)   setRecordings(recData.recordings);
    }).catch(() => router.push("/auth/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  /* ── Derived data ── */
  const confirmedSessions = useMemo(() => sessions.filter(s => s.status === "CONFIRMED"), [sessions]);
  const upcomingSessions  = useMemo(() => sessions.filter(s => s.status !== "CANCELLED"), [sessions]);
  const nextSession       = upcomingSessions[0] ?? null;
  const totalEarnings     = confirmedSessions.reduce((a, s) => a + s.monthlyPrice, 0);
  const approvalStatus    = user?.approvalStatus ?? "APPROVED";

  // Students derived from sessions
  const studentMap = useMemo(() => {
    return sessions.reduce((acc, s) => {
      if (!acc[s.childName]) {
        acc[s.childName] = { name: s.childName, parentName: s.parentName, parentEmail: s.parentEmail, sessions: [], subjects: new Set<string>() };
      }
      acc[s.childName].sessions.push(s);
      acc[s.childName].subjects.add(s.subject);
      return acc;
    }, {} as Record<string, { name: string; parentName: string; parentEmail: string; sessions: TSession[]; subjects: Set<string> }>);
  }, [sessions]);
  const students = Object.values(studentMap);

  // Subject breakdown
  const subjectMap = useMemo(() =>
    sessions.reduce((acc, s) => { acc[s.subject] = (acc[s.subject] || 0) + 1; return acc; }, {} as Record<string, number>),
  [sessions]);

  // Monthly earnings (last 6 months)
  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      const earnings = confirmedSessions.filter(s => {
        const sd = new Date(s.createdAt);
        return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      }).reduce((a, s) => a + s.monthlyPrice, 0);
      const count = confirmedSessions.filter(s => {
        const sd = new Date(s.createdAt);
        return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      }).length;
      return { month: label, earnings, count };
    });
  }, [confirmedSessions]);
  const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings), 1);

  // Pending requests = sessions the tutor hasn't acted on yet
  const pendingRequests = useMemo(() => sessions.filter(s => s.status === "PENDING"), [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesTab =
        sessionTab === "requests"  ? s.status === "PENDING" :
        sessionTab === "upcoming"  ? s.status === "CONFIRMED" :
        sessionTab === "cancelled" ? s.status === "CANCELLED" || s.status === "REJECTED" : true;
      const q = sessionSearch.toLowerCase();
      const matchesSearch = !q || s.childName.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || s.parentName.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [sessions, sessionTab, sessionSearch]);

  /* ── Handlers ── */
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg("");
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    const data = await res.json();
    if (res.ok) { setUser(data.user); setProfileForm(f => ({ ...f, subjects: data.user.subjects ?? [] })); setProfileMsg("Saved!"); setProfileEdit(false); setTimeout(() => setProfileMsg(""), 2000); }
    else setProfileMsg(data.error ?? "Failed to save.");
    setProfileSaving(false);
  };

  // Accept or reject a demo request
  const handleSessionAction = async (bookingId: string, action: "accept" | "reject") => {
    setActioning(p => ({ ...p, [bookingId]: true }));
    try {
      const res = await fetch("/api/tutor/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      // Update in place
      setSessions(prev => prev.map(s => s.id === bookingId ? { ...s, ...data.session } : s));
      // Switch to upcoming tab after accepting
      if (action === "accept") setSessionTab("upcoming");
    } catch {
      // silently ignore, let the UI stay as-is
    } finally {
      setActioning(p => ({ ...p, [bookingId]: false }));
    }
  };

  const handleSaveNote = async () => {
    if (!noteOpen) return;
    setNoteSaving(true);
    const res = await fetch("/api/tutor/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: noteOpen, notes: noteText }),
    });
    if (res.ok) {
      setSessions(prev => prev.map(s => s.id === noteOpen ? { ...s, notes: noteText } : s));
      setNoteOpen(null);
    }
    setNoteSaving(false);
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const needsStudent = matForm.visibility === "individual" && !matForm.studentName.trim();
    if (!matFile || !matForm.title.trim() || needsStudent) {
      setMatUploadMsg({ type: "err", text: matForm.visibility === "individual" ? "Please fill in student name, title and select a file." : "Please fill in title and select a file." });
      return;
    }
    setMatUploading(true); setMatUploadMsg(null);
    try {
      // Step 1: upload file to blob
      const fd = new FormData();
      fd.append("file", matFile);
      const uploadRes = await fetch("/api/tutor/materials/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed");

      // Step 2: save material record
      const res = await fetch("/api/tutor/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: matForm.visibility === "all" ? "" : matForm.studentName.trim(),
          subject:     matForm.subject.trim(),
          title:       matForm.title.trim(),
          notes:       matForm.notes.trim(),
          visibility:  matForm.visibility,
          fileUrl:     uploadData.url,
          fileType:    uploadData.type?.includes("pdf") ? "PDF" : uploadData.type?.includes("image") ? "Image" : "Doc",
          fileSize:    uploadData.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setMaterials(prev => [data.material, ...prev]);
      setMatForm({ studentName: "", subject: "", title: "", notes: "", visibility: "individual" });
      setMatFile(null);
      setShowMatForm(false);
      setMatUploadMsg({ type: "ok", text: "Material uploaded successfully!" });
      setTimeout(() => setMatUploadMsg(null), 3000);
    } catch (err) {
      setMatUploadMsg({ type: "err", text: (err as Error).message ?? "Upload failed." });
    } finally {
      setMatUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Delete this material? The student will no longer see it.")) return;
    const res = await fetch("/api/tutor/materials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    });
    if (res.ok) setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const handleUploadRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    const vis = recForm.visibility;
    const needsStudent = vis === "individual" && !recForm.studentName.trim();
    if (!recForm.title.trim() || needsStudent) {
      setRecUploadMsg({ type: "err", text: "Please fill in title" + (needsStudent ? " and student name" : "") + "." });
      return;
    }
    if (recForm.useLink && !recForm.videoUrl.trim()) {
      setRecUploadMsg({ type: "err", text: "Please paste a video URL." }); return;
    }
    if (!recForm.useLink && !recFile) {
      setRecUploadMsg({ type: "err", text: "Please select a video file." }); return;
    }

    setRecUploading(true); setRecUploadMsg(null);
    try {
      let videoUrl = recForm.videoUrl.trim();
      let fileSize = "";

      if (!recForm.useLink && recFile) {
        const fd = new FormData();
        fd.append("file", recFile);
        const uploadRes = await fetch("/api/recordings/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed");
        videoUrl = uploadData.url;
        fileSize = uploadData.size;
      }

      const res = await fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       recForm.title.trim(),
          description: recForm.description.trim(),
          subject:     recForm.subject.trim(),
          studentName: vis === "all" ? "" : recForm.studentName.trim(),
          tutorName:   user?.name ?? "",
          videoUrl,
          duration:    recForm.duration.trim(),
          fileSize,
          visibility:  vis,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      setRecordings(prev => [data.recording, ...prev]);
      setRecForm({ title: "", description: "", subject: "", studentName: "", videoUrl: "", duration: "", visibility: "individual", useLink: true });
      setRecFile(null);
      setShowRecForm(false);
      setRecUploadMsg({ type: "ok", text: "Recording saved successfully!" });
      setTimeout(() => setRecUploadMsg(null), 3000);
    } catch (err) {
      setRecUploadMsg({ type: "err", text: (err as Error).message ?? "Failed." });
    } finally {
      setRecUploading(false);
    }
  };

  /* ── Nav ── */
  const navItems: { id: Section; icon: React.ElementType; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"   },
    { id: "sessions",  icon: Calendar,        label: "My Sessions"  },
    { id: "students",  icon: Users,           label: "Students"     },
    { id: "earnings",  icon: IndianRupee,     label: "Earnings"     },
    { id: "materials", icon: FolderOpen,      label: "Materials"    },
    { id: "profile",   icon: User,            label: "My Profile"   },
  ];

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <>
      <div className="px-6 mb-6 mt-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
          {user?.name?.[0]?.toUpperCase() ?? "T"}
        </div>
        <h1 className="font-display font-bold text-primary text-base leading-none">{user?.name ?? "Tutor"}</h1>
        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user?.email ?? ""}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" :
            approvalStatus === "PENDING"  ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-600"
          }`}>
            {approvalStatus === "APPROVED" ? "✓ Verified Tutor" : approvalStatus === "PENDING" ? "⏳ Pending Review" : "✗ Not Approved"}
          </span>
        </div>
      </div>

      <nav className="flex flex-col flex-grow gap-0.5 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const badge = item.id === "sessions" && pendingRequests.length > 0 ? pendingRequests.length : null;
          return (
            <button key={item.id} onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={section === item.id ? "sidebar-link-active" : "sidebar-link"}>
              <Icon size={18} /><span>{item.label}</span>
              {badge && (
                <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pb-4 space-y-1">
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 mb-2">
          <p className="text-[10px] font-bold text-primary mb-0.5">Today&apos;s Tip 💡</p>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">{todayTip}</p>
        </div>
        <button onClick={() => setSection("profile")} className="sidebar-link w-full text-left">
          <Settings size={18} /> Settings
        </button>
        <button onClick={handleLogout} className="sidebar-link w-full text-left">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Desktop Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant py-6 gap-1 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface-container-low flex flex-col py-6 gap-1 shadow-xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-on-surface-variant"><X size={20} /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-grow lg:ml-64 px-4 md:px-8 lg:px-10 py-6 min-h-screen">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-surface-container border border-outline-variant">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-primary text-base">
            {navItems.find(n => n.id === section)?.label ?? "Dashboard"}
          </span>
          <button onClick={() => setSection("profile")} className="p-2 rounded-xl bg-surface-container border border-outline-variant">
            <User size={18} />
          </button>
        </div>

        {/* ── Approval banner ── */}
        {approvalStatus === "PENDING" && (
          <div className="mb-5 flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl px-5 py-4">
            <AlertTriangle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Your account is under review</p>
              <p className="text-xs mt-0.5">Our team is verifying your credentials. You&apos;ll be notified by email once approved.</p>
            </div>
          </div>
        )}
        {approvalStatus === "REJECTED" && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4">
            <XCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Application not approved</p>
              <p className="text-xs mt-0.5">Please contact zippymindsacademy@gmail.com to understand the reason and reapply.</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: DASHBOARD
        ══════════════════════════════════════════ */}
        {section === "dashboard" && (
          <div className="space-y-6">
            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
                  Welcome back, {user?.name?.split(" ")[0] ?? "Tutor"} 👋
                </h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Sessions",  value: sessions.length,               icon: Calendar,     color: "text-primary",    bg: "bg-primary/10"      },
                { label: "Students Taught", value: students.length,               icon: Users,        color: "text-blue-600",   bg: "bg-blue-50"         },
                { label: "Total Earned",    value: totalEarnings > 0 ? `₹${totalEarnings.toLocaleString("en-IN")}` : "₹0", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
                { label: "Subjects",        value: Object.keys(subjectMap).length || "—", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
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

            {/* Next session + subject breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Next session */}
              <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> Next Session
                </h3>
                {nextSession ? (
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-on-surface">{nextSession.subject}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          nextSession.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>{nextSession.status}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">👦 Student: <strong>{nextSession.childName}</strong></p>
                      <p className="text-sm text-on-surface-variant">👤 Parent: {nextSession.parentName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-primary" />{nextSession.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} className="text-primary" />{nextSession.timeSlot}</span>
                        {nextSession.monthlyPrice > 0 && <span className="flex items-center gap-1"><IndianRupee size={11} className="text-green-600" />₹{nextSession.monthlyPrice}/mo</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {nextSession.zoomStartUrl ? (
                        <a href={nextSession.zoomStartUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
                          style={{ backgroundColor: "#2D8CFF" }}>
                          <Video size={15} /> Start Class
                        </a>
                      ) : nextSession.zoomLink ? (
                        <a href={nextSession.zoomLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
                          style={{ backgroundColor: "#2D8CFF" }}>
                          <Video size={15} /> Join Zoom
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                          <Clock size={15} /> Zoom Pending
                        </span>
                      )}
                      <button onClick={() => setSection("sessions")} className="text-xs text-primary hover:underline flex items-center gap-1">
                        All sessions <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="font-semibold text-on-surface mb-1">No sessions assigned yet</p>
                    <p className="text-sm text-on-surface-variant">The admin will assign sessions to you once parents book.</p>
                  </div>
                )}
              </div>

              {/* Subject breakdown */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary" /> Subjects Taught
                </h3>
                {Object.keys(subjectMap).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(subjectMap).sort((a, b) => b[1] - a[1]).map(([subject, count]) => {
                      const { bg, icon } = getSubjectStyle(subject);
                      const max = Math.max(...Object.values(subjectMap));
                      return (
                        <div key={subject}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                              <span className={`w-5 h-5 ${bg} rounded-md flex items-center justify-center text-xs`}>{icon}</span>
                              {subject}
                            </span>
                            <span className="text-xs font-bold text-primary">{count}</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                              style={{ width: `${(count / max) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant text-center py-4">Subject breakdown will appear once you have assigned sessions.</p>
                )}
              </div>
            </div>

            {/* Recent students */}
            {students.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-on-surface text-base flex items-center gap-2">
                    <Users size={18} className="text-primary" /> My Students
                  </h3>
                  <button onClick={() => setSection("students")} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.slice(0, 3).map(s => (
                    <StudentCard key={s.name} student={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "View Sessions",  icon: Calendar,    color: "bg-primary/10 text-primary",     action: () => setSection("sessions")  },
                { label: "My Students",    icon: Users,       color: "bg-blue-50 text-blue-600",        action: () => setSection("students")  },
                { label: "Earnings",       icon: IndianRupee, color: "bg-green-50 text-green-600",      action: () => setSection("earnings")  },
                { label: "Edit Profile",   icon: User,        color: "bg-purple-50 text-purple-600",    action: () => setSection("profile")   },
              ].map(({ label, icon: Icon, color, action }) => (
                <button key={label} onClick={action}
                  className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all text-center">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}><Icon size={18} /></div>
                  <span className="text-xs font-semibold text-on-surface">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: MY SESSIONS
        ══════════════════════════════════════════ */}
        {section === "sessions" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">My Sessions</h2>
                <p className="text-sm text-on-surface-variant mt-1">{sessions.length} total sessions assigned to you</p>
              </div>
              {pendingRequests.length > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="text-sm font-semibold text-amber-700">
                    {pendingRequests.length} new demo request{pendingRequests.length > 1 ? "s" : ""} awaiting your response
                  </span>
                </div>
              )}
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input value={sessionSearch} onChange={e => setSessionSearch(e.target.value)}
                  placeholder="Search student, subject…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {([
                  { id: "requests",  label: "Requests",  count: sessions.filter(s => s.status === "PENDING").length },
                  { id: "upcoming",  label: "Upcoming",  count: sessions.filter(s => s.status === "CONFIRMED").length },
                  { id: "all",       label: "All",       count: sessions.length },
                  { id: "cancelled", label: "Cancelled", count: sessions.filter(s => s.status === "CANCELLED" || s.status === "REJECTED").length },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setSessionTab(tab.id)}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      sessionTab === tab.id
                        ? tab.id === "requests" ? "bg-amber-500 text-white" : "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                    }`}>
                    {tab.label} ({tab.count})
                    {tab.id === "requests" && tab.count > 0 && sessionTab !== "requests" && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions list */}
            {filteredSessions.length === 0 ? (
              <EmptyState icon={sessionTab === "requests" ? "📬" : "📅"}
                title={sessionTab === "requests" ? "No pending requests" : "No sessions found"}
                desc={
                  sessionTab === "requests"  ? "New demo requests from parents will appear here for you to accept or decline." :
                  sessionTab === "cancelled" ? "No cancelled or rejected sessions." :
                  sessionTab === "upcoming"  ? "No confirmed sessions yet. Accept a request to see it here." :
                  "No sessions assigned yet."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredSessions.map(s => (
                  <div key={s.id} className={`bg-surface-container-lowest rounded-2xl border shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    s.status === "CANCELLED" || s.status === "REJECTED" ? "border-red-200 opacity-70" :
                    s.status === "PENDING" ? "border-amber-300 bg-amber-50/30" :
                    "border-outline-variant"
                  }`}>
                    {/* Date badge */}
                    <div className={`rounded-xl px-4 py-3 text-center min-w-[70px] shrink-0 ${s.status === "CANCELLED" ? "bg-red-50" : "bg-primary/10"}`}>
                      <p className={`text-[10px] font-bold uppercase ${s.status === "CANCELLED" ? "text-red-400" : "text-primary"}`}>{s.date.split(" ")[0]}</p>
                      <p className={`text-2xl font-extrabold leading-none ${s.status === "CANCELLED" ? "text-red-400" : "text-primary"}`}>
                        {s.date.split(" ")[1]?.replace(",", "") ?? "--"}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-on-surface">{s.subject}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          s.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                          s.status === "PENDING"   ? "bg-amber-100 text-amber-700" :
                          s.status === "REJECTED"  ? "bg-red-100 text-red-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {s.status === "PENDING" ? "⏳ Awaiting Your Response" : s.status}
                        </span>
                        {s.monthlyPrice > 0 && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">₹{s.monthlyPrice}/mo</span>}
                      </div>
                      <p className="text-sm text-on-surface-variant">👦 {s.childName} &nbsp;·&nbsp; 👤 Parent: {s.parentName}</p>
                      <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <Clock size={11} className="text-primary" />{s.timeSlot}
                      </p>
                      {s.notes && (
                        <p className="text-xs text-primary/70 mt-1 italic flex items-center gap-1">
                          <MessageSquare size={10} /> {s.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      {s.status === "PENDING" ? (
                        /* ── Demo request: Accept / Reject ── */
                        <>
                          <button
                            onClick={() => handleSessionAction(s.id, "accept")}
                            disabled={actioning[s.id]}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-60">
                            {actioning[s.id]
                              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              : <CheckCircle size={15} />}
                            Accept
                          </button>
                          <button
                            onClick={() => handleSessionAction(s.id, "reject")}
                            disabled={actioning[s.id]}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-surface-container border border-outline-variant text-red-500 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-60">
                            <XCircle size={15} /> Decline
                          </button>
                        </>
                      ) : (
                        /* ── Confirmed: Zoom link + Notes ── */
                        <>
                          {s.status === "CONFIRMED" && (
                            s.zoomStartUrl ? (
                              <a href={s.zoomStartUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                                style={{ backgroundColor: "#2D8CFF" }}>
                                <Video size={14} /> Start
                              </a>
                            ) : s.zoomLink ? (
                              <a href={s.zoomLink} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                                style={{ backgroundColor: "#2D8CFF" }}>
                                <Video size={14} /> Join
                              </a>
                            ) : null
                          )}
                          <button
                            onClick={() => { setNoteOpen(s.id); setNoteText(s.notes ?? ""); }}
                            className="p-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
                            title="Add note">
                            <FileText size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full history table */}
            {sessions.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-on-surface-variant" /> All Sessions History
                </h3>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container">
                        {["Student","Subject","Parent","Date","Time","Status","Zoom"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s, i) => (
                        <tr key={s.id} className={`border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors ${i === sessions.length - 1 ? "border-b-0" : ""}`}>
                          <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">{s.childName}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{s.subject}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{s.parentName}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{s.date}</td>
                          <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{s.timeSlot}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              s.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                              s.status === "PENDING"   ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-600"
                            }`}>{s.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {(s.zoomStartUrl || s.zoomLink) && s.status !== "CANCELLED" ? (
                              <a href={s.zoomStartUrl || s.zoomLink!} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex items-center gap-1 whitespace-nowrap"
                                style={{ backgroundColor: "#2D8CFF" }}>
                                <Video size={11} /> Open
                              </a>
                            ) : <span className="text-xs text-on-surface-variant">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: STUDENTS
        ══════════════════════════════════════════ */}
        {section === "students" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface">My Students</h2>
              <p className="text-sm text-on-surface-variant mt-1">{students.length} unique student{students.length !== 1 ? "s" : ""} across all sessions</p>
            </div>

            {students.length === 0 ? (
              <EmptyState icon="👦" title="No students yet"
                desc="Students will appear here once sessions are assigned to you by the admin." />
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Total Students",    value: students.length,                                            icon: Users,    color: "text-primary",    bg: "bg-primary/10"   },
                    { label: "Subjects Covered",  value: Object.keys(subjectMap).length,                            icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50"    },
                    { label: "Confirmed Sessions",value: confirmedSessions.length,                                  icon: CheckCircle, color: "text-green-600", bg: "bg-green-50"  },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-card">
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}><Icon size={18} className={color} /></div>
                      <p className="text-xl font-bold text-on-surface font-display">{value}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Student cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(s => (
                    <StudentCard key={s.name} student={s} expanded />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: EARNINGS
        ══════════════════════════════════════════ */}
        {section === "earnings" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface">Earnings</h2>
              <p className="text-sm text-on-surface-variant mt-1">Session revenue from confirmed bookings</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Earned",    value: `₹${totalEarnings.toLocaleString("en-IN")}`, sub: "from confirmed sessions",          icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
                { label: "Confirmed",       value: confirmedSessions.length,                    sub: "fully confirmed sessions",          icon: CheckCircle, color: "text-primary",   bg: "bg-primary/10" },
                { label: "Free Demos",      value: sessions.filter(s => s.monthlyPrice === 0).length, sub: "₹0 introductory sessions",  icon: Star,        color: "text-orange-500",bg: "bg-orange-50" },
              ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-3`}><Icon size={22} className={color} /></div>
                  <p className="text-2xl font-bold text-on-surface font-display">{value}</p>
                  <p className="text-xs font-medium text-on-surface mt-0.5">{label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Monthly chart */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
              <h3 className="font-display font-bold text-on-surface text-base mb-5 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Monthly Earnings (last 6 months)
              </h3>
              <div className="flex items-end gap-3 h-40">
                {monthlyEarnings.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-primary">
                      {m.earnings > 0 ? `₹${(m.earnings/1000).toFixed(0)}k` : "0"}
                    </span>
                    <div className="w-full bg-primary/10 rounded-t-lg hover:bg-primary/30 group relative transition-colors cursor-pointer"
                      style={{ height: `${Math.max((m.earnings / maxEarnings) * 128, 4)}px` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {m.count} session{m.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session invoices */}
            <div>
              <h3 className="font-display font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Session Breakdown
              </h3>
              {sessions.length === 0 ? (
                <EmptyState icon="💰" title="No sessions yet" desc="Earnings will appear here once sessions are assigned to you." />
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] px-5 py-3 bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider gap-4">
                    <span>Subject / Student</span><span>Date</span><span>Rate</span><span>Status</span><span>Zoom</span>
                  </div>
                  {sessions.map((s, i) => (
                    <div key={s.id} className={`flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] px-5 py-4 gap-3 sm:gap-4 sm:items-center ${i < sessions.length - 1 ? "border-b border-outline-variant/50" : ""}`}>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{s.subject}</p>
                        <p className="text-xs text-on-surface-variant">Student: {s.childName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface">{s.date}</p>
                        <p className="text-xs text-on-surface-variant">{s.timeSlot}</p>
                      </div>
                      <div>
                        {s.monthlyPrice > 0
                          ? <span className="font-bold text-green-700">₹{s.monthlyPrice.toLocaleString("en-IN")}<span className="text-xs font-normal text-on-surface-variant">/mo</span></span>
                          : <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">FREE</span>}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        s.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                        s.status === "PENDING"   ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"
                      }`}>{s.status}</span>
                      <div>
                        {(s.zoomStartUrl || s.zoomLink) && s.status !== "CANCELLED" ? (
                          <a href={s.zoomStartUrl || s.zoomLink!} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex items-center gap-1 whitespace-nowrap"
                            style={{ backgroundColor: "#2D8CFF" }}>
                            <Video size={11} /> Open
                          </a>
                        ) : <span className="text-xs text-on-surface-variant">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex items-start gap-3">
              <AlertCircle size={18} className="text-on-surface-variant mt-0.5 shrink-0" />
              <p className="text-sm text-on-surface-variant">
                Payments are processed monthly by Zippy Minds. For queries contact <strong>zippymindsacademy@gmail.com</strong>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: MATERIALS
        ══════════════════════════════════════════ */}
        {section === "materials" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-on-surface">Materials &amp; Recordings</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Upload resources and recorded sessions for your students
                </p>
              </div>
              <div className="flex gap-2">
                {recTab === "materials" ? (
                  <button onClick={() => { setShowMatForm(v => !v); setMatUploadMsg(null); }}
                    className="btn-primary flex items-center gap-2 shrink-0">
                    <Upload size={16} /> Upload Material
                  </button>
                ) : (
                  <button onClick={() => { setShowRecForm(v => !v); setRecUploadMsg(null); }}
                    className="btn-primary flex items-center gap-2 shrink-0">
                    <Upload size={16} /> Add Recording
                  </button>
                )}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-surface-container rounded-2xl p-1 w-fit">
              {([["materials", FolderOpen, "Materials"], ["recordings", Play, "Recordings"]] as const).map(([id, Icon, label]) => (
                <button key={id} onClick={() => setRecTab(id as "materials" | "recordings")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    recTab === id ? "bg-surface-container-lowest shadow text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}>
                  <Icon size={15} /> {label}
                  <span className="text-[10px] font-bold bg-surface-container px-1.5 py-0.5 rounded-full text-on-surface-variant">
                    {id === "materials" ? materials.length : recordings.length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── MATERIALS TAB ── */}
            {recTab === "materials" && <>

            {/* Success/error banner */}
            {matUploadMsg && (
              <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 ${
                matUploadMsg.type === "ok" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                {matUploadMsg.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm font-semibold">{matUploadMsg.text}</span>
              </div>
            )}

            {/* Upload Form */}
            {showMatForm && (
              <div className="bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-card p-6">
                <h3 className="font-display font-bold text-on-surface mb-5 flex items-center gap-2">
                  <Upload size={18} className="text-primary" /> New Material
                </h3>
                <form onSubmit={handleUploadMaterial} className="space-y-4">

                  {/* Visibility toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Who can see this material? <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button"
                        onClick={() => setMatForm(f => ({ ...f, visibility: "individual" }))}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                          matForm.visibility === "individual"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                        }`}>
                        <User size={20} />
                        <span className="text-sm font-bold">Specific Student</span>
                        <span className="text-[10px] text-center leading-tight opacity-70">Only the selected student will see this</span>
                      </button>
                      <button type="button"
                        onClick={() => setMatForm(f => ({ ...f, visibility: "all", studentName: "" }))}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                          matForm.visibility === "all"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                        }`}>
                        <Users size={20} />
                        <span className="text-sm font-bold">All My Students</span>
                        <span className="text-[10px] text-center leading-tight opacity-70">Every student you teach can see this</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Student name — only shown for individual */}
                    {matForm.visibility === "individual" && (
                      <div>
                        <label className="block text-sm font-semibold text-on-surface mb-1.5">Student Name <span className="text-red-500">*</span></label>
                        <input
                          list="student-names-list"
                          value={matForm.studentName}
                          onChange={e => setMatForm(f => ({ ...f, studentName: e.target.value }))}
                          placeholder="Type or pick a student name"
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          required={matForm.visibility === "individual"}
                        />
                        <datalist id="student-names-list">
                          {Object.keys(studentMap).map(n => <option key={n} value={n} />)}
                        </datalist>
                      </div>
                    )}
                    <div className={matForm.visibility === "all" ? "sm:col-span-2" : ""}>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
                      <input
                        list="subject-list"
                        value={matForm.subject}
                        onChange={e => setMatForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="e.g. Mathematics"
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <datalist id="subject-list">
                        {Object.keys(subjectMap).map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Material Title <span className="text-red-500">*</span></label>
                    <input
                      value={matForm.title}
                      onChange={e => setMatForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Week 3 — Multiplication Practice Sheet"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={matForm.notes}
                      onChange={e => setMatForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Any instructions for the student or parent…"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">File <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${matFile ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50"}`}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp"
                        className="hidden"
                        id="mat-file-input"
                        onChange={e => setMatFile(e.target.files?.[0] ?? null)}
                      />
                      <label htmlFor="mat-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                        {matFile ? (
                          <>
                            <FileText size={28} className="text-primary" />
                            <span className="text-sm font-semibold text-primary">{matFile.name}</span>
                            <span className="text-xs text-on-surface-variant">{(matFile.size / 1024).toFixed(0)} KB · Click to change</span>
                          </>
                        ) : (
                          <>
                            <Upload size={28} className="text-on-surface-variant" />
                            <span className="text-sm font-semibold text-on-surface">Click to choose file</span>
                            <span className="text-xs text-on-surface-variant">PDF, Word, PPT, or image · Max 10 MB</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowMatForm(false)}
                      className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={matUploading} className="flex-1 btn-primary disabled:opacity-60 justify-center">
                      {matUploading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                      ) : (
                        <><Upload size={15} /> Upload</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Files",   value: materials.length,                                          icon: FileText,  color: "text-primary",    bg: "bg-primary/10"  },
                { label: "PDFs",          value: materials.filter(m => m.fileType === "PDF").length,        icon: FileText,  color: "text-red-600",    bg: "bg-red-50"      },
                { label: "Images",        value: materials.filter(m => m.fileType === "Image").length,      icon: Star,      color: "text-blue-600",   bg: "bg-blue-50"     },
                { label: "Students",      value: new Set(materials.map(m => m.studentName)).size,           icon: Users,     color: "text-green-600",  bg: "bg-green-50"    },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-card">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}><Icon size={18} className={color} /></div>
                  <p className="text-xl font-bold text-on-surface font-display">{value}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Student filter pills */}
            {materials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {["All", ...Array.from(new Set(materials.map(m => m.studentName)))].map(name => (
                  <button key={name} onClick={() => setMatStudentFilter(name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      matStudentFilter === name ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-primary/10"
                    }`}>
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Materials list */}
            {materials.length === 0 ? (
              <EmptyState icon="📁" title="No materials uploaded yet"
                desc="Upload PDFs, worksheets and resources for your students. They will be able to view and download them from their Learning Center." />
            ) : (
              <div className="space-y-3">
                {materials
                  .filter(m =>
                    matStudentFilter === "All" ||
                    m.visibility === "all" ||          // "all students" materials always show
                    m.studentName === matStudentFilter
                  )
                  .map(m => {
                    const fileIcon = m.fileType === "PDF" ? "📄" : m.fileType === "Image" ? "🖼️" : "📋";
                    const subjectStyle = getSubjectStyle(m.subject);
                    return (
                      <div key={m.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                          {fileIcon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-on-surface text-sm">{m.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">{m.fileType}</span>
                            {m.subject && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectStyle.bg} ${subjectStyle.color}`}>
                                {subjectStyle.icon} {m.subject}
                              </span>
                            )}
                            {m.visibility === "all" ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-0.5">
                                <Users size={9} /> All Students
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 flex items-center gap-0.5">
                                <User size={9} /> Individual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {m.visibility === "all"
                              ? <span>👥 Visible to <strong>all your students</strong></span>
                              : <span>👦 For: <strong>{m.studentName}</strong></span>
                            }
                            {m.fileSize && <> · {m.fileSize}</>}
                            {" · "}{fmtDate(m.createdAt)}
                          </p>
                          {m.notes && (
                            <p className="text-xs text-primary/70 mt-1 italic">{m.notes}</p>
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
                          <button onClick={() => handleDeleteMaterial(m.id)}
                            className="p-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            </> /* end materials tab */}

            {/* ── RECORDINGS TAB ── */}
            {recTab === "recordings" && <>

              {/* Success/error */}
              {recUploadMsg && (
                <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 ${
                  recUploadMsg.type === "ok" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {recUploadMsg.type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span className="text-sm font-semibold">{recUploadMsg.text}</span>
                </div>
              )}

              {/* Upload form */}
              {showRecForm && (
                <div className="bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-card p-6">
                  <h3 className="font-display font-bold text-on-surface mb-5 flex items-center gap-2">
                    <Play size={18} className="text-primary" /> Add Recorded Session
                  </h3>
                  <form onSubmit={handleUploadRecording} className="space-y-4">

                    {/* Visibility */}
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Who can watch this? <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-3">
                        {([["individual", User, "Specific Student", "Only the selected student can watch"], ["all", Users, "All My Students", "Every student you teach can watch"]] as const).map(([val, Icon, lbl, sub]) => (
                          <button key={val} type="button"
                            onClick={() => setRecForm(f => ({ ...f, visibility: val, studentName: val === "all" ? "" : f.studentName }))}
                            className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                              recForm.visibility === val ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                            }`}>
                            <Icon size={20} />
                            <span className="text-sm font-bold">{lbl}</span>
                            <span className="text-[10px] text-center leading-tight opacity-70">{sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {recForm.visibility === "individual" && (
                        <div>
                          <label className="block text-sm font-semibold text-on-surface mb-1.5">Student Name <span className="text-red-500">*</span></label>
                          <input list="rec-student-list" value={recForm.studentName}
                            onChange={e => setRecForm(f => ({ ...f, studentName: e.target.value }))}
                            placeholder="Pick a student" required
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                          <datalist id="rec-student-list">
                            {Object.keys(studentMap).map(n => <option key={n} value={n} />)}
                          </datalist>
                        </div>
                      )}
                      <div className={recForm.visibility === "all" ? "sm:col-span-2" : ""}>
                        <label className="block text-sm font-semibold text-on-surface mb-1.5">Subject</label>
                        <input list="rec-subject-list" value={recForm.subject}
                          onChange={e => setRecForm(f => ({ ...f, subject: e.target.value }))}
                          placeholder="e.g. Mathematics"
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        <datalist id="rec-subject-list">
                          {Object.keys(subjectMap).map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Title <span className="text-red-500">*</span></label>
                      <input value={recForm.title} onChange={e => setRecForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Session 5 — Division Practice"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Description (optional)</label>
                      <textarea rows={2} value={recForm.description}
                        onChange={e => setRecForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="What topics were covered in this session?"
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-1.5">Duration (optional)</label>
                      <input value={recForm.duration} onChange={e => setRecForm(f => ({ ...f, duration: e.target.value }))}
                        placeholder="e.g. 45:30"
                        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>

                    {/* Video source toggle */}
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Video Source <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 mb-3">
                        <button type="button" onClick={() => setRecForm(f => ({ ...f, useLink: true }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${recForm.useLink ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/40"}`}>
                          <LinkIcon size={14} /> Paste Link
                        </button>
                        <button type="button" onClick={() => setRecForm(f => ({ ...f, useLink: false }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${!recForm.useLink ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/40"}`}>
                          <Upload size={14} /> Upload File
                        </button>
                      </div>

                      {recForm.useLink ? (
                        <input value={recForm.videoUrl} onChange={e => setRecForm(f => ({ ...f, videoUrl: e.target.value }))}
                          placeholder="Zoom cloud link, Google Drive, YouTube, etc."
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      ) : (
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${recFile ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50"}`}>
                          <input type="file" accept="video/*" className="hidden" id="rec-file-input"
                            onChange={e => setRecFile(e.target.files?.[0] ?? null)} />
                          <label htmlFor="rec-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                            {recFile ? (
                              <><Play size={28} className="text-primary" />
                                <span className="text-sm font-semibold text-primary">{recFile.name}</span>
                                <span className="text-xs text-on-surface-variant">{(recFile.size / (1024*1024)).toFixed(1)} MB · Click to change</span></>
                            ) : (
                              <><Upload size={28} className="text-on-surface-variant" />
                                <span className="text-sm font-semibold text-on-surface">Click to choose video</span>
                                <span className="text-xs text-on-surface-variant">MP4, WebM, MOV · Max 500 MB</span></>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={() => setShowRecForm(false)}
                        className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={recUploading} className="flex-1 btn-primary disabled:opacity-60 justify-center">
                        {recUploading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {recForm.useLink ? "Saving…" : "Uploading…"}</>
                        ) : (
                          <><Upload size={15} /> Save Recording</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Recordings list */}
              {recordings.length === 0 ? (
                <EmptyState icon="🎬" title="No recordings yet"
                  desc="Add your Zoom session recordings so students can rewatch lessons anytime." />
              ) : (
                <div className="space-y-3">
                  {recordings.map(r => {
                    const subjectStyle = getSubjectStyle(r.subject);
                    return (
                      <div key={r.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Play size={22} className="text-primary" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-on-surface text-sm">{r.title}</span>
                            {r.subject && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${subjectStyle.bg} ${subjectStyle.color}`}>
                                {subjectStyle.icon} {r.subject}
                              </span>
                            )}
                            {r.visibility === "all" ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-0.5"><Users size={9} /> All Students</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 flex items-center gap-0.5"><User size={9} /> Individual</span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            {r.visibility === "all"
                              ? <span>👥 All students</span>
                              : <span>👦 <strong>{r.studentName}</strong></span>
                            }
                            {r.duration && <> · ⏱ {r.duration}</>}
                            {r.fileSize && <> · {r.fileSize}</>}
                            {" · "}{fmtDate(r.createdAt)}
                          </p>
                          {r.description && <p className="text-xs text-on-surface-variant mt-0.5 italic">{r.description}</p>}
                        </div>

                        {/* Actions — tutor can view but NOT delete */}
                        <div className="flex gap-2 shrink-0">
                          <a href={r.videoUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
                            style={{ backgroundColor: "#2D8CFF" }}>
                            <Play size={14} /> Watch
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">Only admins can delete recordings. Contact <strong>zippymindsacademy@gmail.com</strong> to remove a recording.</p>
              </div>

            </> /* end recordings tab */}

          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: PROFILE
        ══════════════════════════════════════════ */}
        {section === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface">My Profile</h2>
              <p className="text-sm text-on-surface-variant mt-1">Manage your tutor account details</p>
            </div>

            {/* Profile card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? "T"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display font-bold text-on-surface text-xl">{user?.name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                      approvalStatus === "PENDING"  ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {approvalStatus === "APPROVED" ? "✓ Verified Tutor" : approvalStatus === "PENDING" ? "⏳ Under Review" : "✗ Not Approved"}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{user?.email}</p>
                  <p className="text-sm text-on-surface-variant">{user?.phone ?? "No phone added"}</p>
                  <p className="text-xs text-on-surface-variant mt-2">Member since {fmtDate(user?.createdAt)}</p>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3 mb-6 bg-surface-container rounded-2xl p-4">
                {[
                  { label: "Sessions",  value: sessions.length   },
                  { label: "Students",  value: students.length   },
                  { label: "Subjects",  value: Object.keys(subjectMap).length },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-bold text-on-surface font-display">{value}</p>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                  </div>
                ))}
              </div>

              {/* Declared subjects (read-only) */}
              {(user?.subjects ?? []).length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Subjects I Teach</p>
                  <div className="flex flex-wrap gap-2">
                    {(user?.subjects ?? []).map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {!profileEdit ? (
                <button onClick={() => setProfileEdit(true)}
                  className="btn-primary w-full sm:w-auto">
                  Edit Profile
                </button>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
                    <input type="text" value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Phone Number</label>
                    <input type="tel" value={profileForm.phone ?? ""}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  </div>

                  {/* Subjects I Teach */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1">Subjects I Teach</label>
                    <p className="text-xs text-on-surface-variant mb-3">Select all subjects you are qualified to teach. New demo bookings for these subjects will be assigned to you.</p>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(s => {
                        const selected = profileForm.subjects.includes(s);
                        return (
                          <button key={s} type="button"
                            onClick={() => setProfileForm(f => ({
                              ...f,
                              subjects: selected
                                ? f.subjects.filter(x => x !== s)
                                : [...f.subjects, s],
                            }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:bg-surface-container"
                            }`}>
                            {selected ? "✓ " : ""}{s}
                          </button>
                        );
                      })}
                    </div>
                    {profileForm.subjects.length === 0 && (
                      <p className="text-xs text-on-surface-variant/60 mt-2 italic">No subjects selected — you won't be auto-assigned to new bookings</p>
                    )}
                  </div>

                  <div className="bg-surface-container rounded-xl px-4 py-3">
                    <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <Lock size={12} /> Email cannot be changed. Contact admin if needed.
                    </p>
                  </div>
                  {profileMsg && (
                    <p className={`text-sm font-semibold flex items-center gap-2 ${profileMsg === "Saved!" ? "text-green-600" : "text-red-600"}`}>
                      {profileMsg === "Saved!" ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {profileMsg}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setProfileEdit(false)}
                      className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={profileSaving} className="flex-1 btn-primary disabled:opacity-60">
                      {profileSaving ? "Saving…" : <><Save size={15} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account info */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
              <h3 className="font-display font-bold text-on-surface mb-4">Account Information</h3>
              <div className="space-y-3">
                {[
                  { label: "Role",             value: "Tutor",                     icon: User          },
                  { label: "Email",            value: user?.email ?? "—",           icon: Mail          },
                  { label: "Phone",            value: user?.phone ?? "Not added",   icon: Phone         },
                  { label: "Approval Status",  value: approvalStatus,              icon: CheckCircle   },
                  { label: "Member Since",     value: fmtDate(user?.createdAt),    icon: Award         },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/50 last:border-0">
                    <span className="text-sm text-on-surface-variant flex items-center gap-2">
                      <Icon size={14} className="text-on-surface-variant" /> {label}
                    </span>
                    <span className="text-sm font-semibold text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Add Note Modal ── */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNoteOpen(null)} />
          <div className="relative bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-on-surface flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Session Note
              </h3>
              <button onClick={() => setNoteOpen(null)} className="text-on-surface-variant hover:text-on-surface"><X size={20} /></button>
            </div>
            <textarea rows={4} value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note about this session (e.g. student progress, next topic)…"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setNoteOpen(null)} className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSaveNote} disabled={noteSaving} className="flex-1 btn-primary disabled:opacity-60">
                {noteSaving ? "Saving…" : <><Save size={14} /> Save Note</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StudentCard({ student, expanded }: {
  student: { name: string; parentName: string; parentEmail: string; sessions: TSession[]; subjects: Set<string> };
  expanded?: boolean;
}) {
  const confirmedCount = student.sessions.filter(s => s.status === "CONFIRMED").length;
  const lastSession = student.sessions[0];
  const subjects = [...student.subjects];

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {student.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-on-surface">{student.name}</p>
          <p className="text-xs text-on-surface-variant truncate">Parent: {student.parentName}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-on-surface-variant mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={11} className="text-primary" />
          {student.sessions.length} session{student.sessions.length !== 1 ? "s" : ""}
          {confirmedCount > 0 && <span className="text-green-600 font-semibold">({confirmedCount} confirmed)</span>}
        </div>
        {lastSession && (
          <div className="flex items-center gap-2">
            <Clock size={11} className="text-primary" /> Last: {lastSession.date}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {subjects.map(subj => {
          const { bg, icon, color } = getSubjectStyle(subj);
          return (
            <span key={subj} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bg} ${color} flex items-center gap-0.5`}>
              {icon} {subj}
            </span>
          );
        })}
      </div>

      {expanded && lastSession?.zoomLink && (
        <a href={lastSession.zoomStartUrl || lastSession.zoomLink} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full font-bold text-xs py-2.5 rounded-xl text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#2D8CFF" }}>
          <Video size={13} /> Join Latest Session
        </a>
      )}
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-12 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h4 className="font-bold text-on-surface mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant max-w-xs">{desc}</p>
    </div>
  );
}

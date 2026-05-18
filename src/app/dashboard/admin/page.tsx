"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  BarChart3, Shield, LogOut, Menu, X, TrendingUp,
  CheckCircle, XCircle, Clock, DollarSign, Eye, Search,
  AlertTriangle, Settings, MessageSquare, Calendar, Bell,
  Trash2, RefreshCw, Star, MapPin, Phone, Mail, Globe,
  Lock, ToggleLeft, ToggleRight, Send, ChevronDown, Filter,
  Download, Plus, Edit2, Zap, TrendingDown, Package,
} from "lucide-react";

type Section =
  | "overview" | "users" | "tutors" | "courses"
  | "sessions" | "payments" | "analytics" | "support" | "settings";

// ── Mock / seed data ─────────────────────────────────────────────────────────

const mockTutors = [
  { id: 1, name: "Dr. Arun Mishra",  subject: "Mathematics", exp: "5 yrs", location: "Lucknow",     applied: "2 days ago", docs: true  },
  { id: 2, name: "Pooja Nair",       subject: "Biology",     exp: "7 yrs", location: "Kochi",        applied: "3 days ago", docs: true  },
  { id: 3, name: "Suresh Patel",     subject: "Economics",   exp: "4 yrs", location: "Surat",        applied: "1 day ago",  docs: false },
  { id: 4, name: "Lakshmi Iyer",     subject: "English",     exp: "9 yrs", location: "Coimbatore",   applied: "5 days ago", docs: true  },
];

const mockCourses = [
  { id: 1, name: "Phonics",          tutors: 12, students: 340, status: "active",   price: 199 },
  { id: 2, name: "Mathematics",      tutors: 18, students: 520, status: "active",   price: 229 },
  { id: 3, name: "English Grammar",  tutors: 15, students: 410, status: "active",   price: 219 },
  { id: 4, name: "Public Speaking",  tutors: 8,  students: 210, status: "active",   price: 219 },
  { id: 5, name: "Coding",           tutors: 6,  students: 180, status: "active",   price: 249 },
  { id: 6, name: "Science",          tutors: 10, students: 290, status: "active",   price: 229 },
  { id: 7, name: "Hindi",            tutors: 7,  students: 160, status: "inactive", price: 199 },
  { id: 8, name: "Creative Arts",    tutors: 5,  students: 120, status: "active",   price: 199 },
];

const mockPayments = [
  { id: 1, parent: "Sarah M.",     tutor: "Dr. Priya S.",  amount: 1999, subject: "Mathematics", status: "success",  date: "May 18, 2026" },
  { id: 2, parent: "James A.",     tutor: "Rahul V.",      amount: 1799, subject: "Physics",      status: "success",  date: "May 18, 2026" },
  { id: 3, parent: "Emily C.",     tutor: "Dr. Meera P.",  amount: 1799, subject: "Biology",      status: "refunded", date: "May 17, 2026" },
  { id: 4, parent: "Mohammed A.",  tutor: "Dr. Vikram N.", amount: 2299, subject: "Chemistry",    status: "success",  date: "May 17, 2026" },
  { id: 5, parent: "Priya K.",     tutor: "Ms. Ananya S.", amount: 1999, subject: "Phonics",      status: "success",  date: "May 16, 2026" },
  { id: 6, parent: "Liu W.",       tutor: "Mr. Arjun M.",  amount: 2499, subject: "Coding",       status: "pending",  date: "May 16, 2026" },
  { id: 7, parent: "Ana R.",       tutor: "Ms. Kavya N.",  amount: 2199, subject: "Speaking",     status: "success",  date: "May 15, 2026" },
];

const mockSupport = [
  { id: 1, from: "Sarah M.",    email: "sarah@example.com", subject: "Zoom link not working",        message: "The Zoom link for today's session is not opening. Please help urgently.", priority: "high",   status: "open",   time: "10 mins ago" },
  { id: 2, from: "James A.",    email: "james@example.com", subject: "Rescheduling request",          message: "I need to reschedule tomorrow's session to next week due to travel.",   priority: "medium", status: "open",   time: "1 hr ago"   },
  { id: 3, from: "Emily C.",    email: "emily@example.com", subject: "Refund not received",           message: "I cancelled my session 5 days ago but haven't received the refund yet.", priority: "high",   status: "open",   time: "2 hrs ago"  },
  { id: 4, from: "Mohammed A.", email: "moh@example.com",   subject: "Change tutor request",          message: "I'd like to switch to a different tutor for Mathematics.",               priority: "low",    status: "open",   time: "3 hrs ago"  },
  { id: 5, from: "Liu W.",      email: "liu@example.com",   subject: "Payment failed",                message: "My payment keeps failing at checkout. I've tried 3 times.",              priority: "high",   status: "open",   time: "4 hrs ago"  },
  { id: 6, from: "Ana R.",      email: "ana@example.com",   subject: "Technical issue during class",  message: "There was audio cut out during the session. Can we get a makeup class?", priority: "medium", status: "open",   time: "Yesterday"  },
  { id: 7, from: "Tom B.",      email: "tom@example.com",   subject: "Curriculum question",           message: "Can you share what topics will be covered in the Phonics course?",       priority: "low",    status: "closed", time: "Yesterday"  },
];

const analyticsData = {
  monthly: [
    { month: "Dec", sessions: 820,  revenue: 2800000 },
    { month: "Jan", sessions: 940,  revenue: 3200000 },
    { month: "Feb", sessions: 1020, revenue: 3500000 },
    { month: "Mar", sessions: 1180, revenue: 4100000 },
    { month: "Apr", sessions: 1090, revenue: 3800000 },
    { month: "May", sessions: 1284, revenue: 4500000 },
  ],
  topSubjects:   [
    { name: "Mathematics",    pct: 82, count: 520 },
    { name: "English",        pct: 68, count: 410 },
    { name: "Phonics",        pct: 56, count: 340 },
    { name: "Science",        pct: 48, count: 290 },
    { name: "Public Speaking",pct: 35, count: 210 },
  ],
  topCountries: [
    { name: "United Kingdom", pct: 34, flag: "🇬🇧" },
    { name: "United States",  pct: 28, flag: "🇺🇸" },
    { name: "Canada",         pct: 16, flag: "🇨🇦" },
    { name: "Australia",      pct: 12, flag: "🇦🇺" },
    { name: "UAE",            pct: 10, flag: "🇦🇪" },
  ],
};

// ── Types ────────────────────────────────────────────────────────────────────
interface DBUser    { id: string; name: string; email: string; phone?: string | null; role: string; createdAt: string; }
interface DBBooking { id: string; parentName: string; parentEmail: string; childName: string; subject: string; tutorName: string; date: string; timeSlot: string; status: string; zoomLink?: string | null; createdAt: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [section,     setSection]     = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users,       setUsers]       = useState<DBUser[]>([]);
  const [sessions,    setSessions]    = useState<DBBooking[]>([]);
  const [loading,     setLoading]     = useState(true);

  // filters
  const [userSearch,    setUserSearch]    = useState("");
  const [userRoleFilter,setUserRoleFilter]= useState("All");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [supportFilter, setSupportFilter] = useState("All");

  // interactive state
  const [tutorActions,    setTutorActions]    = useState<Record<number, "approved" | "rejected" | null>>({1:null,2:null,3:null,4:null});
  const [replyOpen,       setReplyOpen]       = useState<number | null>(null);
  const [replyText,       setReplyText]       = useState("");
  const [ticketStatus,    setTicketStatus]    = useState<Record<number, string>>({1:"open",2:"open",3:"open",4:"open",5:"open",6:"open",7:"closed"});
  const [settings,        setSettings]        = useState({ siteName:"Zippy Minds Academy", email:"hello@zippymindsacademy.com", phone:"+91 99999 99999", zoomEnabled:true, emailNotifications:true, maintenanceMode:false, autoApprove:false });
  const [courseStatus,    setCourseStatus]    = useState<Record<number,string>>(Object.fromEntries(mockCourses.map(c=>[c.id,c.status])));
  const [settingsSaved,   setSettingsSaved]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/sessions").then(r => r.json()),
    ]).then(([u, s]) => {
      if (u.users)    setUsers(u.users);
      if (s.bookings) setSessions(s.bookings);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/admin-login");
  };

  const handleTutor = (id: number, action: "approved" | "rejected") =>
    setTutorActions(p => ({ ...p, [id]: action }));

  const handleSessionStatus = async (bookingId: string, status: string) => {
    await fetch("/api/admin/sessions", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ bookingId, status }) });
    setSessions(s => s.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const saveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const navItems: { id: Section; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: "overview",  icon: LayoutDashboard, label: "Overview"        },
    { id: "users",     icon: Users,           label: "Users"           },
    { id: "tutors",    icon: GraduationCap,   label: "Tutor Approvals", badge: Object.values(tutorActions).filter(v=>v===null).length },
    { id: "courses",   icon: BookOpen,        label: "Courses"         },
    { id: "sessions",  icon: Calendar,        label: "Sessions"        },
    { id: "payments",  icon: CreditCard,      label: "Payments"        },
    { id: "analytics", icon: BarChart3,       label: "Analytics"       },
    { id: "support",   icon: MessageSquare,   label: "Support",         badge: Object.values(ticketStatus).filter(v=>v==="open").length },
    { id: "settings",  icon: Settings,        label: "Settings"        },
  ];

  const sectionTitle: Record<Section,string> = {
    overview:"Platform Overview", users:"User Management", tutors:"Tutor Approvals",
    courses:"Course Management", sessions:"Session Management", payments:"Payment Transactions",
    analytics:"Analytics & Insights", support:"Support Tickets", settings:"Platform Settings",
  };

  // derived
  const filteredUsers = users.filter(u =>
    (userRoleFilter === "All" || u.role === userRoleFilter) &&
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );
  const filteredSessions = sessions.filter(b =>
    (sessionFilter === "All" || b.status === sessionFilter) &&
    (b.subject.toLowerCase().includes(sessionSearch.toLowerCase()) ||
     b.childName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
     b.tutorName.toLowerCase().includes(sessionSearch.toLowerCase()))
  );
  const filteredPayments = mockPayments.filter(p => paymentFilter === "All" || p.status === paymentFilter);
  const filteredSupport  = mockSupport.filter(t => supportFilter === "All" || t.status === supportFilter);

  const totalRevenue = mockPayments.filter(p=>p.status==="success").reduce((a,b)=>a+b.amount,0);
  const maxSessions  = Math.max(...analyticsData.monthly.map(m=>m.sessions));

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="relative w-10 h-10 bg-white rounded-xl p-0.5 shrink-0">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Zippy Minds</p>
            <p className="text-xs text-red-400 font-semibold flex items-center gap-1"><Shield size={10} /> Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(({ id, icon: Icon, label, badge }) => (
            <button key={id} onClick={() => { setSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                section === id ? "bg-white/15 text-white" : "text-gray-400 hover:bg-white/8 hover:text-white"
              }`}>
              <Icon size={17} />
              <span className="flex-1 text-sm">{label}</span>
              {badge && badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shrink-0">{badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/8 hover:text-white transition-all">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs shrink-0">A</div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white truncate">Admin</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
            <LogOut size={15} className="shrink-0" />
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Shield size={15} className="text-red-500" /> {sectionTitle[section]}
              </h1>
              <p className="text-xs text-gray-400">Zippy Minds Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-gray-50" />
            </div>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 border border-gray-200">
              <Bell size={17} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 space-y-6 overflow-auto">

          {/* ══ OVERVIEW ══ */}
          {section === "overview" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:"Total Users",       value: users.length || "—", sub:`${users.filter(u=>u.role==="PARENT").length} parents · ${users.filter(u=>u.role==="TUTOR").length} tutors`, icon:Users,         color:"blue"   },
                  { label:"Total Sessions",    value: sessions.length || "—", sub:`${sessions.filter(s=>s.status==="CONFIRMED").length} confirmed`,  icon:Calendar,     color:"purple" },
                  { label:"Revenue (Total)",   value:`₹${(totalRevenue).toLocaleString("en-IN")}`, sub:"from paid sessions",                          icon:DollarSign,   color:"green"  },
                  { label:"Pending Approvals", value: Object.values(tutorActions).filter(v=>v===null).length, sub:"tutor applications",              icon:AlertTriangle,color:"yellow" },
                ].map(({ label,value,sub,icon:Icon,color }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      color==="blue"?"bg-blue-50 text-blue-600":color==="purple"?"bg-purple-50 text-purple-600":
                      color==="green"?"bg-green-50 text-green-600":"bg-yellow-50 text-yellow-600"}`}>
                      <Icon size={19} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Recent sessions from DB */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Recent Bookings</h2>
                  <button onClick={() => setSection("sessions")} className="text-sm text-blue-600 hover:underline">View all →</button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
                ) : sessions.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">No bookings yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 text-left">
                        {["Student","Subject","Tutor","Date","Status"].map(h=>(
                          <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {sessions.slice(0,6).map(b => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{b.childName}</td>
                            <td className="px-5 py-3.5 text-gray-600">{b.subject}</td>
                            <td className="px-5 py-3.5 text-gray-600">{b.tutorName}</td>
                            <td className="px-5 py-3.5 text-gray-500">{b.date}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Tutor approvals preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">Pending Tutor Approvals</h2>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {Object.values(tutorActions).filter(v=>v===null).length} pending
                    </span>
                  </div>
                  <button onClick={() => setSection("tutors")} className="text-sm text-blue-600 hover:underline">View all →</button>
                </div>
                <TutorTable tutors={mockTutors} actions={tutorActions} onAction={handleTutor} preview />
              </div>
            </>
          )}

          {/* ══ USERS ══ */}
          {section === "users" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <h2 className="font-bold text-gray-900">All Users ({users.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search name / email..."
                      className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-52" />
                  </div>
                  {["All","PARENT","TUTOR","ADMIN"].map(r=>(
                    <button key={r} onClick={()=>setUserRoleFilter(r)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${userRoleFilter===r?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{r}</button>
                  ))}
                </div>
              </div>
              {loading ? <Spinner /> : filteredUsers.length === 0 ? <Empty label="No users found" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-left">
                      {["User","Email","Phone","Role","Joined","Actions"].map(h=>(
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                u.role==="ADMIN"?"bg-red-500":u.role==="TUTOR"?"bg-purple-500":"bg-blue-500"}`}>
                                {u.name[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                          <td className="px-5 py-3.5 text-gray-500">{u.phone ?? "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.role==="ADMIN"?"bg-red-100 text-red-600":u.role==="TUTOR"?"bg-purple-100 text-purple-600":"bg-blue-100 text-blue-600"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"><Eye size={14} /></button>
                              <button className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ TUTOR APPROVALS ══ */}
          {section === "tutors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"Pending",  value:Object.values(tutorActions).filter(v=>v===null).length,     color:"yellow" },
                  { label:"Approved", value:Object.values(tutorActions).filter(v=>v==="approved").length,color:"green"  },
                  { label:"Rejected", value:Object.values(tutorActions).filter(v=>v==="rejected").length,color:"red"   },
                ].map(({ label,value,color }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <p className={`text-3xl font-bold ${color==="yellow"?"text-yellow-500":color==="green"?"text-green-600":"text-red-500"}`}>{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Tutor Applications</h2>
                </div>
                <TutorTable tutors={mockTutors} actions={tutorActions} onAction={handleTutor} />
              </div>
            </div>
          )}

          {/* ══ COURSES ══ */}
          {section === "courses" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">All Courses ({mockCourses.length})</h2>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  <Plus size={15} /> Add Course
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-left">
                    {["Course","Tutors","Students","Price / Month","Status","Actions"].map(h=>(
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockCourses.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                              <BookOpen size={16} className="text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{c.tutors}</td>
                        <td className="px-5 py-4 text-gray-600">{c.students}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">₹{c.price}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => setCourseStatus(p=>({...p,[c.id]:p[c.id]==="active"?"inactive":"active"}))}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                              courseStatus[c.id]==="active"?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                            {courseStatus[c.id]==="active"?<ToggleRight size={14}/>:<ToggleLeft size={14}/>}
                            {courseStatus[c.id]==="active"?"Active":"Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 size={14}/></button>
                            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"><Eye size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SESSIONS ══ */}
          {section === "sessions" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <h2 className="font-bold text-gray-900">All Sessions ({sessions.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={sessionSearch} onChange={e=>setSessionSearch(e.target.value)} placeholder="Search..."
                      className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-44" />
                  </div>
                  {["All","CONFIRMED","PENDING","CANCELLED"].map(s=>(
                    <button key={s} onClick={()=>setSessionFilter(s)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${sessionFilter===s?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
                  ))}
                </div>
              </div>
              {loading ? <Spinner /> : filteredSessions.length===0 ? <Empty label="No sessions found" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-left">
                      {["Student","Subject","Tutor","Date","Time","Status","Actions"].map(h=>(
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSessions.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-gray-900">{b.childName}</td>
                          <td className="px-5 py-3.5 text-gray-600">{b.subject}</td>
                          <td className="px-5 py-3.5 text-gray-600">{b.tutorName}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.date}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.timeSlot}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {b.status !== "CONFIRMED" && (
                                <button onClick={()=>handleSessionStatus(b.id,"CONFIRMED")}
                                  className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors" title="Confirm">
                                  <CheckCircle size={14}/>
                                </button>
                              )}
                              {b.status !== "CANCELLED" && (
                                <button onClick={()=>handleSessionStatus(b.id,"CANCELLED")}
                                  className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Cancel">
                                  <XCircle size={14}/>
                                </button>
                              )}
                              {b.zoomLink && (
                                <a href={b.zoomLink} target="_blank" rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors" title="Open Zoom">
                                  <Eye size={14}/>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ PAYMENTS ══ */}
          {section === "payments" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Total Revenue",  value:`₹${totalRevenue.toLocaleString("en-IN")}`, icon:TrendingUp,  color:"green" },
                  { label:"Successful",     value:mockPayments.filter(p=>p.status==="success").length,  icon:CheckCircle,color:"blue" },
                  { label:"Refunded",       value:mockPayments.filter(p=>p.status==="refunded").length, icon:RefreshCw,  color:"red" },
                  { label:"Pending",        value:mockPayments.filter(p=>p.status==="pending").length,  icon:Clock,      color:"yellow" },
                ].map(({ label,value,icon:Icon,color }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      color==="green"?"bg-green-50 text-green-600":color==="blue"?"bg-blue-50 text-blue-600":
                      color==="red"?"bg-red-50 text-red-500":"bg-yellow-50 text-yellow-600"}`}>
                      <Icon size={19} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Transactions</h2>
                  <div className="flex items-center gap-2">
                    {["All","success","refunded","pending"].map(f=>(
                      <button key={f} onClick={()=>setPaymentFilter(f)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${paymentFilter===f?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-left">
                      {["#","Parent","Tutor","Subject","Amount","Date","Status"].map(h=>(
                        <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPayments.map(tx=>(
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5 text-gray-400 text-xs">#{tx.id}</td>
                          <td className="px-5 py-3.5 font-medium text-gray-900">{tx.parent}</td>
                          <td className="px-5 py-3.5 text-gray-600">{tx.tutor}</td>
                          <td className="px-5 py-3.5 text-gray-600">{tx.subject}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">₹{tx.amount.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{tx.date}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              tx.status==="success"?"bg-green-100 text-green-700":
                              tx.status==="refunded"?"bg-red-100 text-red-600":"bg-yellow-100 text-yellow-700"}`}>
                              {tx.status==="success"?"✓ Success":tx.status==="refunded"?"↩ Refunded":"⏳ Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {section === "analytics" && (
            <div className="space-y-5">
              {/* Session chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600"/> Monthly Sessions</h2>
                <div className="flex items-end gap-3 h-44">
                  {analyticsData.monthly.map(m=>(
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-blue-600">{m.sessions}</span>
                      <div className="w-full bg-blue-100 rounded-t-lg transition-all hover:bg-blue-500 group relative"
                        style={{ height:`${(m.sessions/maxSessions)*160}px` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          ₹{(m.revenue/100000).toFixed(1)}L revenue
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Top subjects */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Top Subjects</h2>
                  <div className="space-y-4">
                    {analyticsData.topSubjects.map(s=>(
                      <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-700">{s.name}</span>
                          <span className="text-gray-500">{s.count} students</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width:`${s.pct}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top countries */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Students by Country</h2>
                  <div className="space-y-4">
                    {analyticsData.topCountries.map(c=>(
                      <div key={c.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-gray-700">{c.flag} {c.name}</span>
                          <span className="text-gray-500">{c.pct}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{width:`${c.pct}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Avg Session/User",   value:"3.2",   icon:Star,         color:"yellow" },
                  { label:"Retention Rate",      value:"78%",   icon:TrendingUp,   color:"green"  },
                  { label:"Avg Rating",          value:"4.8★",  icon:Star,         color:"yellow" },
                  { label:"Demo → Paid Conv.",   value:"62%",   icon:Zap,          color:"blue"   },
                ].map(({ label,value,icon:Icon,color })=>(
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <p className={`text-2xl font-bold ${color==="green"?"text-green-600":color==="blue"?"text-blue-600":"text-yellow-500"}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ SUPPORT ══ */}
          {section === "support" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {["All","open","closed"].map(f=>(
                  <button key={f} onClick={()=>setSupportFilter(f)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${supportFilter===f?"bg-blue-600 text-white":"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                    {f.charAt(0).toUpperCase()+f.slice(1)} {f==="open"?`(${Object.values(ticketStatus).filter(v=>v==="open").length})`:f==="closed"?`(${Object.values(ticketStatus).filter(v=>v==="closed").length})`:""}
                  </button>
                ))}
              </div>
              {filteredSupport.map(ticket=>(
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        ticket.priority==="high"?"bg-red-500":ticket.priority==="medium"?"bg-yellow-500":"bg-gray-400"}`}>
                        {ticket.from[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{ticket.from}</span>
                          <span className="text-xs text-gray-400">{ticket.email}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.priority==="high"?"bg-red-100 text-red-600":ticket.priority==="medium"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-600"}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticketStatus[ticket.id]==="open"?"bg-green-100 text-green-600":"bg-gray-100 text-gray-500"}`}>
                            {ticketStatus[ticket.id]==="open"?"OPEN":"CLOSED"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ticket.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{ticket.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={()=>setReplyOpen(replyOpen===ticket.id?null:ticket.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                        <Send size={12}/> Reply
                      </button>
                      <button onClick={()=>setTicketStatus(p=>({...p,[ticket.id]:p[ticket.id]==="open"?"closed":"open"}))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                          ticketStatus[ticket.id]==="open"
                            ?"bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            :"bg-green-50 text-green-600 border-green-200 hover:bg-green-100"}`}>
                        {ticketStatus[ticket.id]==="open"?"Close":"Reopen"}
                      </button>
                    </div>
                  </div>
                  {replyOpen === ticket.id && (
                    <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                      <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
                        placeholder={`Reply to ${ticket.from}...`} rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>{setReplyOpen(null);setReplyText("");setTicketStatus(p=>({...p,[ticket.id]:"closed"}));}}
                          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                          <Send size={12}/> Send & Close
                        </button>
                        <button onClick={()=>setReplyOpen(null)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section === "settings" && (
            <div className="space-y-5 max-w-3xl">
              {settingsSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle size={16}/> Settings saved successfully!
                </div>
              )}

              {/* General */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Globe size={17} className="text-blue-600"/> General Settings</h2>
                <div className="space-y-4">
                  {[
                    { label:"Platform Name",  key:"siteName", type:"text" },
                    { label:"Contact Email",  key:"email",    type:"email" },
                    { label:"Phone Number",   key:"phone",    type:"tel" },
                  ].map(({ label,key,type })=>(
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <input type={type} value={(settings as Record<string,string|boolean>)[key] as string}
                        onChange={e=>setSettings(p=>({...p,[key]:e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Settings size={17} className="text-blue-600"/> Platform Controls</h2>
                <div className="space-y-4">
                  {[
                    { label:"Zoom Auto-Generation",     key:"zoomEnabled",          desc:"Auto-create Zoom meeting on every booking" },
                    { label:"Email Notifications",       key:"emailNotifications",   desc:"Send OTP and booking confirmation emails" },
                    { label:"Auto-Approve Tutors",       key:"autoApprove",          desc:"Skip manual review for new tutor sign-ups" },
                    { label:"Maintenance Mode",          key:"maintenanceMode",       desc:"Show maintenance page to all visitors" },
                  ].map(({ label,key,desc })=>(
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <button onClick={()=>setSettings(p=>({...p,[key]:!p[key as keyof typeof p]}))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${(settings as unknown as Record<string,boolean>)[key]?"bg-blue-600":"bg-gray-300"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${(settings as unknown as Record<string,boolean>)[key]?"left-6":"left-0.5"}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                <h2 className="font-bold text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={17}/> Danger Zone</h2>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                    🗑️ Clear all session cache
                  </button>
                  <button className="w-full text-left px-4 py-3 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                    ⚠️ Reset demo bookings (dev only)
                  </button>
                </div>
              </div>

              <button onClick={saveSettings}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-sm">
                Save All Settings
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
      status==="CONFIRMED"?"bg-green-100 text-green-700":
      status==="PENDING"  ?"bg-yellow-100 text-yellow-700":
      status==="CANCELLED"?"bg-red-100 text-red-600":
                            "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function TutorTable({ tutors, actions, onAction, preview }: {
  tutors: typeof mockTutors;
  actions: Record<number, "approved" | "rejected" | null>;
  onAction: (id: number, a: "approved" | "rejected") => void;
  preview?: boolean;
}) {
  const list = preview ? tutors.slice(0, 3) : tutors;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50 text-left">
          {["Tutor","Subject","Exp.","Location","Documents","Applied","Actions"].map(h=>(
            <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-gray-50">
          {list.map(t => {
            const action = actions[t.id];
            return (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {t.name[0]}
                    </div>
                    <span className="font-semibold text-gray-900">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{t.subject}</td>
                <td className="px-5 py-4 text-gray-600">{t.exp}</td>
                <td className="px-5 py-4 text-gray-500 flex items-center gap-1"><MapPin size={11}/>{t.location}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.docs?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>
                    {t.docs ? "✓ Complete" : "✗ Missing"}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">{t.applied}</td>
                <td className="px-5 py-4">
                  {action === null ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => onAction(t.id, "approved")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                        <CheckCircle size={12}/> Approve
                      </button>
                      <button onClick={() => onAction(t.id, "rejected")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                        <XCircle size={12}/> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${action==="approved"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>
                      {action==="approved"?"✓ Approved":"✗ Rejected"}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
}
function Empty({ label }: { label: string }) {
  return <p className="text-center text-gray-400 py-12 text-sm">{label}</p>;
}

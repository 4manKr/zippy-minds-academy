"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  BarChart3, Shield, LogOut, Menu, X,
  CheckCircle, XCircle, Clock, DollarSign, Eye, Search,
  AlertTriangle, Settings, MessageSquare, Calendar, Bell,
  Trash2, TrendingUp, Send, ToggleLeft, ToggleRight, Plus, Edit2, Zap,
  MapPin, RefreshCw, Save,
} from "lucide-react";

type Section = "overview"|"users"|"tutors"|"courses"|"sessions"|"payments"|"analytics"|"support"|"settings";

// ── Types ────────────────────────────────────────────────────────────────────
interface DBUser    { id:string; name:string; email:string; phone?:string|null; role:string; approvalStatus?:string; createdAt:string; }
interface DBBooking { id:string; parentName:string; parentEmail:string; childName:string; subject:string; tutorName:string; date:string; timeSlot:string; status:string; monthlyPrice:number; zoomLink?:string|null; createdAt:string; }
interface DBCourse  { id:string; name:string; description:string; price:number; status:string; }
interface DBTicket  { id:string; from:string; email:string; subject:string; message:string; priority:string; status:string; reply?:string|null; createdAt:string; }
interface Analytics { monthly:{month:string;sessions:number;revenue:number}[]; topSubjects:{name:string;count:number;pct:number}[]; totalSessions:number; confirmedSessions:number; totalRevenue:number; totalParents:number; totalTutors:number; totalUsers:number; }
interface Settings  { siteName:string; contactEmail:string; phone:string; zoomEnabled:string; emailNotifications:string; autoApprove:string; maintenanceMode:string; }

// mock payments (no payment table yet)
const mockPayments = [
  { id:1, parent:"Sarah M.",    tutor:"Dr. Priya S.",  amount:1999, subject:"Mathematics", status:"success",  date:"May 18, 2026" },
  { id:2, parent:"James A.",    tutor:"Rahul V.",       amount:1799, subject:"Physics",     status:"success",  date:"May 18, 2026" },
  { id:3, parent:"Emily C.",    tutor:"Dr. Meera P.",   amount:1799, subject:"Biology",     status:"refunded", date:"May 17, 2026" },
  { id:4, parent:"Mohammed A.", tutor:"Dr. Vikram N.",  amount:2299, subject:"Chemistry",   status:"success",  date:"May 17, 2026" },
  { id:5, parent:"Priya K.",    tutor:"Ms. Ananya S.",  amount:1999, subject:"Phonics",     status:"success",  date:"May 16, 2026" },
  { id:6, parent:"Liu W.",      tutor:"Mr. Arjun M.",   amount:2499, subject:"Coding",      status:"pending",  date:"May 16, 2026" },
  { id:7, parent:"Ana R.",      tutor:"Ms. Kavya N.",   amount:2199, subject:"Speaking",    status:"success",  date:"May 15, 2026" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [section,      setSection]      = useState<Section>("overview");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // real data
  const [users,     setUsers]     = useState<DBUser[]>([]);
  const [sessions,  setSessions]  = useState<DBBooking[]>([]);
  const [tutors,    setTutors]    = useState<DBUser[]>([]);
  const [courses,   setCourses]   = useState<DBCourse[]>([]);
  const [tickets,   setTickets]   = useState<DBTicket[]>([]);
  const [analytics, setAnalytics] = useState<Analytics|null>(null);
  const [dbSettings,setDbSettings]= useState<Settings>({ siteName:"", contactEmail:"", phone:"", zoomEnabled:"true", emailNotifications:"true", autoApprove:"false", maintenanceMode:"false" });
  const [loading,   setLoading]   = useState<Record<string,boolean>>({});

  // UI state
  const [userSearch,     setUserSearch]     = useState("");
  const [userRole,       setUserRole]       = useState("All");
  const [sessionSearch,  setSessionSearch]  = useState("");
  const [sessionFilter,  setSessionFilter]  = useState("All");
  const [payFilter,      setPayFilter]      = useState("All");
  const [supportFilter,  setSupportFilter]  = useState("All");
  const [replyOpen,      setReplyOpen]      = useState<string|null>(null);
  const [replyText,      setReplyText]      = useState("");
  const [settingsSaved,  setSettingsSaved]  = useState(false);
  const [newCourse,      setNewCourse]      = useState({ name:"", description:"", price:"199" });
  const [addingCourse,   setAddingCourse]   = useState(false);

  const setLoad = (key: string, v: boolean) => setLoading(p=>({...p,[key]:v}));

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoad("init", true);
    const [u,s,t,c,tk,an,st] = await Promise.all([
      fetch("/api/admin/users").then(r=>r.json()),
      fetch("/api/admin/sessions").then(r=>r.json()),
      fetch("/api/admin/tutors").then(r=>r.json()),
      fetch("/api/admin/courses").then(r=>r.json()),
      fetch("/api/admin/support").then(r=>r.json()),
      fetch("/api/admin/analytics").then(r=>r.json()),
      fetch("/api/admin/settings").then(r=>r.json()),
    ]);
    if (u.users)    setUsers(u.users);
    if (s.bookings) setSessions(s.bookings);
    if (t.tutors)   setTutors(t.tutors);
    if (c.courses)  setCourses(c.courses);
    if (tk.tickets) setTickets(tk.tickets);
    if (an.monthly) setAnalytics(an);
    if (st.settings) setDbSettings(s2 => ({ ...s2, ...st.settings }));
    setLoad("init", false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/auth/admin-login");
  };

  // ── Tutor approve/reject ──────────────────────────────────────────────────
  const handleTutorAction = async (tutorId: string, approvalStatus: "APPROVED"|"REJECTED") => {
    await fetch("/api/admin/tutors", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tutorId, approvalStatus }) });
    setTutors(t => t.map(u => u.id===tutorId ? {...u,approvalStatus} : u));
  };

  // ── Session confirm/cancel ────────────────────────────────────────────────
  const handleSessionStatus = async (bookingId: string, status: string) => {
    await fetch("/api/admin/sessions", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ bookingId, status }) });
    setSessions(s => s.map(b => b.id===bookingId ? {...b,status} : b));
  };

  // ── Course toggle ─────────────────────────────────────────────────────────
  const handleCourseToggle = async (courseId: string, currentStatus: string) => {
    const status = currentStatus==="active" ? "inactive" : "active";
    await fetch("/api/admin/courses", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ courseId, status }) });
    setCourses(c => c.map(x => x.id===courseId ? {...x,status} : x));
  };

  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) return;
    setLoad("addCourse", true);
    const res = await fetch("/api/admin/courses", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:newCourse.name, description:newCourse.description, price:parseInt(newCourse.price)||199 }) });
    const data = await res.json();
    if (data.course) { setCourses(c=>[...c,data.course]); setNewCourse({ name:"", description:"", price:"199" }); setAddingCourse(false); }
    setLoad("addCourse", false);
  };

  // ── Support reply / close ─────────────────────────────────────────────────
  const handleReply = async (ticketId: string) => {
    await fetch("/api/admin/support", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ticketId, status:"closed", reply:replyText }) });
    setTickets(t => t.map(x => x.id===ticketId ? {...x,status:"closed",reply:replyText} : x));
    setReplyOpen(null); setReplyText("");
  };

  const handleTicketStatus = async (ticketId: string, status: string) => {
    await fetch("/api/admin/support", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ticketId, status }) });
    setTickets(t => t.map(x => x.id===ticketId ? {...x,status} : x));
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setLoad("settings", true);
    await fetch("/api/admin/settings", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(dbSettings) });
    setSettingsSaved(true);
    setTimeout(()=>setSettingsSaved(false), 2500);
    setLoad("settings", false);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const pendingTutors   = tutors.filter(t => t.approvalStatus==="PENDING");
  const filteredUsers   = users.filter(u => (userRole==="All"||u.role===userRole) && (u.name.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase())));
  const filteredSessions= sessions.filter(b => (sessionFilter==="All"||b.status===sessionFilter) && (b.subject.toLowerCase().includes(sessionSearch.toLowerCase())||b.childName.toLowerCase().includes(sessionSearch.toLowerCase())||b.tutorName.toLowerCase().includes(sessionSearch.toLowerCase())));
  const filteredPayments= mockPayments.filter(p => payFilter==="All"||p.status===payFilter);
  const filteredTickets = tickets.filter(t => supportFilter==="All"||t.status===supportFilter);
  const totalRevenue    = mockPayments.filter(p=>p.status==="success").reduce((a,b)=>a+b.amount,0);
  const maxSessions     = Math.max(...(analytics?.monthly.map(m=>m.sessions)??[1]), 1);
  const openTickets     = tickets.filter(t=>t.status==="open").length;

  const navItems: { id:Section; icon:React.ElementType; label:string; badge?:number }[] = [
    { id:"overview",  icon:LayoutDashboard, label:"Overview"                         },
    { id:"users",     icon:Users,           label:"Users",     badge:users.length||undefined },
    { id:"tutors",    icon:GraduationCap,   label:"Tutor Approvals", badge:pendingTutors.length||undefined },
    { id:"courses",   icon:BookOpen,        label:"Courses"                           },
    { id:"sessions",  icon:Calendar,        label:"Sessions"                          },
    { id:"payments",  icon:CreditCard,      label:"Payments"                          },
    { id:"analytics", icon:BarChart3,       label:"Analytics"                         },
    { id:"support",   icon:MessageSquare,   label:"Support", badge:openTickets||undefined },
    { id:"settings",  icon:Settings,        label:"Settings"                          },
  ];

  const sectionTitle: Record<Section,string> = {
    overview:"Platform Overview", users:"User Management", tutors:"Tutor Approvals",
    courses:"Course Management", sessions:"Session Management", payments:"Payment Transactions",
    analytics:"Analytics & Insights", support:"Support Tickets", settings:"Platform Settings",
  };

  const isLoading = loading["init"];

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex">
      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 flex flex-col transition-transform duration-300 ${sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="relative w-10 h-10 bg-white rounded-xl p-0.5 shrink-0">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Zippy Minds</p>
            <p className="text-xs text-red-400 font-semibold flex items-center gap-1"><Shield size={10}/> Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(({ id, icon:Icon, label, badge }) => (
            <button key={id} onClick={()=>{ setSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left text-sm ${section===id?"bg-white/15 text-white":"text-gray-400 hover:bg-white/5 hover:text-white"}`}>
              <Icon size={17}/>
              <span className="flex-1">{label}</span>
              {badge && badge > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs shrink-0">A</div>
            <div className="flex-1 text-left"><p className="text-sm font-semibold text-white">Admin</p><p className="text-xs text-gray-400">Super Admin</p></div>
            <LogOut size={15} className="shrink-0"/>
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Shield size={15} className="text-red-500"/> {sectionTitle[section]}</h1>
              <p className="text-xs text-gray-400">Zippy Minds Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-500" title="Refresh">
              <RefreshCw size={16} className={isLoading?"animate-spin":""}/>
            </button>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 border border-gray-200">
              <Bell size={17} className="text-gray-500"/>
              {openTickets > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>}
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 space-y-6 overflow-auto">
          {isLoading && (
            <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"/>
            </div>
          )}

          {/* ══ OVERVIEW ══ */}
          {section==="overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:"Total Users",      value:users.length,     sub:`${users.filter(u=>u.role==="PARENT").length} parents · ${tutors.length} tutors`, icon:Users,         color:"blue"   },
                  { label:"Total Sessions",   value:sessions.length,  sub:`${sessions.filter(s=>s.status==="CONFIRMED").length} confirmed`,                 icon:Calendar,     color:"purple" },
                  { label:"Revenue (Est.)",   value:`₹${totalRevenue.toLocaleString("en-IN")}`, sub:"from mock payments",                                  icon:DollarSign,   color:"green"  },
                  { label:"Pending Approvals",value:pendingTutors.length, sub:"tutor applications",                                                         icon:AlertTriangle,color:"yellow" },
                ].map(({ label,value,sub,icon:Icon,color })=>(
                  <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color==="blue"?"bg-blue-50 text-blue-600":color==="purple"?"bg-purple-50 text-purple-600":color==="green"?"bg-green-50 text-green-600":"bg-yellow-50 text-yellow-600"}`}>
                      <Icon size={19}/>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Recent sessions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Recent Bookings</h2>
                  <button onClick={()=>setSection("sessions")} className="text-sm text-blue-600 hover:underline">View all →</button>
                </div>
                {sessions.length===0 ? <Empty label="No bookings yet"/> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50">{["Student","Subject","Tutor","Date","Status"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {sessions.slice(0,6).map(b=>(
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{b.childName}</td>
                            <td className="px-5 py-3.5 text-gray-600">{b.subject}</td>
                            <td className="px-5 py-3.5 text-gray-600">{b.tutorName}</td>
                            <td className="px-5 py-3.5 text-gray-500 text-xs">{b.date}</td>
                            <td className="px-5 py-3.5"><StatusBadge status={b.status}/></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pending tutors preview */}
              {pendingTutors.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-gray-900">Pending Tutor Approvals</h2>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingTutors.length}</span>
                    </div>
                    <button onClick={()=>setSection("tutors")} className="text-sm text-blue-600 hover:underline">Review →</button>
                  </div>
                  <TutorTable tutors={pendingTutors} onAction={handleTutorAction} preview/>
                </div>
              )}
            </>
          )}

          {/* ══ USERS ══ */}
          {section==="users" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <h2 className="font-bold text-gray-900">All Users ({users.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search name / email..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-52"/>
                  </div>
                  {["All","PARENT","TUTOR","ADMIN"].map(r=>(
                    <button key={r} onClick={()=>setUserRole(r)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${userRole===r?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{r}</button>
                  ))}
                </div>
              </div>
              {filteredUsers.length===0 ? <Empty label="No users found"/> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">{["User","Email","Phone","Role","Joined","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map(u=>(
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${u.role==="ADMIN"?"bg-red-500":u.role==="TUTOR"?"bg-purple-500":"bg-blue-500"}`}>{u.name[0]?.toUpperCase()}</div>
                              <span className="font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                          <td className="px-5 py-3.5 text-gray-500">{u.phone ?? "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.role==="ADMIN"?"bg-red-100 text-red-600":u.role==="TUTOR"?"bg-purple-100 text-purple-600":"bg-blue-100 text-blue-600"}`}>{u.role}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye size={14}/></button>
                              <button className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
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
          {section==="tutors" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"Pending",  value:tutors.filter(t=>t.approvalStatus==="PENDING").length,  color:"yellow" },
                  { label:"Approved", value:tutors.filter(t=>t.approvalStatus==="APPROVED").length, color:"green"  },
                  { label:"Rejected", value:tutors.filter(t=>t.approvalStatus==="REJECTED").length, color:"red"    },
                ].map(({ label,value,color })=>(
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <p className={`text-3xl font-bold ${color==="yellow"?"text-yellow-500":color==="green"?"text-green-600":"text-red-500"}`}>{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">All Tutor Accounts ({tutors.length})</h2>
                </div>
                {tutors.length===0 ? <Empty label="No tutor accounts yet"/> : <TutorTable tutors={tutors} onAction={handleTutorAction}/>}
              </div>
            </div>
          )}

          {/* ══ COURSES ══ */}
          {section==="courses" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Courses ({courses.length})</h2>
                  <button onClick={()=>setAddingCourse(a=>!a)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Plus size={15}/> Add Course
                  </button>
                </div>

                {addingCourse && (
                  <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
                    <p className="text-sm font-semibold text-gray-800 mb-3">New Course</p>
                    <div className="flex flex-wrap gap-3 items-end">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                        <input value={newCourse.name} onChange={e=>setNewCourse(p=>({...p,name:e.target.value}))} placeholder="e.g. Art & Craft" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-44"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                        <input value={newCourse.description} onChange={e=>setNewCourse(p=>({...p,description:e.target.value}))} placeholder="Short description" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-56"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹/mo)</label>
                        <input type="number" value={newCourse.price} onChange={e=>setNewCourse(p=>({...p,price:e.target.value}))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-24"/>
                      </div>
                      <button onClick={handleAddCourse} disabled={loading["addCourse"]} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                        {loading["addCourse"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save</>}
                      </button>
                      <button onClick={()=>setAddingCourse(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">{["Course","Description","Price/Month","Status","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map(c=>(
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><BookOpen size={16} className="text-blue-600"/></div>
                              <span className="font-semibold text-gray-900">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500 text-xs max-w-[200px] truncate">{c.description || "—"}</td>
                          <td className="px-5 py-4 font-semibold text-gray-900">₹{c.price}</td>
                          <td className="px-5 py-4">
                            <button onClick={()=>handleCourseToggle(c.id,c.status)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${c.status==="active"?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                              {c.status==="active"?<ToggleRight size={14}/>:<ToggleLeft size={14}/>}
                              {c.status==="active"?"Active":"Inactive"}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ SESSIONS ══ */}
          {section==="sessions" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <h2 className="font-bold text-gray-900">All Sessions ({sessions.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input value={sessionSearch} onChange={e=>setSessionSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-44"/>
                  </div>
                  {["All","CONFIRMED","PENDING","CANCELLED"].map(s=>(
                    <button key={s} onClick={()=>setSessionFilter(s)} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${sessionFilter===s?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
                  ))}
                </div>
              </div>
              {filteredSessions.length===0 ? <Empty label="No sessions found"/> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">{["Student","Subject","Tutor","Date","Time","Status","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSessions.map(b=>(
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-gray-900">{b.childName}</td>
                          <td className="px-5 py-3.5 text-gray-600">{b.subject}</td>
                          <td className="px-5 py-3.5 text-gray-600">{b.tutorName}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.date}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.timeSlot}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={b.status}/></td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {b.status!=="CONFIRMED"  && <button onClick={()=>handleSessionStatus(b.id,"CONFIRMED")}  className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors" title="Confirm"><CheckCircle size={14}/></button>}
                              {b.status!=="CANCELLED"  && <button onClick={()=>handleSessionStatus(b.id,"CANCELLED")}  className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Cancel"><XCircle size={14}/></button>}
                              {b.zoomLink && <a href={b.zoomLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors" title="Zoom"><Eye size={14}/></a>}
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
          {section==="payments" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Total Revenue", value:`₹${totalRevenue.toLocaleString("en-IN")}`, icon:TrendingUp,  color:"green"  },
                  { label:"Successful",    value:mockPayments.filter(p=>p.status==="success").length,  icon:CheckCircle,color:"blue"   },
                  { label:"Refunded",      value:mockPayments.filter(p=>p.status==="refunded").length, icon:RefreshCw,  color:"red"    },
                  { label:"Pending",       value:mockPayments.filter(p=>p.status==="pending").length,  icon:Clock,      color:"yellow" },
                ].map(({ label,value,icon:Icon,color })=>(
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color==="green"?"bg-green-50 text-green-600":color==="blue"?"bg-blue-50 text-blue-600":color==="red"?"bg-red-50 text-red-500":"bg-yellow-50 text-yellow-600"}`}><Icon size={19}/></div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Transactions</h2>
                  <div className="flex gap-2">{["All","success","refunded","pending"].map(f=>(
                    <button key={f} onClick={()=>setPayFilter(f)} className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${payFilter===f?"bg-blue-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                  ))}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">{["#","Parent","Tutor","Subject","Amount","Date","Status"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
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
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tx.status==="success"?"bg-green-100 text-green-700":tx.status==="refunded"?"bg-red-100 text-red-600":"bg-yellow-100 text-yellow-700"}`}>
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
          {section==="analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Total Users",    value:analytics?.totalUsers    ?? users.length,    color:"blue",   icon:Users     },
                  { label:"Total Sessions", value:analytics?.totalSessions ?? sessions.length, color:"purple", icon:Calendar  },
                  { label:"Confirmed",      value:analytics?.confirmedSessions ?? 0,           color:"green",  icon:CheckCircle},
                  { label:"Est. Revenue",   value:`₹${(analytics?.totalRevenue??0).toLocaleString("en-IN")}`, color:"yellow", icon:DollarSign },
                ].map(({ label,value,color,icon:Icon })=>(
                  <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color==="blue"?"bg-blue-50 text-blue-600":color==="purple"?"bg-purple-50 text-purple-600":color==="green"?"bg-green-50 text-green-600":"bg-yellow-50 text-yellow-600"}`}><Icon size={18}/></div>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Monthly chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600"/> Monthly Sessions (last 6 months)</h2>
                <div className="flex items-end gap-3 h-44">
                  {(analytics?.monthly ?? []).map(m=>(
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-blue-600">{m.sessions}</span>
                      <div className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-400 group relative transition-colors cursor-pointer"
                        style={{ height:`${Math.max((m.sessions/maxSessions)*160,4)}px` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          ₹{m.revenue.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Top Subjects (Real Data)</h2>
                  {(analytics?.topSubjects?.length ?? 0) === 0 ? <Empty label="No bookings yet"/> : (
                    <div className="space-y-4">
                      {analytics!.topSubjects.map(s=>(
                        <div key={s.name}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-gray-700">{s.name}</span>
                            <span className="text-gray-500">{s.count} booking{s.count!==1?"s":""}</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width:`${s.pct}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Platform Metrics</h2>
                  <div className="space-y-3">
                    {[
                      { label:"Total Parents",  value:analytics?.totalParents ?? users.filter(u=>u.role==="PARENT").length },
                      { label:"Total Tutors",   value:analytics?.totalTutors  ?? tutors.length },
                      { label:"Pending Tutors", value:pendingTutors.length },
                      { label:"Active Courses", value:courses.filter(c=>c.status==="active").length },
                      { label:"Open Tickets",   value:openTickets },
                    ].map(({ label,value })=>(
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="font-bold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SUPPORT ══ */}
          {section==="support" && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                {["All","open","closed"].map(f=>(
                  <button key={f} onClick={()=>setSupportFilter(f)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${supportFilter===f?"bg-blue-600 text-white":"bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                    {f.charAt(0).toUpperCase()+f.slice(1)} {f==="open"?`(${tickets.filter(t=>t.status==="open").length})`:f==="closed"?`(${tickets.filter(t=>t.status==="closed").length})`:""}
                  </button>
                ))}
              </div>
              {filteredTickets.length===0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <MessageSquare size={40} className="text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-400 text-sm">No support tickets yet</p>
                </div>
              ) : filteredTickets.map(ticket=>(
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${ticket.priority==="high"?"bg-red-500":ticket.priority==="medium"?"bg-yellow-500":"bg-gray-400"}`}>{ticket.from[0]}</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="font-semibold text-gray-900 text-sm">{ticket.from}</span>
                          <span className="text-xs text-gray-400">{ticket.email}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.priority==="high"?"bg-red-100 text-red-600":ticket.priority==="medium"?"bg-yellow-100 text-yellow-700":"bg-gray-100 text-gray-600"}`}>{ticket.priority.toUpperCase()}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.status==="open"?"bg-green-100 text-green-600":"bg-gray-100 text-gray-500"}`}>{ticket.status.toUpperCase()}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{ticket.message}</p>
                        {ticket.reply && <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 px-3 py-2 rounded-lg">↩ Reply: {ticket.reply}</p>}
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(ticket.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ticket.status==="open" && (
                        <button onClick={()=>setReplyOpen(replyOpen===ticket.id?null:ticket.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                          <Send size={12}/> Reply
                        </button>
                      )}
                      <button onClick={()=>handleTicketStatus(ticket.id, ticket.status==="open"?"closed":"open")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${ticket.status==="open"?"bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100":"bg-green-50 text-green-600 border-green-200 hover:bg-green-100"}`}>
                        {ticket.status==="open"?"Close":"Reopen"}
                      </button>
                    </div>
                  </div>
                  {replyOpen===ticket.id && (
                    <div className="px-5 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                      <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder={`Reply to ${ticket.from}...`} rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none bg-white"/>
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>handleReply(ticket.id)} disabled={!replyText.trim()}
                          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          <Send size={12}/> Send & Close
                        </button>
                        <button onClick={()=>{setReplyOpen(null);setReplyText("");}} className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section==="settings" && (
            <div className="space-y-5 max-w-3xl">
              {settingsSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle size={16}/> Settings saved to database successfully!
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Settings size={17} className="text-blue-600"/> General</h2>
                <div className="space-y-4">
                  {([["Platform Name","siteName","text"],["Contact Email","contactEmail","email"],["Phone","phone","tel"]] as [string,keyof Settings,string][]).map(([label,key,type])=>(
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <input type={type} value={dbSettings[key]} onChange={e=>setDbSettings(p=>({...p,[key]:e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Zap size={17} className="text-blue-600"/> Platform Controls</h2>
                <div className="space-y-1">
                  {([
                    ["Zoom Auto-Generation",   "zoomEnabled",         "Auto-create Zoom meeting on every booking"],
                    ["Email Notifications",    "emailNotifications",  "Send OTP and booking confirmation emails"],
                    ["Auto-Approve Tutors",    "autoApprove",         "Skip manual review for new tutor sign-ups"],
                    ["Maintenance Mode",       "maintenanceMode",     "Show maintenance page to all visitors"],
                  ] as [string,keyof Settings,string][]).map(([label,key,desc])=>(
                    <div key={key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      <button onClick={()=>setDbSettings(p=>({...p,[key]:p[key]==="true"?"false":"true"}))}
                        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${dbSettings[key]==="true"?"bg-blue-600":"bg-gray-300"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${dbSettings[key]==="true"?"left-6":"left-0.5"}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSaveSettings} disabled={loading["settings"]}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {loading["settings"] ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={16}/> Save Settings to Database</>}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status==="CONFIRMED"?"bg-green-100 text-green-700":status==="PENDING"?"bg-yellow-100 text-yellow-700":status==="CANCELLED"?"bg-red-100 text-red-600":"bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function TutorTable({ tutors, onAction, preview }: { tutors: DBUser[]; onAction: (id:string,a:"APPROVED"|"REJECTED")=>void; preview?: boolean }) {
  const list = preview ? tutors.slice(0,3) : tutors;
  if (list.length === 0) return <Empty label="No tutor accounts found"/>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50">{["Tutor","Email","Phone","Approval","Joined","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-50">
          {list.map(t=>(
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{t.name[0]}</div>
                  <span className="font-semibold text-gray-900">{t.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-gray-600">{t.email}</td>
              <td className="px-5 py-4 text-gray-500 flex items-center gap-1"><MapPin size={11}/>{t.phone ?? "—"}</td>
              <td className="px-5 py-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.approvalStatus==="APPROVED"?"bg-green-100 text-green-700":t.approvalStatus==="REJECTED"?"bg-red-100 text-red-600":"bg-yellow-100 text-yellow-700"}`}>
                  {t.approvalStatus ?? "APPROVED"}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
              <td className="px-5 py-4">
                {(t.approvalStatus==="PENDING" || !t.approvalStatus) ? (
                  <div className="flex items-center gap-2">
                    <button onClick={()=>onAction(t.id,"APPROVED")} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"><CheckCircle size={12}/> Approve</button>
                    <button onClick={()=>onAction(t.id,"REJECTED")} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"><XCircle size={12}/> Reject</button>
                  </div>
                ) : t.approvalStatus==="APPROVED" ? (
                  <button onClick={()=>onAction(t.id,"REJECTED")} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">Revoke</button>
                ) : (
                  <button onClick={()=>onAction(t.id,"APPROVED")} className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">Re-approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-center text-gray-400 py-12 text-sm">{label}</p>;
}

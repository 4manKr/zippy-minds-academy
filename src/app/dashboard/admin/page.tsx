"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard,
  BarChart3, Shield, LogOut, Menu, X,
  CheckCircle, XCircle, Clock, DollarSign, Eye, Search,
  AlertTriangle, Settings, MessageSquare, Calendar, Bell,
  Trash2, TrendingUp, Send, ToggleLeft, ToggleRight, Plus, Edit2, Zap,
  MapPin, RefreshCw, Save, PlayCircle, FileText, Download,
  Play, Upload, Link as LinkIcon, User, CalendarDays, Lock,
} from "lucide-react";

type Section = "overview"|"users"|"tutors"|"courses"|"sessions"|"payments"|"analytics"|"support"|"settings"|"content"|"availability";

// ── Types ────────────────────────────────────────────────────────────────────
interface DBUser    { id:string; name:string; email:string; phone?:string|null; role:string; approvalStatus?:string; subjects?:string[]; createdAt:string; }
interface DBBooking { id:string; parentName:string; parentEmail:string; childName:string; subject:string; tutorName:string; date:string; timeSlot:string; status:string; monthlyPrice:number; zoomLink?:string|null; needsAdmin?:boolean; declinedTutors?:string; createdAt:string; }
interface DBCourse  { id:string; name:string; description:string; price:number; status:string; }
interface DBTicket  { id:string; from:string; email:string; subject:string; message:string; priority:string; status:string; reply?:string|null; createdAt:string; }
interface Analytics { monthly:{month:string;sessions:number;revenue:number}[]; topSubjects:{name:string;count:number;pct:number}[]; totalSessions:number; confirmedSessions:number; totalRevenue:number; totalParents:number; totalTutors:number; totalUsers:number; }
interface Settings  { siteName:string; contactEmail:string; phone:string; zoomEnabled:string; emailNotifications:string; autoApprove:string; maintenanceMode:string; }
interface DBResource  { id:string; title:string; type:string; subject:string; size:string; icon:string; url:string; status:string; }
interface DBVideo    { id:string; title:string; subject:string; duration:string; thumbnail:string; videoUrl:string; views:number; status:string; }
interface DBRecording { id:string; title:string; description:string; subject:string; studentName:string; tutorName:string; videoUrl:string; duration:string; fileSize:string; uploadedBy:string; uploadedByRole:string; visibility:string; createdAt:string; }
interface AvailabilityRecord { id:string; tutorId:string; tutorName:string; monthYear:string; slots:string; timezone:string; isLocked:boolean; createdAt:string; }
interface ChangeRequest { id:string; tutorId:string; tutorName:string; monthYear:string; currentSlots:string; proposedSlots:string; reason:string; status:string; parentApprovals:string; adminName:string; createdAt:string; expiresAt:string; }


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
  const [resources,   setResources]   = useState<DBResource[]>([]);
  const [videos,      setVideos]      = useState<DBVideo[]>([]);
  const [recordings,  setRecordings]  = useState<DBRecording[]>([]);
  const [loading,   setLoading]   = useState<Record<string,boolean>>({});

  // UI state
  const [userSearch,     setUserSearch]     = useState("");
  const [userRole,       setUserRole]       = useState("All");
  const [sessionSearch,  setSessionSearch]  = useState("");
  const [sessionFilter,  setSessionFilter]  = useState("All");
  const [reassignId,     setReassignId]     = useState<string|null>(null);
  const [reassignTutor,  setReassignTutor]  = useState("");
  const [payFilter,      setPayFilter]      = useState("All");
  const [supportFilter,  setSupportFilter]  = useState("All");
  const [replyOpen,      setReplyOpen]      = useState<string|null>(null);
  const [replyText,      setReplyText]      = useState("");
  const [settingsSaved,  setSettingsSaved]  = useState(false);
  const [newCourse,      setNewCourse]      = useState({ name:"", description:"", price:"199" });
  const [addingCourse,   setAddingCourse]   = useState(false);
  // Content management
  const [contentTab,     setContentTab]     = useState<"resources"|"videos"|"recordings">("resources");
  const [newResource,    setNewResource]    = useState({ title:"", type:"PDF", subject:"", size:"", icon:"📄", url:"" });
  const [addingResource, setAddingResource] = useState(false);
  const [newVideo,       setNewVideo]       = useState({ title:"", subject:"", duration:"", thumbnail:"📹", videoUrl:"" });
  const [addingVideo,    setAddingVideo]    = useState(false);
  // Recordings
  const [newRecording,   setNewRecording]   = useState({ title:"", description:"", subject:"", studentName:"", tutorName:"", videoUrl:"", duration:"", visibility:"individual" as "individual"|"all", useLink:true });
  const [addingRecording,setAddingRecording]= useState(false);
  const [recFile,        setRecFile]        = useState<File|null>(null);
  const [recUploadMsg,   setRecUploadMsg]   = useState<{type:"ok"|"err";text:string}|null>(null);
  // Edit modals
  const [editCourse,    setEditCourse]    = useState<DBCourse|null>(null);
  const [editResource,  setEditResource]  = useState<DBResource|null>(null);
  const [editVideo,     setEditVideo]     = useState<DBVideo|null>(null);

  const [viewUser, setViewUser] = useState<DBUser|null>(null);

  // Availability
  const [availabilities,  setAvailabilities]  = useState<AvailabilityRecord[]>([]);
  const [changeRequests,  setChangeRequests]  = useState<ChangeRequest[]>([]);
  const [availTab,        setAvailTab]        = useState<"overview"|"requests">("overview");
  const [editAvail,       setEditAvail]       = useState<AvailabilityRecord|null>(null);
  const [editAvailSlots,  setEditAvailSlots]  = useState<Record<string,string[]>>({});
  const [editAvailDay,    setEditAvailDay]    = useState("Mon");
  const [editAvailReason, setEditAvailReason] = useState("");
  const [editAvailSending,setEditAvailSending]= useState(false);
  const [editAvailMsg,    setEditAvailMsg]    = useState<{type:"ok"|"err";text:string}|null>(null);
  const [applyingReq,     setApplyingReq]     = useState<string|null>(null);

  // Tutor add / edit
  const TUTOR_SUBJECTS = ["Phonics","English Grammar","Mathematics","Public Speaking","Writing & Communication","Coding","Science","Life Skills","Hindi","General Knowledge","Creative Arts","Social Studies"];
  const [addTutorOpen, setAddTutorOpen] = useState(false);
  const [addTutorForm, setAddTutorForm] = useState({ name:"", email:"", phone:"", password:"", subjects:[] as string[], approvalStatus:"APPROVED" });
  const [editTutor,    setEditTutor]    = useState<DBUser|null>(null);
  const [editTutorForm,setEditTutorForm]= useState({ name:"", phone:"", subjects:[] as string[], approvalStatus:"APPROVED" });

  const setLoad = (key: string, v: boolean) => setLoading(p=>({...p,[key]:v}));

  // Derive payment records from real bookings
  const payments = useMemo(() => sessions.map(b => ({
    id:      b.id,
    parent:  b.parentName,
    tutor:   b.tutorName,
    amount:  b.monthlyPrice || 0,
    subject: b.subject,
    status:  b.status === "CONFIRMED" ? "success" : b.status === "CANCELLED" ? "refunded" : "pending",
    date:    new Date(b.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
  })), [sessions]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoad("init", true);
    const safe = (p: Promise<Response>) => p.then(r => r.json()).catch(() => ({}));
    const [u,s,t,c,tk,an,st,res,vid,rec] = await Promise.all([
      safe(fetch("/api/admin/users")),
      safe(fetch("/api/admin/sessions")),
      safe(fetch("/api/admin/tutors")),
      safe(fetch("/api/admin/courses")),
      safe(fetch("/api/admin/support")),
      safe(fetch("/api/admin/analytics")),
      safe(fetch("/api/admin/settings")),
      safe(fetch("/api/admin/resources")),
      safe(fetch("/api/admin/videos")),
      safe(fetch("/api/recordings")),
    ]);
    if (u.users)        setUsers(u.users);
    if (s.bookings)     setSessions(s.bookings);
    if (t.tutors)       setTutors(t.tutors);
    if (c.courses)      setCourses(c.courses);
    if (tk.tickets)     setTickets(tk.tickets);
    if (an.monthly)     setAnalytics(an);
    if (st.settings)    setDbSettings(s2 => ({ ...s2, ...st.settings }));
    if (res.resources)  setResources(res.resources);
    if (vid.videos)     setVideos(vid.videos);
    if (rec.recordings) setRecordings(rec.recordings);
    setLoad("init", false);
  }, []);

  // Role guard — redirect non-admins away from admin panel
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : { user: null }).then(d => {
      if (!d.user) { router.push("/auth/admin-login"); return; }
      if (d.user.role !== "ADMIN") {
        router.push(d.user.role === "TUTOR" ? "/dashboard/tutor" : "/dashboard/parent");
      }
    }).catch(() => router.push("/auth/admin-login"));
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (section === "availability") {
      fetch("/api/admin/availability").then(r=>r.json()).then(d => { if(d.availabilities) setAvailabilities(d.availabilities); });
      fetch("/api/admin/availability/change-request").then(r=>r.json()).then(d => { if(d.requests) setChangeRequests(d.requests); });
    }
  }, [section]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method:"POST" });
    router.push("/auth/admin-login");
  };

  // ── Tutor approve/reject ──────────────────────────────────────────────────
  const handleTutorAction = async (tutorId: string, approvalStatus: "APPROVED"|"REJECTED") => {
    const res = await fetch("/api/admin/tutors", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tutorId, approvalStatus }) });
    const data = await res.json();
    if (data.tutor) setTutors(t => t.map(u => u.id===tutorId ? { ...u, ...data.tutor } : u));
    else setTutors(t => t.map(u => u.id===tutorId ? {...u,approvalStatus} : u));
  };

  // ── Tutor add ─────────────────────────────────────────────────────────────
  const handleAddTutor = async () => {
    if (!addTutorForm.name.trim() || !addTutorForm.email.trim() || !addTutorForm.password.trim()) return;
    setLoad("addTutor", true);
    const res = await fetch("/api/admin/tutors", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(addTutorForm) });
    const data = await res.json();
    if (data.tutor) {
      setTutors(t => [data.tutor, ...t]);
      setAddTutorForm({ name:"", email:"", phone:"", password:"", subjects:[], approvalStatus:"APPROVED" });
      setAddTutorOpen(false);
    } else {
      alert(data.error ?? "Failed to create tutor");
    }
    setLoad("addTutor", false);
  };

  // ── Tutor edit ────────────────────────────────────────────────────────────
  const handleEditTutor = async () => {
    if (!editTutor) return;
    setLoad("editTutor", true);
    const res = await fetch("/api/admin/tutors", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ tutorId:editTutor.id, name:editTutorForm.name, phone:editTutorForm.phone, subjects:editTutorForm.subjects, approvalStatus:editTutorForm.approvalStatus }) });
    const data = await res.json();
    if (data.tutor) {
      setTutors(t => t.map(u => u.id===editTutor.id ? { ...u, ...data.tutor } : u));
      setEditTutor(null);
    } else {
      alert(data.error ?? "Failed to update tutor");
    }
    setLoad("editTutor", false);
  };

  // ── Session confirm/cancel ────────────────────────────────────────────────
  const handleSessionStatus = async (bookingId: string, status: string) => {
    setLoad(bookingId, true);
    try {
      const res = await fetch("/api/admin/sessions", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ bookingId, status }) });
      const data = await res.json();
      if (res.ok && data.booking) {
        // Replace entire booking so zoom link and all fields are fresh
        setSessions(s => s.map(b => b.id===bookingId ? { ...b, ...data.booking } : b));
      } else {
        setSessions(s => s.map(b => b.id===bookingId ? {...b,status} : b));
      }
    } finally {
      setLoad(bookingId, false);
    }
  };

  // ── User delete / view ────────────────────────────────────────────────────
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    // Optimistic: remove immediately so UI feels instant
    const snapshot = users.find(x => x.id === userId);
    setUsers(u => u.filter(x => x.id !== userId));
    setLoad(`del_${userId}`, true);
    try {
      const res = await fetch("/api/admin/users", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId }) });
      if (!res.ok) {
        // Restore on failure
        if (snapshot) setUsers(u => [snapshot, ...u]);
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete user. Please try again.");
      }
    } catch {
      if (snapshot) setUsers(u => [snapshot, ...u]);
      alert("Network error — user was not deleted.");
    } finally {
      setLoad(`del_${userId}`, false);
    }
  };

  // ── Admin reassign: manually assign a tutor to a needsAdmin booking ───────
  const handleReassign = async (bookingId: string, tutorName: string) => {
    if (!tutorName) return;
    const initials = tutorName.split(" ").filter(Boolean).map((p:string)=>p[0]).join("").toUpperCase().slice(0,2);
    await fetch("/api/admin/sessions", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ bookingId, tutorName, tutorInitials: initials }) });
    setSessions(s => s.map(b => b.id===bookingId ? {...b, tutorName, tutorInitials: initials, needsAdmin: false, status:"PENDING"} : b));
    setReassignId(null);
    setReassignTutor("");
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

  // ── Course: save edit ────────────────────────────────────────────────────
  const handleSaveCourse = async () => {
    if (!editCourse) return;
    setLoad("editCourse", true);
    const res = await fetch("/api/admin/courses", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ courseId:editCourse.id, name:editCourse.name, description:editCourse.description, price:editCourse.price }) });
    const data = await res.json();
    if (data.course) { setCourses(c=>c.map(x=>x.id===editCourse.id?data.course:x)); setEditCourse(null); }
    setLoad("editCourse", false);
  };

  const handleDeleteCourse = async (courseId:string) => {
    if (!confirm("Delete this course?")) return;
    await fetch("/api/admin/courses", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ courseId }) });
    setCourses(c=>c.filter(x=>x.id!==courseId));
  };

  // ── Content: add resource ────────────────────────────────────────────────
  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.subject.trim()) return;
    setLoad("addResource", true);
    const res = await fetch("/api/admin/resources", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newResource) });
    const data = await res.json();
    if (data.resource) { setResources(r=>[data.resource,...r]); setNewResource({ title:"", type:"PDF", subject:"", size:"", icon:"📄", url:"" }); setAddingResource(false); }
    setLoad("addResource", false);
  };

  const handleResourceToggle = async (resourceId:string, currentStatus:string) => {
    const status = currentStatus==="active"?"inactive":"active";
    await fetch("/api/admin/resources", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ resourceId, status }) });
    setResources(r=>r.map(x=>x.id===resourceId?{...x,status}:x));
  };

  const handleDeleteResource = async (resourceId:string) => {
    if (!confirm("Delete this resource?")) return;
    await fetch("/api/admin/resources", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ resourceId }) });
    setResources(r=>r.filter(x=>x.id!==resourceId));
  };

  // ── Content: add video ────────────────────────────────────────────────────
  const handleAddVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.subject.trim()) return;
    setLoad("addVideo", true);
    const res = await fetch("/api/admin/videos", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newVideo) });
    const data = await res.json();
    if (data.video) { setVideos(v=>[data.video,...v]); setNewVideo({ title:"", subject:"", duration:"", thumbnail:"📹", videoUrl:"" }); setAddingVideo(false); }
    setLoad("addVideo", false);
  };

  const handleVideoToggle = async (videoId:string, currentStatus:string) => {
    const status = currentStatus==="active"?"inactive":"active";
    await fetch("/api/admin/videos", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ videoId, status }) });
    setVideos(v=>v.map(x=>x.id===videoId?{...x,status}:x));
  };

  const handleDeleteVideo = async (videoId:string) => {
    if (!confirm("Delete this video?")) return;
    await fetch("/api/admin/videos", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ videoId }) });
    setVideos(v=>v.filter(x=>x.id!==videoId));
  };

  // ── Resource: save edit ───────────────────────────────────────────────────
  const handleSaveResource = async () => {
    if (!editResource) return;
    setLoad("editResource", true);
    const res = await fetch("/api/admin/resources", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ resourceId:editResource.id, title:editResource.title, type:editResource.type, subject:editResource.subject, size:editResource.size, icon:editResource.icon, url:editResource.url }) });
    const data = await res.json();
    if (data.resource) { setResources(r=>r.map(x=>x.id===editResource.id?data.resource:x)); setEditResource(null); }
    setLoad("editResource", false);
  };

  // ── Video: save edit ───────────────────────────────────────────────────────
  const handleSaveVideo = async () => {
    if (!editVideo) return;
    setLoad("editVideo", true);
    const res = await fetch("/api/admin/videos", { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ videoId:editVideo.id, title:editVideo.title, subject:editVideo.subject, duration:editVideo.duration, thumbnail:editVideo.thumbnail, videoUrl:editVideo.videoUrl }) });
    const data = await res.json();
    if (data.video) { setVideos(v=>v.map(x=>x.id===editVideo.id?data.video:x)); setEditVideo(null); }
    setLoad("editVideo", false);
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setLoad("settings", true);
    await fetch("/api/admin/settings", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(dbSettings) });
    setSettingsSaved(true);
    setTimeout(()=>setSettingsSaved(false), 2500);
    setLoad("settings", false);
  };

  // ── Availability handlers ─────────────────────────────────────────────────
  const handleSendChangeRequest = async () => {
    if (!editAvail) return;
    const totalSlots = Object.values(editAvailSlots).reduce((a,v)=>a+(v?.length??0),0);
    if (totalSlots === 0) { setEditAvailMsg({type:"err",text:"Proposed schedule must have at least one slot."}); return; }
    setEditAvailSending(true); setEditAvailMsg(null);
    const res = await fetch("/api/admin/availability/change-request", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ tutorId:editAvail.tutorId, tutorName:editAvail.tutorName, monthYear:editAvail.monthYear, proposedSlots:editAvailSlots, reason:editAvailReason }),
    });
    const data = await res.json();
    if (res.ok) {
      setChangeRequests(prev => [data.request, ...prev]);
      setEditAvailMsg({type:"ok",text:"Change request sent to parents for approval."});
      setTimeout(()=>{ setEditAvail(null); setEditAvailMsg(null); }, 2000);
    } else {
      setEditAvailMsg({type:"err",text:data.error??"Failed to send request."});
    }
    setEditAvailSending(false);
  };

  const handleApplyChange = async (requestId: string) => {
    setApplyingReq(requestId);
    const res = await fetch("/api/admin/availability/change-request", {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ requestId }),
    });
    const data = await res.json();
    if (res.ok) {
      setChangeRequests(prev => prev.map(r => r.id===requestId ? data.request : r));
      fetch("/api/admin/availability").then(r=>r.json()).then(d => { if(d.availabilities) setAvailabilities(d.availabilities); });
    } else {
      alert(data.error ?? "Failed to apply change.");
    }
    setApplyingReq(null);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const pendingTutors   = tutors.filter(t => t.approvalStatus==="PENDING");
  const filteredUsers   = users.filter(u => (userRole==="All"||u.role===userRole) && (u.name.toLowerCase().includes(userSearch.toLowerCase())||u.email.toLowerCase().includes(userSearch.toLowerCase())));
  const needsAdminCount = sessions.filter(b => b.needsAdmin).length;
  const filteredSessions= sessions.filter(b => {
    const matchFilter = sessionFilter==="All" ? true
      : sessionFilter==="NEEDS_ADMIN" ? !!b.needsAdmin
      : b.status===sessionFilter;
    const q = sessionSearch.toLowerCase();
    const matchSearch = !q || b.subject.toLowerCase().includes(q) || b.childName.toLowerCase().includes(q) || b.tutorName.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  const filteredPayments= payments.filter(p => payFilter==="All"||p.status===payFilter);
  const filteredTickets = tickets.filter(t => supportFilter==="All"||t.status===supportFilter);
  const totalRevenue    = payments.filter(p=>p.status==="success").reduce((a,b)=>a+b.amount,0);
  const maxSessions     = Math.max(...(analytics?.monthly.map(m=>m.sessions)??[1]), 1);
  const openTickets     = tickets.filter(t=>t.status==="open").length;

  const navItems: { id:Section; icon:React.ElementType; label:string; badge?:number }[] = [
    { id:"overview",  icon:LayoutDashboard, label:"Overview"                         },
    { id:"users",     icon:Users,           label:"Users",     badge:users.length||undefined },
    { id:"tutors",    icon:GraduationCap,   label:"Tutor Approvals", badge:pendingTutors.length||undefined },
    { id:"courses",   icon:BookOpen,        label:"Courses"                           },
    { id:"content",   icon:PlayCircle,      label:"Content Library"                   },
    { id:"sessions",  icon:Calendar,        label:"Sessions"                          },
    { id:"payments",  icon:CreditCard,      label:"Payments"                          },
    { id:"analytics", icon:BarChart3,       label:"Analytics"                         },
    { id:"support",   icon:MessageSquare,   label:"Support", badge:openTickets||undefined },
    { id:"settings",      icon:Settings,     label:"Settings"                          },
    { id:"availability",  icon:CalendarDays, label:"Availability"                      },
  ];

  const sectionTitle: Record<Section,string> = {
    overview:"Platform Overview", users:"User Management", tutors:"Tutor Approvals",
    courses:"Course Management", content:"Content Library", sessions:"Session Management",
    payments:"Payment Transactions", analytics:"Analytics & Insights",
    support:"Support Tickets", settings:"Platform Settings", availability:"Tutor Availability",
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

      {/* ── View User Modal ── */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setViewUser(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">User Details</h3>
              <button onClick={()=>setViewUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 ${viewUser.role==="ADMIN"?"bg-red-500":viewUser.role==="TUTOR"?"bg-purple-500":"bg-blue-500"}`}>
                {viewUser.name[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{viewUser.name}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${viewUser.role==="ADMIN"?"bg-red-100 text-red-600":viewUser.role==="TUTOR"?"bg-purple-100 text-purple-600":"bg-blue-100 text-blue-600"}`}>{viewUser.role}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Email",   value: viewUser.email           },
                { label: "Phone",   value: viewUser.phone ?? "—"     },
                { label: "Status",  value: viewUser.approvalStatus ?? "APPROVED" },
                { label: "Joined",  value: new Date(viewUser.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setViewUser(null)} className="mt-5 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* ── Edit Course Modal ── */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setEditCourse(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><BookOpen size={18} className="text-blue-600"/> Edit Course</h3>
              <button onClick={()=>setEditCourse(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Name</label>
                <input value={editCourse.name} onChange={e=>setEditCourse(p=>p?{...p,name:e.target.value}:null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={editCourse.description} onChange={e=>setEditCourse(p=>p?{...p,description:e.target.value}:null)} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹/month)</label>
                <input type="number" value={editCourse.price} onChange={e=>setEditCourse(p=>p?{...p,price:parseInt(e.target.value)||0}:null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setEditCourse(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveCourse} disabled={loading["editCourse"]}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading["editCourse"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Tutor Modal ── */}
      {editTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setEditTutor(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><GraduationCap size={18} className="text-purple-600"/> Edit Tutor</h3>
              <button onClick={()=>setEditTutor(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="mb-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Email:</span> {editTutor.email}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={editTutorForm.name} onChange={e=>setEditTutorForm(p=>({...p,name:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={editTutorForm.phone} onChange={e=>setEditTutorForm(p=>({...p,phone:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {TUTOR_SUBJECTS.map(s=>(
                    <button key={s} type="button"
                      onClick={()=>setEditTutorForm(p=>({...p,subjects:p.subjects.includes(s)?p.subjects.filter(x=>x!==s):[...p.subjects,s]}))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${editTutorForm.subjects.includes(s)?"bg-purple-600 text-white border-purple-600":"bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Approval Status</label>
                <select value={editTutorForm.approvalStatus} onChange={e=>setEditTutorForm(p=>({...p,approvalStatus:e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30">
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setEditTutor(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleEditTutor} disabled={loading["editTutor"]||!editTutorForm.name.trim()}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading["editTutor"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Resource Modal ── */}
      {editResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setEditResource(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={18} className="text-blue-600"/> Edit Resource</h3>
              <button onClick={()=>setEditResource(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
                  <input value={editResource.title} onChange={e=>setEditResource(p=>p?{...p,title:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject</label>
                  <select value={editResource.subject} onChange={e=>setEditResource(p=>p?{...p,subject:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {["Phonics","Mathematics","English Grammar","Science","General"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                  <select value={editResource.type} onChange={e=>setEditResource(p=>p?{...p,type:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {["PDF","Image","Link"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Icon (emoji)</label>
                  <input value={editResource.icon} onChange={e=>setEditResource(p=>p?{...p,icon:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">File Size</label>
                  <input value={editResource.size} onChange={e=>setEditResource(p=>p?{...p,size:e.target.value}:null)} placeholder="2.4 MB"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Download / View URL</label>
                <input value={editResource.url} onChange={e=>setEditResource(p=>p?{...p,url:e.target.value}:null)} placeholder="https://…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setEditResource(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveResource} disabled={loading["editResource"]}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading["editResource"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Video Modal ── */}
      {editVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setEditVideo(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><PlayCircle size={18} className="text-blue-600"/> Edit Video Lesson</h3>
              <button onClick={()=>setEditVideo(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Title</label>
                  <input value={editVideo.title} onChange={e=>setEditVideo(p=>p?{...p,title:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject</label>
                  <select value={editVideo.subject} onChange={e=>setEditVideo(p=>p?{...p,subject:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {["Phonics","Mathematics","English Grammar","Science","General"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Duration</label>
                  <input value={editVideo.duration} onChange={e=>setEditVideo(p=>p?{...p,duration:e.target.value}:null)} placeholder="14:30"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Thumbnail (emoji)</label>
                  <input value={editVideo.thumbnail} onChange={e=>setEditVideo(p=>p?{...p,thumbnail:e.target.value}:null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Video URL (YouTube, Drive, etc.)</label>
                <input value={editVideo.videoUrl} onChange={e=>setEditVideo(p=>p?{...p,videoUrl:e.target.value}:null)} placeholder="https://youtube.com/watch?v=…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setEditVideo(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveVideo} disabled={loading["editVideo"]}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading["editVideo"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  { label:"Revenue (Est.)",   value:`₹${totalRevenue.toLocaleString("en-IN")}`, sub:"from confirmed bookings",                             icon:DollarSign,   color:"green"  },
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

              {/* ⚠️ Needs Attention Banner */}
              {needsAdminCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0">⚠️</div>
                    <div>
                      <p className="font-bold text-orange-800">
                        {needsAdminCount} booking{needsAdminCount > 1 ? "s" : ""} need{needsAdminCount === 1 ? "s" : ""} tutor assignment
                      </p>
                      <p className="text-xs text-orange-600 mt-0.5">All available tutors declined — please assign a tutor manually.</p>
                    </div>
                  </div>
                  <button onClick={()=>{setSection("sessions");setSessionFilter("NEEDS_ADMIN");}}
                    className="shrink-0 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                    Review Now →
                  </button>
                </div>
              )}

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
                              <button onClick={()=>setViewUser(u)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View"><Eye size={14}/></button>
                              {u.role !== "ADMIN" && (
                                <button onClick={()=>handleDeleteUser(u.id, u.name)} disabled={!!loading[`del_${u.id}`]} className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40" title="Delete">
                                  {loading[`del_${u.id}`] ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"/> : <Trash2 size={14}/>}
                                </button>
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">All Tutor Accounts ({tutors.length})</h2>
                  <button onClick={()=>setAddTutorOpen(a=>!a)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Plus size={15}/> Add Tutor
                  </button>
                </div>

                {/* ── Add Tutor inline form ── */}
                {addTutorOpen && (
                  <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/40">
                    <p className="text-sm font-semibold text-gray-800 mb-4">New Tutor Account</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                        <input value={addTutorForm.name} onChange={e=>setAddTutorForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Priya Sharma" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                        <input type="email" value={addTutorForm.email} onChange={e=>setAddTutorForm(p=>({...p,email:e.target.value}))} placeholder="tutor@email.com" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                        <input type="tel" value={addTutorForm.phone} onChange={e=>setAddTutorForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Password * (min 8 chars)</label>
                        <input type="password" value={addTutorForm.password} onChange={e=>setAddTutorForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-2 block">Subjects</label>
                      <div className="flex flex-wrap gap-2">
                        {TUTOR_SUBJECTS.map(s=>(
                          <button key={s} type="button"
                            onClick={()=>setAddTutorForm(p=>({...p,subjects:p.subjects.includes(s)?p.subjects.filter(x=>x!==s):[...p.subjects,s]}))}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${addTutorForm.subjects.includes(s)?"bg-blue-600 text-white border-blue-600":"bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Approval Status</label>
                      <select value={addTutorForm.approvalStatus} onChange={e=>setAddTutorForm(p=>({...p,approvalStatus:e.target.value}))}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleAddTutor} disabled={loading["addTutor"]||!addTutorForm.name||!addTutorForm.email||!addTutorForm.password}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
                        {loading["addTutor"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Create Tutor</>}
                      </button>
                      <button onClick={()=>setAddTutorOpen(false)} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                  </div>
                )}

                {tutors.length===0 ? <Empty label="No tutor accounts yet"/> : (
                  <TutorTable tutors={tutors} onAction={handleTutorAction} onEdit={t=>{ setEditTutor(t); setEditTutorForm({ name:t.name, phone:t.phone??'', subjects:t.subjects??[], approvalStatus:t.approvalStatus??"PENDING" }); }}/>
                )}
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
                            <div className="flex items-center gap-1.5">
                              <button onClick={()=>setEditCourse(c)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Edit2 size={14}/></button>
                              <button onClick={()=>handleDeleteCourse(c.id)} className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={14}/></button>
                            </div>
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
                  <button onClick={()=>setSessionFilter("NEEDS_ADMIN")} className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${sessionFilter==="NEEDS_ADMIN"?"bg-orange-500 text-white":"bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"}`}>
                    ⚠️ Needs Attention {needsAdminCount>0 && <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${sessionFilter==="NEEDS_ADMIN"?"bg-white/30 text-white":"bg-orange-500 text-white"}`}>{needsAdminCount}</span>}
                  </button>
                </div>
              </div>
              {filteredSessions.length===0 ? <Empty label="No sessions found"/> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">{["Student","Subject","Tutor","Date","Time","Status","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSessions.map(b=>(
                        <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${b.needsAdmin?"bg-orange-50/40":""}`}>
                          <td className="px-5 py-3.5 font-medium text-gray-900">{b.childName}</td>
                          <td className="px-5 py-3.5 text-gray-600">{b.subject}</td>
                          <td className="px-5 py-3.5 text-gray-600">
                            {b.needsAdmin
                              ? <span className="text-orange-600 font-semibold text-xs">⚠️ Unassigned</span>
                              : b.tutorName || <span className="text-gray-400 text-xs italic">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.date}</td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs">{b.timeSlot}</td>
                          <td className="px-5 py-3.5">
                            {b.needsAdmin
                              ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">⚠️ Needs Reassignment</span>
                              : <StatusBadge status={b.status}/>}
                          </td>
                          <td className="px-5 py-3.5">
                            {b.needsAdmin ? (
                              reassignId===b.id ? (
                                <div className="flex items-center gap-1.5">
                                  <select value={reassignTutor} onChange={e=>setReassignTutor(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 max-w-[140px]">
                                    <option value="">Select tutor…</option>
                                    {tutors.filter(t=>t.approvalStatus==="APPROVED").map(t=>(
                                      <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                  </select>
                                  <button onClick={()=>handleReassign(b.id,reassignTutor)} disabled={!reassignTutor}
                                    className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">Assign</button>
                                  <button onClick={()=>{setReassignId(null);setReassignTutor("");}}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"><XCircle size={13}/></button>
                                </div>
                              ) : (
                                <button onClick={()=>{setReassignId(b.id);setReassignTutor("");}}
                                  className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                  Assign Tutor
                                </button>
                              )
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {b.status!=="CONFIRMED"  && <button onClick={()=>handleSessionStatus(b.id,"CONFIRMED")}  className="p-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors" title="Confirm"><CheckCircle size={14}/></button>}
                                {b.status!=="CANCELLED"  && <button onClick={()=>handleSessionStatus(b.id,"CANCELLED")}  className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Cancel"><XCircle size={14}/></button>}
                                {b.zoomLink && <a href={b.zoomLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-50 transition-colors" title="Zoom"><Eye size={14}/></a>}
                              </div>
                            )}
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
                  { label:"Successful",    value:payments.filter(p=>p.status==="success").length,  icon:CheckCircle,color:"blue"   },
                  { label:"Refunded",      value:payments.filter(p=>p.status==="refunded").length, icon:RefreshCw,  color:"red"    },
                  { label:"Pending",       value:payments.filter(p=>p.status==="pending").length,  icon:Clock,      color:"yellow" },
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

          {/* ══ CONTENT LIBRARY ══ */}
          {section==="content" && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 flex-wrap">
                {([
                  ["resources",  `📄 Study Resources (${resources.length})`],
                  ["videos",     `🎬 Video Lessons (${videos.length})`],
                  ["recordings", `🔴 Recorded Sessions (${recordings.length})`],
                ] as const).map(([tab, label])=>(
                  <button key={tab} onClick={()=>setContentTab(tab)}
                    className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${contentTab===tab?"border-blue-600 text-blue-600":"border-transparent text-gray-500 hover:text-gray-800"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── RESOURCES tab ── */}
              {contentTab==="resources" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Study Resources ({resources.length})</h2>
                    <button onClick={()=>setAddingResource(a=>!a)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Plus size={15}/> Add Resource
                    </button>
                  </div>

                  {addingResource && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
                      <p className="text-sm font-semibold text-gray-800 mb-3">New Resource</p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                          <input value={newResource.title} onChange={e=>setNewResource(p=>({...p,title:e.target.value}))} placeholder="e.g. Phonics Workbook Level 2" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-52"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                          <select value={newResource.subject} onChange={e=>setNewResource(p=>({...p,subject:e.target.value}))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-40">
                            <option value="">Select…</option>
                            {["Phonics","Mathematics","English Grammar","Science","General"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                          <select value={newResource.type} onChange={e=>setNewResource(p=>({...p,type:e.target.value}))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none w-24">
                            {["PDF","Image","Link"].map(t=><option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Icon (emoji)</label>
                          <input value={newResource.icon} onChange={e=>setNewResource(p=>({...p,icon:e.target.value}))} placeholder="📄" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-16 text-center focus:outline-none"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">File URL</label>
                          <input value={newResource.url} onChange={e=>setNewResource(p=>({...p,url:e.target.value}))} placeholder="https://…" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Size</label>
                          <input value={newResource.size} onChange={e=>setNewResource(p=>({...p,size:e.target.value}))} placeholder="2.4 MB" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-24 focus:outline-none"/>
                        </div>
                        <button onClick={handleAddResource} disabled={loading["addResource"]}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                          {loading["addResource"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save</>}
                        </button>
                        <button onClick={()=>setAddingResource(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  )}

                  {resources.length===0 ? <Empty label="No resources yet"/> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50">{["Resource","Subject","Type","Size","URL","Status","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {resources.map(r=>(
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">{r.icon}</span>
                                  <span className="font-semibold text-gray-900 max-w-[180px] truncate">{r.title}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-gray-600">{r.subject}</td>
                              <td className="px-5 py-4"><span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">{r.type}</span></td>
                              <td className="px-5 py-4 text-gray-500 text-xs">{r.size||"—"}</td>
                              <td className="px-5 py-4 text-xs text-gray-400 max-w-[160px] truncate">{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><Download size={11}/>Download</a> : "—"}</td>
                              <td className="px-5 py-4">
                                <button onClick={()=>handleResourceToggle(r.id,r.status)}
                                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${r.status==="active"?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                  {r.status==="active"?<ToggleRight size={13}/>:<ToggleLeft size={13}/>}{r.status==="active"?"Active":"Hidden"}
                                </button>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={()=>setEditResource(r)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Edit2 size={14}/></button>
                                  <button onClick={()=>handleDeleteResource(r.id)} className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={14}/></button>
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

              {/* ── VIDEOS tab ── */}
              {contentTab==="videos" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Video Lessons ({videos.length})</h2>
                    <button onClick={()=>setAddingVideo(a=>!a)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Plus size={15}/> Add Video
                    </button>
                  </div>

                  {addingVideo && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
                      <p className="text-sm font-semibold text-gray-800 mb-3">New Video Lesson</p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                          <input value={newVideo.title} onChange={e=>setNewVideo(p=>({...p,title:e.target.value}))} placeholder="e.g. Adding Fractions" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-52"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                          <select value={newVideo.subject} onChange={e=>setNewVideo(p=>({...p,subject:e.target.value}))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-40">
                            <option value="">Select…</option>
                            {["Phonics","Mathematics","English Grammar","Science","General"].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Duration</label>
                          <input value={newVideo.duration} onChange={e=>setNewVideo(p=>({...p,duration:e.target.value}))} placeholder="14:30" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-20 focus:outline-none"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Thumbnail (emoji)</label>
                          <input value={newVideo.thumbnail} onChange={e=>setNewVideo(p=>({...p,thumbnail:e.target.value}))} placeholder="📹" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-16 text-center focus:outline-none"/>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Video URL (YouTube etc.)</label>
                          <input value={newVideo.videoUrl} onChange={e=>setNewVideo(p=>({...p,videoUrl:e.target.value}))} placeholder="https://youtube.com/…" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30"/>
                        </div>
                        <button onClick={handleAddVideo} disabled={loading["addVideo"]}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5">
                          {loading["addVideo"] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Save</>}
                        </button>
                        <button onClick={()=>setAddingVideo(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  )}

                  {videos.length===0 ? <Empty label="No video lessons yet"/> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50">{["Video","Subject","Duration","Views","URL","Status","Actions"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {videos.map(v=>(
                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">{v.thumbnail}</div>
                                  <span className="font-semibold text-gray-900 max-w-[180px] truncate">{v.title}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-gray-600">{v.subject}</td>
                              <td className="px-5 py-4 text-gray-500 text-xs">{v.duration||"—"}</td>
                              <td className="px-5 py-4 text-gray-500">{v.views.toLocaleString()}</td>
                              <td className="px-5 py-4 text-xs">{v.videoUrl ? <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1"><PlayCircle size={11}/>Watch</a> : <span className="text-gray-400">Not set</span>}</td>
                              <td className="px-5 py-4">
                                <button onClick={()=>handleVideoToggle(v.id,v.status)}
                                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${v.status==="active"?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                  {v.status==="active"?<ToggleRight size={13}/>:<ToggleLeft size={13}/>}{v.status==="active"?"Visible":"Hidden"}
                                </button>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={()=>setEditVideo(v)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Edit2 size={14}/></button>
                                  <button onClick={()=>handleDeleteVideo(v.id)} className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={14}/></button>
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

              {/* ── RECORDINGS tab ── */}
              {contentTab==="recordings" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                    <h2 className="font-bold text-gray-900">Recorded Sessions ({recordings.length})</h2>
                    <button onClick={()=>{ setAddingRecording(a=>!a); setRecUploadMsg(null); }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Plus size={15}/> Add Recording
                    </button>
                  </div>

                  {/* Success/error */}
                  {recUploadMsg && (
                    <div className={`mx-6 mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${recUploadMsg.type==="ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                      {recUploadMsg.type==="ok" ? <CheckCircle size={15}/> : <XCircle size={15}/>} {recUploadMsg.text}
                    </div>
                  )}

                  {/* Add form */}
                  {addingRecording && (
                    <div className="p-6 border-b border-gray-100 bg-blue-50/40 space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Play size={16} className="text-blue-600"/> New Recorded Session</h3>

                      {/* Visibility */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Audience</label>
                        <div className="grid grid-cols-2 gap-3 max-w-md">
                          {([["individual","Specific Student","Only one student"],["all","All Students","Every student of the tutor"]] as const).map(([val,lbl,sub])=>(
                            <button key={val} type="button"
                              onClick={()=>setNewRecording(f=>({...f,visibility:val,studentName:val==="all"?"":f.studentName}))}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${newRecording.visibility===val?"border-blue-500 bg-blue-50":"border-gray-200 hover:border-blue-300"}`}>
                              <p className="text-sm font-bold text-gray-800">{lbl}</p>
                              <p className="text-xs text-gray-500">{sub}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                          <input value={newRecording.title} onChange={e=>setNewRecording(f=>({...f,title:e.target.value}))} placeholder="Session title" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Tutor Name</label>
                          <input value={newRecording.tutorName} onChange={e=>setNewRecording(f=>({...f,tutorName:e.target.value}))} placeholder="Tutor name" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        </div>
                        {newRecording.visibility==="individual" && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Student Name *</label>
                            <input value={newRecording.studentName} onChange={e=>setNewRecording(f=>({...f,studentName:e.target.value}))} placeholder="Student name" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
                          <input value={newRecording.subject} onChange={e=>setNewRecording(f=>({...f,subject:e.target.value}))} placeholder="e.g. Mathematics" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                          <input value={newRecording.duration} onChange={e=>setNewRecording(f=>({...f,duration:e.target.value}))} placeholder="e.g. 45:30" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                          <input value={newRecording.description} onChange={e=>setNewRecording(f=>({...f,description:e.target.value}))} placeholder="Session summary" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        </div>
                      </div>

                      {/* Source toggle */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Video Source *</label>
                        <div className="flex gap-2 mb-2">
                          {([true,false] as const).map(useLink=>(
                            <button key={String(useLink)} type="button" onClick={()=>setNewRecording(f=>({...f,useLink}))}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${newRecording.useLink===useLink?"border-blue-500 bg-blue-50 text-blue-700":"border-gray-200 text-gray-500 hover:border-blue-300"}`}>
                              {useLink ? <><LinkIcon size={12}/> Paste Link</> : <><Upload size={12}/> Upload File</>}
                            </button>
                          ))}
                        </div>
                        {newRecording.useLink ? (
                          <input value={newRecording.videoUrl} onChange={e=>setNewRecording(f=>({...f,videoUrl:e.target.value}))} placeholder="Zoom cloud link, YouTube, Google Drive…" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
                        ) : (
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center ${recFile?"border-blue-400 bg-blue-50":"border-gray-200 hover:border-blue-300"}`}>
                            <input type="file" accept="video/*" className="hidden" id="admin-rec-file"
                              onChange={e=>setRecFile(e.target.files?.[0]??null)}/>
                            <label htmlFor="admin-rec-file" className="cursor-pointer text-sm text-gray-600">
                              {recFile ? <span className="text-blue-700 font-semibold">{recFile.name}</span> : "Click to choose video file (MP4, WebM, MOV · Max 500 MB)"}
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={()=>{setAddingRecording(false);setRecUploadMsg(null);}}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">Cancel</button>
                        <button disabled={addingRecording && loading["recSave"]}
                          onClick={async()=>{
                            if(!newRecording.title.trim()||(!newRecording.useLink&&!recFile)||(newRecording.useLink&&!newRecording.videoUrl.trim())||(newRecording.visibility==="individual"&&!newRecording.studentName.trim())){
                              setRecUploadMsg({type:"err",text:"Please fill required fields."});return;
                            }
                            setLoad("recSave",true); setRecUploadMsg(null);
                            try{
                              let videoUrl=newRecording.videoUrl.trim(), fileSize="";
                              if(!newRecording.useLink&&recFile){
                                const fd=new FormData(); fd.append("file",recFile);
                                const up=await fetch("/api/recordings/upload",{method:"POST",body:fd});
                                const ud=await up.json();
                                if(!up.ok) throw new Error(ud.error??"Upload failed");
                                videoUrl=ud.url; fileSize=ud.size;
                              }
                              const res=await fetch("/api/recordings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...newRecording,videoUrl,fileSize,studentName:newRecording.visibility==="all"?"":newRecording.studentName})});
                              const d=await res.json();
                              if(!res.ok) throw new Error(d.error??"Save failed");
                              setRecordings(p=>[d.recording,...p]);
                              setNewRecording({title:"",description:"",subject:"",studentName:"",tutorName:"",videoUrl:"",duration:"",visibility:"individual",useLink:true});
                              setRecFile(null); setAddingRecording(false);
                              setRecUploadMsg({type:"ok",text:"Recording saved!"});
                              setTimeout(()=>setRecUploadMsg(null),3000);
                            }catch(err){setRecUploadMsg({type:"err",text:(err as Error).message??""});}
                            finally{setLoad("recSave",false);}
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
                          {loading["recSave"] ? "Saving…" : <><Play size={14}/> Save Recording</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recordings list */}
                  {recordings.length===0 ? (
                    <div className="p-12 text-center">
                      <div className="text-4xl mb-3">🎬</div>
                      <p className="font-semibold text-gray-700">No recordings yet</p>
                      <p className="text-sm text-gray-400 mt-1">Tutors and admins can upload recorded Zoom sessions here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {recordings.map(r=>(
                        <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
                          {/* Icon */}
                          <div className="w-14 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <Play size={20} className="text-blue-500"/>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="font-semibold text-gray-900 text-sm">{r.title}</span>
                              {r.subject && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{r.subject}</span>}
                              {r.visibility==="all"
                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">All Students</span>
                                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Individual</span>}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.uploadedByRole==="ADMIN"?"bg-orange-50 text-orange-700":"bg-green-50 text-green-700"}`}>
                                By {r.uploadedByRole}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              🎓 Tutor: <strong>{r.tutorName||"—"}</strong>
                              {r.visibility==="individual"&&r.studentName && <> · 👦 {r.studentName}</>}
                              {r.duration && <> · ⏱ {r.duration}</>}
                              {" · "}{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                            </p>
                            {r.description && <p className="text-xs text-gray-400 mt-0.5 italic">{r.description}</p>}
                          </div>
                          {/* Actions — admin can delete */}
                          <div className="flex gap-2 shrink-0">
                            <a href={r.videoUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-all"
                              style={{backgroundColor:"#2D8CFF"}}>
                              <Play size={12}/> Watch
                            </a>
                            <button onClick={async()=>{
                              if(!confirm("Delete this recording? This cannot be undone.")) return;
                              const res=await fetch("/api/recordings",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({recordingId:r.id})});
                              if(res.ok) setRecordings(p=>p.filter(x=>x.id!==r.id));
                            }}
                              className="p-1.5 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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

          {/* ══ AVAILABILITY ══ */}
          {section==="availability" && (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex gap-2">
                {(["overview","requests"] as const).map(tab => (
                  <button key={tab} onClick={()=>setAvailTab(tab)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${availTab===tab?"bg-blue-600 text-white shadow-sm":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {tab === "overview" ? "All Availabilities" : "Change Requests"}
                  </button>
                ))}
              </div>

              {availTab === "overview" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">Tutor Monthly Availabilities</p>
                    <p className="text-xs text-gray-400 mt-0.5">{availabilities.length} record(s) total</p>
                  </div>
                  {availabilities.length === 0 ? (
                    <div className="py-14 text-center">
                      <CalendarDays size={28} className="text-gray-300 mx-auto mb-3"/>
                      <p className="text-gray-400 text-sm">No availability records yet. Tutors must submit from their dashboard.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            {["Tutor","Month","Slots","Timezone","Status","Actions"].map(h=>(
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {availabilities.map(av => {
                            const slots = JSON.parse(av.slots) as Record<string,string[]>;
                            const totalSlots = Object.values(slots).reduce((a,v)=>a+(v?.length??0),0);
                            return (
                              <tr key={av.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-900">{av.tutorName}</td>
                                <td className="px-4 py-3 text-gray-600">{fmtMonthYear(av.monthYear)}</td>
                                <td className="px-4 py-3 text-gray-600">{totalSlots} slot(s)</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{av.timezone}</td>
                                <td className="px-4 py-3">
                                  {av.isLocked
                                    ? <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full w-fit"><Lock size={10}/> Locked</span>
                                    : <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Open</span>
                                  }
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={()=>{
                                      setEditAvail(av);
                                      setEditAvailSlots(JSON.parse(av.slots) as Record<string,string[]>);
                                      setEditAvailDay("Mon");
                                      setEditAvailReason("");
                                      setEditAvailMsg(null);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Edit2 size={12}/> Edit
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {availTab === "requests" && (
                <div className="space-y-4">
                  {changeRequests.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
                      <CalendarDays size={28} className="text-gray-300 mx-auto mb-3"/>
                      <p className="text-gray-400 text-sm">No change requests yet.</p>
                    </div>
                  ) : changeRequests.map(req => {
                    const approvals = JSON.parse(req.parentApprovals) as Record<string,{name:string;token:string;status:string}>;
                    const parentList = Object.entries(approvals);
                    const approvedCount = parentList.filter(([,v])=>v.status==="approved").length;
                    const rejectedCount = parentList.filter(([,v])=>v.status==="rejected").length;
                    const pendingCount  = parentList.filter(([,v])=>v.status==="pending").length;
                    const proposed = JSON.parse(req.proposedSlots) as Record<string,string[]>;
                    const totalProposed = Object.values(proposed).reduce((a,v)=>a+(v?.length??0),0);

                    return (
                      <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-gray-900">{req.tutorName} — {fmtMonthYear(req.monthYear)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Requested by {req.adminName} · {new Date(req.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                            {req.reason && <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{req.reason}&rdquo;</p>}
                          </div>
                          <div className="shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              req.status==="ALL_APPROVED" ? "bg-green-100 text-green-700" :
                              req.status==="ANY_REJECTED" ? "bg-red-100 text-red-700" :
                              req.status==="APPLIED"      ? "bg-blue-100 text-blue-700" :
                              req.status==="CANCELLED"    ? "bg-gray-100 text-gray-600" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {req.status.replace(/_/g," ")}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-extrabold text-green-700">{approvedCount}</p>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Approved</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-extrabold text-amber-700">{pendingCount}</p>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Pending</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-extrabold text-red-700">{rejectedCount}</p>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Rejected</p>
                          </div>
                        </div>

                        {parentList.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parent Responses</p>
                            <div className="space-y-1.5">
                              {parentList.map(([email, info]) => (
                                <div key={email} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{info.name} <span className="text-gray-400 text-xs">&lt;{email}&gt;</span></span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    info.status==="approved" ? "bg-green-100 text-green-700" :
                                    info.status==="rejected" ? "bg-red-100 text-red-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>{info.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {parentList.length === 0 && (
                          <p className="text-xs text-gray-400 mb-4">No confirmed parents — can be applied immediately.</p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">{totalProposed} proposed slot(s)</p>
                          <button
                            onClick={()=>handleApplyChange(req.id)}
                            disabled={req.status !== "ALL_APPROVED" || applyingReq === req.id}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            {applyingReq===req.id
                              ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Applying…</>
                              : <><CheckCircle size={12}/> Apply Change</>
                            }
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Edit Availability Modal */}
          {editAvail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={()=>{setEditAvail(null);setEditAvailMsg(null);}}/>
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 z-10 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><CalendarDays size={18} className="text-blue-600"/> Edit Availability</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{editAvail.tutorName} — {fmtMonthYear(editAvail.monthYear)}</p>
                  </div>
                  <button onClick={()=>{setEditAvail(null);setEditAvailMsg(null);}} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
                </div>

                {/* Day tabs */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => {
                    const count = (editAvailSlots[day]??[]).length;
                    return (
                      <button key={day} onClick={()=>setEditAvailDay(day)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${editAvailDay===day?"bg-blue-600 text-white shadow-sm":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {day}{count>0&&<span className="ml-1 bg-green-500 text-white text-[9px] rounded-full px-1">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Slot grid */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"].map(slot => {
                    const on = (editAvailSlots[editAvailDay]??[]).includes(slot);
                    return (
                      <button key={slot}
                        onClick={()=>setEditAvailSlots(prev=>{
                          const curr = prev[editAvailDay]??[];
                          return {...prev,[editAvailDay]:on?curr.filter(s=>s!==slot):[...curr,slot]};
                        })}
                        className={`p-2.5 rounded-xl text-xs font-semibold border-2 flex items-center justify-center gap-1 transition-all ${on?"bg-green-50 border-green-400 text-green-700":"bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300"}`}>
                        <Clock size={11}/>{slot}{on&&<CheckCircle size={11} className="text-green-500"/>}
                      </button>
                    );
                  })}
                </div>

                {/* Reason */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for change</label>
                  <textarea value={editAvailReason} onChange={e=>setEditAvailReason(e.target.value)} rows={2} placeholder="e.g. Schedule conflict in July..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"/>
                </div>

                {editAvailMsg && (
                  <div className={`flex items-center gap-2 text-sm font-semibold mb-4 ${editAvailMsg.type==="ok"?"text-green-600":"text-red-600"}`}>
                    {editAvailMsg.type==="ok"?<CheckCircle size={14}/>:<AlertTriangle size={14}/>} {editAvailMsg.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={()=>{setEditAvail(null);setEditAvailMsg(null);}}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSendChangeRequest} disabled={editAvailSending}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                    {editAvailSending?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sending…</>:<><Send size={13}/> Send for Parent Approval</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function fmtMonthYear(my: string): string {
  const [y, m] = my.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status==="CONFIRMED"?"bg-green-100 text-green-700":status==="PENDING"?"bg-yellow-100 text-yellow-700":status==="CANCELLED"?"bg-red-100 text-red-600":"bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function TutorTable({ tutors, onAction, onEdit, preview }: { tutors: DBUser[]; onAction: (id:string,a:"APPROVED"|"REJECTED")=>void; onEdit?: (t:DBUser)=>void; preview?: boolean }) {
  const list = preview ? tutors.slice(0,3) : tutors;
  if (list.length === 0) return <Empty label="No tutor accounts found"/>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50">{["Tutor","Email","Phone","Subjects","Approval","Joined","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-50">
          {list.map(t=>(
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{t.name[0]}</div>
                  <span className="font-semibold text-gray-900">{t.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-600 text-xs">{t.email}</td>
              <td className="px-4 py-4 text-gray-500 text-xs">{t.phone ?? "—"}</td>
              <td className="px-4 py-4 max-w-[160px]">
                {t.subjects && t.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {t.subjects.slice(0,2).map(s=>(
                      <span key={s} className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100">{s}</span>
                    ))}
                    {t.subjects.length > 2 && <span className="text-[10px] text-gray-400">+{t.subjects.length-2}</span>}
                  </div>
                ) : <span className="text-xs text-gray-400 italic">—</span>}
              </td>
              <td className="px-4 py-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.approvalStatus==="APPROVED"?"bg-green-100 text-green-700":t.approvalStatus==="REJECTED"?"bg-red-100 text-red-600":"bg-yellow-100 text-yellow-700"}`}>
                  {t.approvalStatus ?? "APPROVED"}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {onEdit && (
                    <button onClick={()=>onEdit(t)} className="p-1.5 rounded-lg border border-purple-200 text-purple-500 hover:bg-purple-50 transition-colors" title="Edit"><Edit2 size={13}/></button>
                  )}
                  {(t.approvalStatus==="PENDING" || !t.approvalStatus) ? (
                    <>
                      <button onClick={()=>onAction(t.id,"APPROVED")} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"><CheckCircle size={12}/> Approve</button>
                      <button onClick={()=>onAction(t.id,"REJECTED")} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"><XCircle size={12}/> Reject</button>
                    </>
                  ) : t.approvalStatus==="APPROVED" ? (
                    <button onClick={()=>onAction(t.id,"REJECTED")} className="px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">Revoke</button>
                  ) : (
                    <button onClick={()=>onAction(t.id,"APPROVED")} className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">Re-approve</button>
                  )}
                </div>
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

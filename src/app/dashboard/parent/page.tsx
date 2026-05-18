"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ChevronRight, Plus, Settings, LogOut, LayoutDashboard, Calendar, BookOpen, CreditCard, HelpCircle, CheckCircle, Video, Clock } from "lucide-react";

interface Booking {
  id: string; childName: string; subject: string; tutorName: string;
  date: string; timeSlot: string; status: string; monthlyPrice: number;
  zoomLink?: string | null;
}
interface UserInfo { name: string; email: string; role: string; }

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard/parent" },
  { icon: Calendar,        label: "Schedule",        href: "#", active: true },
  { icon: BookOpen,        label: "Learning Center", href: "#" },
  { icon: CreditCard,      label: "Payments",        href: "#" },
  { icon: HelpCircle,      label: "Support",         href: "#" },
];

const tutors = [
  { name: "Ms. Ananya Rao",  role: "Phonics Specialist",    rating: 4.9, reviews: 120, active: true },
  { name: "Mr. Rahul Sharma",role: "Mathematics Coach",      rating: 4.8, reviews: 85 },
  { name: "Dr. Priya Singh", role: "Vedic Maths Expert",    rating: 5.0, reviews: 200 },
];

const slots = {
  Mon: ["Booked", "Booked"],
  Tue: ["4:00 PM", "5:00 PM"],
  Wed: ["4:30 PM", "6:00 PM"],
  Thu: ["5:00 PM"],
  Fri: ["Booked", "6:30 PM"],
  Sat: ["10 AM", "11 AM"],
  Sun: ["Off"],
};

const SELECTED = "4:30 PM";
const SELECTED_DAY = "Wed";

const bookingSummary = [
  { label: "Session Type", value: "1-on-1 Phonics" },
  { label: "Duration",     value: "30 Mins" },
  { label: "Date",         value: "Wed, May 21" },
  { label: "Time",         value: "4:30 PM" },
];

export default function ParentDashboardBooking() {
  const router = useRouter();
  const [selectedTutor, setSelectedTutor] = useState(0);
  const [selectedSlot, setSelectedSlot]   = useState(SELECTED);
  const [confirmed, setConfirmed]         = useState(false);
  const [user, setUser]                   = useState<UserInfo | null>(null);
  const [bookings, setBookings]           = useState<Booking[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetch("/api/bookings").then(r => r.json()).then(d => { if (d.bookings) setBookings(d.bookings); });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl shadow-card-hover border border-outline-variant p-10 text-center">
          <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Session Confirmed!</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Way to go! You&apos;ve just taken the first step toward making your child a future-ready explorer.
          </p>
          <div className="bg-surface-container rounded-2xl p-5 text-sm text-left mb-5 space-y-2">
            {bookingSummary.map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-on-surface-variant">{label}</span>
                <span className="font-semibold text-on-surface">{value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Link href="/dashboard/parent" className="btn-primary w-full justify-center py-3">Go to Dashboard <ChevronRight size={16} /></Link>
            <button className="w-full btn-yellow py-3 justify-center text-sm">Add to Calendar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Sidebar ── */}
      <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-surface-container-low border-r border-outline-variant py-6 gap-1">
        <div className="px-6 mb-6">
          <h1 className="font-display font-bold text-primary text-lg leading-none">{user?.name ?? "Zippy Explorer"}</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{user?.email ?? "Parent Account"}</p>
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
          <button className="w-full bg-primary text-on-primary font-bold rounded-full py-3 shadow-md squishy-hover flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> Book New Session
          </button>
          <Link href="#" className="sidebar-link"><Settings size={18} /> Settings</Link>
          <button onClick={handleLogout} className="sidebar-link w-full text-left"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-grow lg:ml-64 px-4 md:px-8 lg:px-12 py-10">
        {/* Breadcrumb + header */}
        <div className="mb-8">
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-2 uppercase tracking-wider font-semibold">
            <span>Courses</span>
            <ChevronRight size={12} />
            <span>Phonics</span>
          </nav>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary">Phonics — Ages 3–7</h2>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            Personalized 1-on-1 session focused on letter sounds, blending, and reading foundations with India&apos;s top-rated experts.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Tutor selection */}
          <section className="md:col-span-3 flex flex-col gap-4">
            <h3 className="font-display font-bold text-on-surface flex items-center gap-2 text-base">
              🔍 Choose Tutor
            </h3>
            <div className="flex flex-col gap-3">
              {tutors.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTutor(i)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTutor === i
                      ? "border-primary bg-surface-container-lowest shadow-card ring-4 ring-primary/5"
                      : "border-outline-variant bg-surface-container-lowest hover:border-primary/50"
                  }`}
                >
                  {selectedTutor === i && <div className="w-1 h-full bg-primary absolute left-0 top-0 rounded-l-xl" />}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary shrink-0">
                      {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{t.name}</p>
                      <p className="text-xs text-on-surface-variant">{t.role}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={12} fill="#fdd000" stroke="#fdd000" />
                        <span className="text-xs text-secondary font-semibold">{t.rating} ({t.reviews})</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Calendar */}
          <section className="md:col-span-6 bg-surface-container-lowest rounded-2xl p-6 shadow-card border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-on-surface flex items-center gap-2 text-base">
                📅 Available Slots
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><ChevronRight size={16} className="rotate-180" /></button>
                <span className="text-sm font-semibold text-on-surface-variant">May 19–25, 2025</span>
                <button className="p-1.5 hover:bg-surface-container rounded-full transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Object.entries(slots).map(([day, times]) => (
                <div key={day} className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase text-center mb-1">{day}</span>
                  {times.map((t) => {
                    const isBooked = t === "Booked" || t === "Off";
                    const isSelected = t === selectedSlot && day === SELECTED_DAY;
                    return (
                      <button
                        key={t}
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelectedSlot(t)}
                        className={`p-1.5 text-[10px] font-bold rounded text-center transition-all ${
                          isBooked
                            ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                            : isSelected
                            ? "bg-secondary-container text-on-secondary-fixed border-2 border-secondary shadow-sm scale-105"
                            : "border-2 border-primary-fixed text-primary hover:bg-primary/5"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
              <span>All times in your local timezone (IST)</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary-fixed inline-block" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-secondary-container border border-secondary inline-block" /> Selected</span>
              </div>
            </div>
          </section>

          {/* Booking summary */}
          <section className="md:col-span-3 flex flex-col gap-4">
            <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant">
              <h3 className="font-display font-bold text-on-surface mb-4 text-base">Booking Summary</h3>
              <div className="space-y-3 text-sm border-b border-outline-variant/30 pb-4 mb-4">
                {bookingSummary.map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-semibold text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border-t-4 border-secondary mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-on-surface-variant">Subtotal</span>
                  <span className="text-sm font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-center text-primary font-bold">
                  <span className="font-display text-base">Total</span>
                  <span className="font-display text-base">FREE Demo</span>
                </div>
              </div>
              <button onClick={() => setConfirmed(true)} className="btn-yellow w-full justify-center py-4 text-sm rounded-2xl">
                Confirm Demo Slot 📅
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-3">No payment required for demo session.</p>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-start gap-3">
              <CheckCircle size={22} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-primary">Future-Ready Guarantee</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Our tutors are vetted for excellence and child safety.</p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Real Bookings from DB ── */}
        {bookings.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-primary" /> Your Booked Sessions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-on-surface text-sm">{b.subject}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">for {b.childName}</p>
                    </div>
                    <span className={`badge text-xs font-bold ${
                      b.status === "CONFIRMED" ? "badge-green" :
                      b.status === "PENDING"   ? "badge-yellow" : "badge-gray"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
                    <div className="flex items-center gap-2"><Calendar size={12} className="text-primary" /> {b.date}</div>
                    <div className="flex items-center gap-2"><Clock size={12} className="text-primary" /> {b.timeSlot}</div>
                    <div className="flex items-center gap-2"><Video size={12} className="text-primary" /> Tutor: {b.tutorName}</div>
                  </div>
                  {b.zoomLink ? (
                    <a
                      href={b.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#2D8CFF] hover:bg-[#1a7ae8] text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      <Video size={14} /> Join Zoom Session
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full bg-surface-container text-on-surface-variant text-xs py-2.5 rounded-xl">
                      <Clock size={13} /> Zoom link pending confirmation
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

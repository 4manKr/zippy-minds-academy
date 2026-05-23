"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, User, Phone, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const STORAGE_KEY   = "zippy_lead_captured";
const DELAY_MS      = 5000;   // show after 5 s
const SNOOZE_DAYS   = 3;      // re-show after 3 days if dismissed (not submitted)

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const { status, ts } = JSON.parse(raw) as { status: string; ts: number };
    if (status === "submitted") return false;          // never show again after submit
    if (status === "snoozed") {
      const snoozeUntil = ts + SNOOZE_DAYS * 86400_000;
      return Date.now() > snoozeUntil;               // show again after snooze period
    }
    return true;
  } catch {
    return true;
  }
}

export default function LeadCapturePopup() {
  const pathname               = usePathname();
  const [visible, setVisible]  = useState(false);
  const [name,    setName]     = useState("");
  const [phone,   setPhone]    = useState("");
  const [loading, setLoading]  = useState(false);
  const [done,    setDone]     = useState(false);
  const [error,   setError]    = useState("");

  // Skip on dashboard / auth pages
  const isDash = pathname.startsWith("/dashboard") || pathname.startsWith("/auth");

  useEffect(() => {
    if (isDash) return;
    const timer = setTimeout(() => {
      if (shouldShow()) setVisible(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isDash]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "snoozed", ts: Date.now() }));
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), whatsapp: phone.trim(), page: pathname }),
      });
      if (!res.ok) throw new Error("save failed");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "submitted", ts: Date.now() }));
      setDone(true);
      setTimeout(() => setVisible(false), 2800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!visible || isDash) return null;

  return (
    <>
      {/* Soft backdrop — doesn't block page interaction */}
      <div className="fixed inset-0 z-[180] pointer-events-none bg-black/30 backdrop-blur-[2px]" />

      {/* Popup card */}
      <div className="fixed z-[190] bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm pointer-events-auto">
        <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant overflow-hidden">

          {/* Coloured top strip */}
          <div className="bg-gradient-to-r from-primary to-secondary-container h-1.5" />

          <div className="px-5 pt-4 pb-5">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-on-surface text-sm leading-tight">
                    Get a FREE Demo Class!
                  </p>
                  <p className="text-xs text-on-surface-variant leading-tight mt-0.5">
                    Drop your details — we'll call you back
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant/60 hover:text-on-surface-variant transition-colors shrink-0 -mt-0.5 -mr-1"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center py-3 gap-2 text-center">
                <CheckCircle size={36} className="text-green-500" />
                <p className="font-bold text-on-surface text-sm">You're all set! 🎉</p>
                <p className="text-xs text-on-surface-variant">Our team will reach out on WhatsApp shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Name */}
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    required
                    type="tel"
                    placeholder="WhatsApp number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !name.trim() || !phone.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm transition-all disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      Get Free Demo
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-on-surface-variant/50">
                  No spam · Your data is safe with us
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

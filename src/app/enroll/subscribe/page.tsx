"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, ChevronRight, ChevronLeft, CheckCircle,
  CreditCard, Globe, Sparkles, AlertCircle, ChevronDown,
  ArrowRight, User, IndianRupee,
} from "lucide-react";
import Script from "next/script";

declare global { interface Window { Razorpay: any; } }

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS      = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TIME_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM",
];

const GATEWAYS = [
  { id: "razorpay", label: "Razorpay",  subtitle: "UPI · Cards · Net Banking", icon: "₹",  iconBg: "bg-blue-50",   badge: "🇮🇳 India",         badgeColor: "bg-blue-50 text-blue-700" },
  { id: "stripe",   label: "Stripe",    subtitle: "Visa · Mastercard · Amex",   icon: "💳", iconBg: "bg-purple-50", badge: "🌍 International",  badgeColor: "bg-purple-50 text-purple-700" },
  { id: "paypal",   label: "PayPal",    subtitle: "PayPal balance · Card",       icon: "🅿️", iconBg: "bg-sky-50",   badge: "🌐 Worldwide",      badgeColor: "bg-sky-50 text-sky-700" },
];
const PAYPAL_CURRENCIES = ["USD","GBP","EUR","AUD","CAD","SGD","NZD","MYR"];

const CURRENCIES: Record<string, { symbol: string; flag: string; name: string }> = {
  INR: { symbol: "₹",    flag: "🇮🇳", name: "Indian Rupee" },
  USD: { symbol: "$",    flag: "🇺🇸", name: "US Dollar" },
  GBP: { symbol: "£",    flag: "🇬🇧", name: "British Pound" },
  EUR: { symbol: "€",    flag: "🇪🇺", name: "Euro" },
  AED: { symbol: "AED ", flag: "🇦🇪", name: "UAE Dirham" },
  SGD: { symbol: "S$",   flag: "🇸🇬", name: "Singapore Dollar" },
  AUD: { symbol: "A$",   flag: "🇦🇺", name: "Australian Dollar" },
  CAD: { symbol: "CA$",  flag: "🇨🇦", name: "Canadian Dollar" },
};
const TZ_CURRENCY: Record<string, string> = {
  "Asia/Kolkata":"INR","America/New_York":"USD","America/Los_Angeles":"USD",
  "America/Chicago":"USD","America/Denver":"USD","America/Toronto":"CAD",
  "America/Vancouver":"CAD","Europe/London":"GBP","Europe/Paris":"EUR",
  "Europe/Berlin":"EUR","Asia/Dubai":"AED","Asia/Singapore":"SGD",
  "Australia/Sydney":"AUD","Australia/Melbourne":"AUD",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "Asia/Kolkata"; }
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** Generate all session dates for the course duration */
function generateAllSessionDates(
  dayOfWeek: string,
  timezone: string,
  durationValue: number,
  durationUnit: string, // "days" | "weeks" | "months"
): string[] {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const target = days.indexOf(dayOfWeek);
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year:"numeric", month:"2-digit", day:"2-digit" });
  const todayStr = fmt.format(new Date());
  const [y,m,d] = todayStr.split("-").map(Number);

  // Start tomorrow
  const start = new Date(y, m-1, d+1);

  // End date based on unit
  let end: Date;
  if      (durationUnit === "days")   end = new Date(y, m-1, d + durationValue + 1);
  else if (durationUnit === "weeks")  end = new Date(y, m-1, d + durationValue * 7 + 1);
  else                                end = new Date(y, m-1 + durationValue, d + 1); // months

  const dates: string[] = [];
  const cur = new Date(start);

  if (durationUnit === "days") {
    // One session every day
    while (dates.length < durationValue) {
      dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    // One session per week on selected day
    while (cur < end) {
      if (cur.getDay() === target) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return dates;
}

function formatDate(dateStr: string) {
  const [y,m,d] = dateStr.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
}
function formatDateLong(dateStr: string) {
  const [y,m,d] = dateStr.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
}

// ── Session Preview Component ─────────────────────────────────────────────────
function SessionPreview({ dates, timeSlot, courseName, compact }: {
  dates: string[]; timeSlot: string; courseName: string; compact?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 4;
  const visible = showAll ? dates : dates.slice(0, PREVIEW);
  const hasMore = dates.length > PREVIEW;

  if (compact) return (
    <>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
        {dates.length} Sessions Booked
      </p>
      <div className="space-y-1">
        {visible.map((date,i)=>(
          <div key={date} className="flex items-center gap-2 text-sm">
            <CheckCircle size={13} className="text-green-500 shrink-0"/>
            <span className="font-medium text-on-surface text-xs">{formatDate(date)}</span>
            <span className="text-on-surface-variant ml-auto text-xs">{timeSlot}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={()=>setShowAll(p=>!p)} className="text-xs text-primary font-semibold mt-2 hover:underline">
          {showAll ? "Show less" : `+${dates.length - PREVIEW} more sessions`}
        </button>
      )}
    </>
  );

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">
          All {dates.length} Sessions ({courseName})
        </p>
        {hasMore && (
          <button onClick={()=>setShowAll(p=>!p)} className="text-xs text-primary font-semibold hover:underline">
            {showAll ? "Show less" : `Show all ${dates.length}`}
          </button>
        )}
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {visible.map((date,i)=>(
          <div key={date} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i+1}</div>
            <div>
              <p className="font-semibold text-green-800 text-sm">{formatDateLong(date)}</p>
              <p className="text-xs text-green-600">{timeSlot}</p>
            </div>
            <CheckCircle size={14} className="ml-auto text-green-500 shrink-0"/>
          </div>
        ))}
      </div>
      {!showAll && hasMore && (
        <p className="text-xs text-on-surface-variant text-center mt-2">
          +{dates.length - PREVIEW} more sessions · <button onClick={()=>setShowAll(true)} className="text-primary font-semibold hover:underline">View all</button>
        </p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function SubscribeInner() {
  const router      = useRouter();
  const params      = useSearchParams();
  const courseName    = params.get("course")   ?? "Subscription";
  const courseId      = params.get("courseId") ?? "";
  const priceINR      = parseInt(params.get("price") ?? "199", 10) || 199;
  const durationValue = parseInt(params.get("dv") ?? "1", 10) || 1;
  const durationUnit  = params.get("du") ?? "months";

  type Step = "slot"|"details"|"payment"|"done";
  const [step, setStep] = useState<Step>("slot");

  // Slot
  const [selDay,  setSelDay]  = useState("");
  const [selTime, setSelTime] = useState("");
  const [popularity, setPopularity] = useState<Record<string,number>>({});

  // Details
  const [childName,   setChildName]   = useState("");
  const [childAge,    setChildAge]    = useState("");
  const [grade,       setGrade]       = useState("");
  const [timezone,    setTimezone]    = useState("Asia/Kolkata");
  const [parentName,  setParentName]  = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // Payment
  const [gateway,        setGateway]        = useState("razorpay");
  const [userCurrency,   setUserCurrency]   = useState("INR");
  const [rates,          setRates]          = useState<Record<string,number>>({ INR:1 });
  const [ratesLoading,   setRatesLoading]   = useState(true);
  const [payLoading,     setPayLoading]     = useState(false);
  const [payError,       setPayError]       = useState("");
  const [showCurrPicker, setShowCurrPicker] = useState(false);
  const [sessionDates,   setSessionDates]   = useState<string[]>([]);
  const [createdSessions, setCreatedSessions] = useState<{date:string;zoomLink?:string|null}[]>([]);

  // keep latest values accessible inside Razorpay callback
  const latestRef = useRef({ selDay, selTime, timezone, childName, childAge, grade, courseId, courseName, priceINR, durationValue, durationUnit, sessionDates });
  useEffect(() => {
    latestRef.current = { selDay, selTime, timezone, childName, childAge, grade, courseId, courseName, priceINR, durationValue, durationUnit, sessionDates };
  });

  useEffect(() => {
    const tz   = detectTimezone();
    setTimezone(tz);
    const curr = TZ_CURRENCY[tz] ?? "USD";
    setUserCurrency(curr);

    fetch("/api/auth/profile").then(r=>r.ok?r.json():null).then(d=>{
      if (d?.user) {
        setParentName(d.user.name  ?? "");
        setParentEmail(d.user.email ?? "");
      }
    }).catch(()=>{});

    fetch("/api/currency").then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.rates) setRates(d.rates); }).catch(()=>{})
      .finally(()=>setRatesLoading(false));

    fetch("/api/subscriptions/slot-popularity").then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.popularity) setPopularity(d.popularity); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (selDay) setSessionDates(generateAllSessionDates(selDay, timezone, durationValue, durationUnit));
  }, [selDay, timezone, durationValue, durationUnit]);

  useEffect(() => {
    if (userCurrency === "INR") setGateway("razorpay");
    else if (PAYPAL_CURRENCIES.includes(userCurrency)) setGateway("paypal");
    else setGateway("stripe");
  }, [userCurrency]);

  const currInfo  = CURRENCIES[userCurrency] ?? CURRENCIES["USD"];
  const rate      = rates[userCurrency] ?? 1;
  const converted = Math.ceil(priceINR * rate * 100) / 100;
  const isINR     = userCurrency === "INR";

  const doCreateSubscription = async (paymentInfo: { gateway:string; gatewayId:string; amount:number; currency:string }) => {
    const v = latestRef.current;
    const res = await fetch("/api/subscriptions/create", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...paymentInfo,
        courseId: v.courseId, courseName: v.courseName,
        dayOfWeek: v.selDay, timeSlot: v.selTime, timezone: v.timezone,
        childName: v.childName, childAge: v.childAge, grade: v.grade,
        durationValue: v.durationValue, durationUnit: v.durationUnit,
        sessionDates: v.sessionDates,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create sessions");
    setCreatedSessions(data.sessions ?? []);
    setStep("done");
    localStorage.removeItem("pending_subscription");
  };

  const handlePay = async () => {
    setPayError(""); setPayLoading(true);
    try {
      let chargeAmount = converted, chargeCurrency = userCurrency;
      if (gateway === "razorpay") { chargeAmount = priceINR; chargeCurrency = "INR"; }
      else if (gateway === "paypal" && !PAYPAL_CURRENCIES.includes(userCurrency)) {
        chargeCurrency = "USD"; chargeAmount = Math.ceil(priceINR*(rates["USD"]??0.012)*100)/100;
      } else if (gateway === "stripe" && userCurrency === "INR") {
        chargeCurrency = "USD"; chargeAmount = Math.ceil(priceINR*(rates["USD"]??0.012)*100)/100;
      }

      // Save for Stripe/PayPal redirects
      localStorage.setItem("pending_subscription", JSON.stringify({
        courseId, courseName, priceINR, dayOfWeek: selDay, timeSlot: selTime,
        timezone, childName, childAge, grade, sessionDates, gateway,
        chargeAmount, chargeCurrency,
      }));

      const res = await fetch("/api/payment/create-order", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ gateway, amount:chargeAmount, currency:chargeCurrency, courseId, courseName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if ((gateway === "stripe" || gateway === "paypal") && data.url) {
        window.location.href = data.url; return;
      }

      if (gateway === "razorpay" && data.orderId) {
        if (!window.Razorpay) throw new Error("Razorpay SDK not loaded. Please refresh.");
        const rzp = new window.Razorpay({
          key: data.keyId, amount: data.amount, currency: data.currency,
          order_id: data.orderId, name: "Zippy Minds Academy",
          description: `Monthly — ${courseName}`,
          prefill: { name: parentName, email: parentEmail },
          theme: { color: "#005da8" },
          handler: async (response: { razorpay_payment_id: string }) => {
            try {
              await doCreateSubscription({ gateway:"razorpay", gatewayId:response.razorpay_payment_id, amount:priceINR, currency:"INR" });
            } catch(e) {
              setPayError(e instanceof Error ? e.message : "Could not create sessions. Contact support.");
            } finally { setPayLoading(false); }
          },
          modal: { ondismiss: ()=>setPayLoading(false) },
        });
        rzp.open(); return;
      }
    } catch(e:unknown) {
      setPayError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setPayLoading(false);
    }
  };

  // ── Check for pending subscription from Stripe/PayPal return ──────────────
  useEffect(() => {
    const pending = localStorage.getItem("pending_subscription");
    if (!pending) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("from") !== "subscribe") return;
    const sub = JSON.parse(pending);
    // Restore state and auto-complete
    setSelDay(sub.dayOfWeek); setSelTime(sub.timeSlot);
    setTimezone(sub.timezone); setChildName(sub.childName);
    setChildAge(sub.childAge); setGrade(sub.grade);
    setSessionDates(sub.sessionDates);
    setPayLoading(true);
    doCreateSubscription({ gateway: sub.gateway, gatewayId: urlParams.get("token") ?? "redirect", amount: sub.chargeAmount, currency: sub.chargeCurrency })
      .catch(e => setPayError(e instanceof Error ? e.message : "Session creation failed"))
      .finally(() => setPayLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STEPS = [
    { key:"slot",    label:"Pick Slot" },
    { key:"details", label:"Details" },
    { key:"payment", label:"Payment" },
  ];
  const stepIdx = STEPS.findIndex(s=>s.key===step);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-semibold text-primary mb-4">
              <Sparkles size={14}/> Enrolling in {courseName}
            </div>
            <h1 className="font-display text-3xl font-extrabold text-on-surface">Book Your Sessions</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {durationValue} {durationUnit} course · 1 session/week · 45 min each
            </p>
          </div>

          {/* Progress */}
          {step !== "done" && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((s,i)=>(
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    i===stepIdx ? "bg-primary text-white" : i<stepIdx ? "bg-green-500 text-white" : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {i<stepIdx ? <CheckCircle size={12}/> : <span>{i+1}</span>}
                    {s.label}
                  </div>
                  {i<STEPS.length-1 && <div className={`w-6 h-0.5 ${i<stepIdx?"bg-green-400":"bg-outline-variant"}`}/>}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: SLOT ── */}
          {step === "slot" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
              <h2 className="font-bold text-on-surface text-lg mb-1 flex items-center gap-2">
                <Calendar size={20} className="text-primary"/> Choose Your Weekly Slot
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">Sessions repeat every week on your chosen day &amp; time</p>

              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Day of week</p>
              <div className="grid grid-cols-7 gap-1.5 mb-6">
                {DAYS.map((day,i)=>{
                  const cnt = Object.entries(popularity).filter(([k])=>k.startsWith(day+"-")).reduce((s,[,v])=>s+v,0);
                  return (
                    <button key={day} onClick={()=>{setSelDay(day);setSelTime("");}}
                      className={`flex flex-col items-center py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        selDay===day ? "border-primary bg-primary text-white" : "border-outline-variant hover:border-primary/40 text-on-surface"
                      }`}>
                      <span>{DAY_SHORT[i]}</span>
                      {cnt>0 && <span className={`text-[9px] mt-0.5 ${selDay===day?"text-white/80":"text-amber-600"}`}>{cnt}</span>}
                    </button>
                  );
                })}
              </div>

              {selDay ? (
                <>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">
                    <Clock size={12} className="inline mr-1"/>Time slot
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map(time=>{
                      const cnt = popularity[`${selDay}-${time}`]??0;
                      return (
                        <button key={time} onClick={()=>setSelTime(time)}
                          className={`relative py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                            selTime===time ? "border-primary bg-primary text-white" : "border-outline-variant hover:border-primary/40 text-on-surface"
                          }`}>
                          {time}
                          {cnt>=3 && <span className="absolute -top-1.5 -right-1 text-[9px] bg-amber-400 text-white px-1 rounded-full">🔥</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-on-surface-variant">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-sm">Select a day above to see time slots</p>
                </div>
              )}

              <button onClick={()=>setStep("details")} disabled={!selDay||!selTime}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {/* ── STEP 2: DETAILS ── */}
          {step === "details" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
              <h2 className="font-bold text-on-surface text-lg mb-1 flex items-center gap-2">
                <User size={20} className="text-primary"/> Your Details
              </h2>
              <p className="text-sm text-on-surface-variant mb-5">Tell us about your child for the sessions</p>

              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Selected Slot</p>
                <p className="font-bold text-on-surface">{selDay}s at {selTime}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Every week · 4 sessions/month</p>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">Child&apos;s Full Name *</label>
                  <input value={childName} onChange={e=>setChildName(e.target.value)} placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">Age</label>
                    <input value={childAge} onChange={e=>setChildAge(e.target.value)} placeholder="e.g. 9"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5">Grade</label>
                    <input value={grade} onChange={e=>setGrade(e.target.value)} placeholder="e.g. Grade 4"
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"/>
                  </div>
                </div>
              </div>

              {/* Session preview with show-all toggle */}
              {sessionDates.length > 0 && (
                <SessionPreview dates={sessionDates} timeSlot={selTime} courseName={courseName} />
              )}

              <div className="flex gap-3">
                <button onClick={()=>setStep("slot")}
                  className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-all">
                  <ChevronLeft size={16}/> Back
                </button>
                <button onClick={()=>setStep("payment")} disabled={!childName}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-all disabled:opacity-40">
                  Continue to Payment <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === "payment" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-0.5">Subscribing to</p>
                    <p className="font-bold text-on-surface text-lg">{courseName}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{selDay}s at {selTime} · {sessionDates.length} total sessions · {durationValue} {durationUnit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {ratesLoading
                      ? <div className="w-20 h-8 bg-primary/10 rounded animate-pulse"/>
                      : <span className="font-display text-3xl font-extrabold text-primary">
                          {currInfo.symbol}{converted.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </span>
                    }
                    <p className="text-xs text-on-surface-variant">/month</p>
                    {!isINR && !ratesLoading && <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Base: ₹{priceINR}</p>}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">{currInfo.flag} {currInfo.name}</span>
                    <button onClick={()=>setShowCurrPicker(p=>!p)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Change <ChevronDown size={11} className={`transition-transform ${showCurrPicker?"rotate-180":""}`}/>
                    </button>
                  </div>
                  {showCurrPicker && (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {Object.entries(CURRENCIES).map(([code,info])=>(
                        <button key={code} onClick={()=>{setUserCurrency(code);setShowCurrPicker(false);}}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            userCurrency===code?"bg-primary text-white border-primary":"border-outline-variant hover:border-primary text-on-surface-variant"
                          }`}>
                          {info.flag} {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sessions list */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
                <SessionPreview dates={sessionDates} timeSlot={selTime} courseName={courseName} compact />
              </div>

              {/* Gateway */}
              <div className="space-y-2">
                {GATEWAYS.map(gw=>(
                  <button key={gw.id} onClick={()=>setGateway(gw.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      gateway===gw.id?"border-primary bg-primary/5":"border-outline-variant hover:border-primary/40 bg-surface-container-lowest"
                    }`}>
                    <div className={`w-10 h-10 rounded-xl ${gw.iconBg} flex items-center justify-center text-lg shrink-0`}>{gw.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-on-surface text-sm">{gw.label}</div>
                      <p className="text-xs text-on-surface-variant">{gw.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${gw.badgeColor}`}>{gw.badge}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gateway===gw.id?"border-primary bg-primary":"border-outline-variant"}`}>
                        {gateway===gw.id && <div className="w-2 h-2 rounded-full bg-white"/>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {payError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5"/>{payError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={()=>setStep("details")}
                  className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-all">
                  <ChevronLeft size={16}/> Back
                </button>
                <button onClick={handlePay} disabled={payLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60">
                  {payLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <><CreditCard size={18}/>
                        Pay {isINR?`₹${priceINR}`:`${currInfo.symbol}${converted}`} &amp; Book Sessions
                        <ArrowRight size={18}/></>
                  }
                </button>
              </div>
              <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1.5">🔒 256-bit SSL · Secure payment</p>
            </div>
          )}

          {/* ── DONE ── */}
          {step === "done" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500"/>
              </div>
              <h2 className="font-display text-2xl font-extrabold text-on-surface mb-2">All Booked! 🎉</h2>
              <p className="text-on-surface-variant text-sm mb-6">
                {sessionDates.length} sessions scheduled over {durationValue} {durationUnit}. Zoom links sent to your email. You&apos;ll get a daily reminder + 30 min notice before each session.
              </p>
              <div className="space-y-2 mb-6">
                {(createdSessions.length ? createdSessions : sessionDates.map(d=>({date:d,zoomLink:null}))).slice(0,8).map((s,i)=>(
                  <div key={s.date} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-left">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i+1}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 text-sm">{formatDateLong(s.date)}</p>
                      <p className="text-xs text-green-600">{selTime}</p>
                    </div>
                    {s.zoomLink && (
                      <a href={s.zoomLink} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] bg-blue-500 text-white px-2 py-1 rounded-full font-semibold hover:bg-blue-600 shrink-0">
                        Join Zoom
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={()=>router.push("/dashboard/parent")}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all">
                Go to Dashboard →
              </button>
            </div>
          )}

          <IndianRupee size={0} className="hidden"/>
        </div>
      </div>
    </>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"/>
      </div>
    }>
      <SubscribeInner/>
    </Suspense>
  );
}

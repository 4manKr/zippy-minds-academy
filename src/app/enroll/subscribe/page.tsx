"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, ChevronRight, ChevronLeft, CheckCircle,
  CreditCard, Sparkles, AlertCircle,
  ArrowRight, User, Tag, X,
} from "lucide-react";
import { usePricingVisibility } from "@/hooks/usePricingVisibility";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Script from "next/script";

declare global { interface Window { Razorpay: any; } }

// ── Helpers: default days from sessionsPerWeek ────────────────────────────────
function defaultDaysForSpw(spw: number): string[] {
  if (spw >= 7) return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  if (spw >= 6) return ["Mon","Tue","Wed","Thu","Fri","Sat"];
  if (spw >= 5) return ["Mon","Tue","Wed","Thu","Fri"];
  if (spw === 4) return ["Mon","Tue","Wed","Thu"];
  if (spw === 3) return ["Mon","Wed","Fri"];
  if (spw === 2) return ["Mon","Thu"];
  return ["Mon"];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TIME_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM",
];

const ALL_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] as const;
type DayShort = typeof ALL_DAYS[number];

const DAY_NUMS: Record<DayShort, number> = {
  Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0,
};

const GATEWAYS = [
  { id: "razorpay", label: "Razorpay",  subtitle: "UPI · Cards · Net Banking", icon: "₹",  iconBg: "bg-blue-50",   badge: "🇮🇳 India",         badgeColor: "bg-blue-50 text-blue-700" },
  { id: "stripe",   label: "Stripe",    subtitle: "Visa · Mastercard · Amex",   icon: "💳", iconBg: "bg-purple-50", badge: "🌍 International",  badgeColor: "bg-purple-50 text-purple-700" },
  { id: "paypal",   label: "PayPal",    subtitle: "PayPal balance · Card",       icon: "🅿️", iconBg: "bg-sky-50",   badge: "🌐 Worldwide",      badgeColor: "bg-sky-50 text-sky-700" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "Asia/Kolkata"; }
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

/** Generate session dates on the selected weekdays for the course duration */
function generateSelectedDaysDates(
  timezone: string,
  selectedDays: string[],
  durationValue: number,
  durationUnit: string,
): string[] {
  if (selectedDays.length === 0) return [];
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year:"numeric", month:"2-digit", day:"2-digit" });
  const todayStr = fmt.format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);

  const dayNums = selectedDays
    .map(dn => DAY_NUMS[dn as DayShort])
    .filter((n): n is number => n !== undefined);

  const start = new Date(y, m-1, d+1);
  let end: Date;
  if (durationUnit === "days") {
    // buffer: enough weeks to cover durationValue sessions across selectedDays
    const weeksNeeded = Math.ceil(durationValue / selectedDays.length) + 2;
    end = new Date(y, m-1, d + weeksNeeded * 7 + 7);
  } else if (durationUnit === "weeks") {
    end = new Date(y, m-1, d + durationValue * 7 + 1);
  } else {
    end = new Date(y, m-1 + durationValue, d + 1);
  }

  const dates: string[] = [];
  const cur = new Date(start);

  if (durationUnit === "days") {
    while (dates.length < durationValue) {
      if (dayNums.includes(cur.getDay())) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    while (cur < end) {
      if (dayNums.includes(cur.getDay())) dates.push(toDateStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return dates;
}

/** Human-readable day list: ["Mon","Wed","Fri"] → "Mon, Wed & Fri" */
function formatDays(days: string[]): string {
  if (days.length === 0) return "No days selected";
  if (days.length === 1) return days[0];
  const copy = [...days];
  const last = copy.pop()!;
  return `${copy.join(", ")} & ${last}`;
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
        {visible.map((date)=>(
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

// ── Course-wise day combos ────────────────────────────────────────────────────
const COURSE_WISE_COMBOS = [
  { label: "Mon · Tue · Wed", days: ["Mon","Tue","Wed"] as string[], icon: "🌅", desc: "Morning batch" },
  { label: "Thu · Fri · Sat", days: ["Thu","Fri","Sat"] as string[], icon: "🌆", desc: "Afternoon batch" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
function SubscribeInner() {
  const router      = useRouter();
  const params      = useSearchParams();
  const courseName        = params.get("course")    ?? "Subscription";
  const courseId          = params.get("courseId")  ?? "";
  const enrollModel       = params.get("model") === "course-wise" ? "course-wise" : "tutor-wise";

  // Tutor-wise params
  const priceINR          = parseInt(params.get("price")    ?? "199", 10) || 199;
  const priceUSD          = parseInt(params.get("priceUSD") ?? "15",  10) || 15;
  const origPriceINR      = parseInt(params.get("op")    ?? "0", 10) || 0;
  const origPriceUSD      = parseInt(params.get("opUSD") ?? "0", 10) || 0;
  const sessionsPerWeek   = parseInt(params.get("spw") ?? "5", 10) || 5;

  // Course-wise params
  const cwPpsINR   = parseInt(params.get("pps")     ?? "0", 10);  // group ₹/session
  const cwPppsINR  = parseInt(params.get("ppps")    ?? "0", 10);  // private ₹/session
  const cwPpsUSD   = parseInt(params.get("ppsUSD")  ?? "0", 10);  // group $/session
  const cwPppsUSD  = parseInt(params.get("pppsUSD") ?? "0", 10);  // private $/session
  const cwDurMins  = parseInt(params.get("sdm")     ?? "60", 10) || 60;

  // Parse admin-configured slots from URL
  interface CourseSlot { id:string; days:string[]; time:string; maxCapacity:number; bookings:number; }
  const cwSlots: CourseSlot[] = (() => {
    try { return JSON.parse(decodeURIComponent(params.get("slots") ?? "[]")); } catch { return []; }
  })();

  const durationValue     = parseInt(params.get("dv")  ?? "1", 10) || 1;
  const durationUnit      = params.get("du") ?? "months";

  type TutorStep   = "slot"|"details"|"payment"|"done";
  type CourseStep  = "daytime"|"classtype"|"details"|"payment"|"done";
  type Step = TutorStep | CourseStep;
  const [step, setStep] = useState<Step>(enrollModel === "course-wise" ? "daytime" : "slot");

  // Course-wise specific state
  const [dayComboIdx,    setDayComboIdx]    = useState(0);
  const [classType,      setClassType]      = useState<"group"|"private">("group");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Slot — initialise days based on model
  const [selDays,    setSelDays]    = useState<string[]>(() =>
    enrollModel === "course-wise"
      ? COURSE_WISE_COMBOS[0].days
      : defaultDaysForSpw(sessionsPerWeek)
  );
  const [selTime,    setSelTime]    = useState("");
  const [popularity, setPopularity] = useState<Record<string,number>>({});

  // Tutor availability for the selected subject (course)
  const [tutorAvailability, setTutorAvailability] = useState<Record<string, string[]>>({});
  // Preview: highest-priority tutor who would be assigned for the chosen slot+days
  const [previewTutor, setPreviewTutor] = useState<{ name: string; initials: string; priority: number } | null>(null);

  // Details
  const [childName,   setChildName]   = useState("");
  const [childAge,    setChildAge]    = useState("");
  const [grade,       setGrade]       = useState("");
  const [timezone,    setTimezone]    = useState("Asia/Kolkata");
  const [parentName,  setParentName]  = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // Pricing visibility (admin toggle)
  const { showPricing } = usePricingVisibility();
  const { whatsappNumber } = useSiteSettings();

  // Geo-detection: null = detecting, true = India, false = International
  const [isIndia,      setIsIndia]      = useState<boolean | null>(null);

  // Payment
  const [gateway,        setGateway]        = useState("razorpay");
  const [payLoading,     setPayLoading]     = useState(false);
  const [payError,       setPayError]       = useState("");
  const [sessionDates,   setSessionDates]   = useState<string[]>([]);
  const [createdSessions, setCreatedSessions] = useState<{date:string;zoomLink?:string|null}[]>([]);

  // Coupon
  const [couponInput,     setCouponInput]    = useState("");
  const [couponApplied,   setCouponApplied]  = useState<{
    code: string; discountAmount: number; discountedPrice: number; discountLabel: string;
  } | null>(null);
  const [couponLoading,   setCouponLoading]  = useState(false);
  const [couponError,     setCouponError]    = useState("");

  // ── Computed pricing (must come before latestRef) ────────────────────────────
  const priceSymbol_early    = isIndia !== false ? "₹" : "$";
  const cwTotalWeeks_early   = durationUnit === "months" ? durationValue * 4 : durationUnit === "weeks" ? durationValue : Math.ceil(durationValue / 7);
  const cwTotalSessions_early = 3 * cwTotalWeeks_early;
  const cwGroupPrice_early   = isIndia !== false ? cwPpsINR  : cwPpsUSD;
  const cwPrivatePrice_early = isIndia !== false ? cwPppsINR : cwPppsUSD;
  const cwPerSession_early   = classType === "private" ? cwPrivatePrice_early : cwGroupPrice_early;
  const cwTotalPrice_early   = cwTotalSessions_early * cwPerSession_early;
  const chargeCurrency_early = isIndia !== false ? "INR" : "USD";

  // keep latest values accessible inside Razorpay callback
  const latestRef = useRef({ selDays, selTime, timezone, childName, childAge, grade, courseId, courseName, priceINR, priceUSD, isIndia, durationValue, durationUnit, sessionDates, couponApplied, enrollModel, cwTotalPrice: cwTotalPrice_early, classType, chargeCurrency: chargeCurrency_early, selectedSlotId });
  useEffect(() => {
    latestRef.current = { selDays, selTime, timezone, childName, childAge, grade, courseId, courseName, priceINR, priceUSD, isIndia, durationValue, durationUnit, sessionDates, couponApplied, enrollModel, cwTotalPrice: cwTotalPrice_early, classType, chargeCurrency: chargeCurrency_early, selectedSlotId };
  });

  useEffect(() => {
    const tz = detectTimezone();
    setTimezone(tz);

    // Detect country → sets India or International pricing + gateway
    fetch("/api/geo").then(r=>r.ok?r.json():null).then(d=>{
      const india = d?.isIndia ?? true;
      setIsIndia(india);
      setGateway(india ? "razorpay" : "stripe");
    }).catch(()=>{ setIsIndia(true); setGateway("razorpay"); });

    fetch("/api/auth/profile").then(r=>r.ok?r.json():null).then(d=>{
      if (d?.user) {
        setParentName(d.user.name  ?? "");
        setParentEmail(d.user.email ?? "");
      }
    }).catch(()=>{});

    fetch("/api/subscriptions/slot-popularity").then(r=>r.ok?r.json():null)
      .then(d=>{ if(d?.popularity) setPopularity(d.popularity); }).catch(()=>{});

    // Fetch tutor availability for this subject
    fetch("/api/tutors").then(r=>r.ok?r.json():null).then(data=>{
      if (data?.tutorBySubject?.[courseName]?.availability) {
        setTutorAvailability(data.tutorBySubject[courseName].availability);
      }
    }).catch(()=>{});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate session dates whenever days/timezone/duration changes
  useEffect(() => {
    setSessionDates(generateSelectedDaysDates(timezone, selDays, durationValue, durationUnit));
  }, [timezone, selDays, durationValue, durationUnit]);

  // Fetch preview tutor when subject + days + time slot are all set
  useEffect(() => {
    if (!courseName || !selTime || selDays.length === 0) { setPreviewTutor(null); return; }
    const daysParam = selDays.join(",");
    fetch(`/api/tutors/for-slot?subject=${encodeURIComponent(courseName)}&timeSlot=${encodeURIComponent(selTime)}&days=${encodeURIComponent(daysParam)}`)
      .then(r => r.ok ? r.json() : { tutor: null })
      .then(d => setPreviewTutor(d.tutor ?? null))
      .catch(() => setPreviewTutor(null));
  }, [courseName, selTime, selDays]);

  // Reset time slot if it's no longer available after day change
  const availableTimeSlots = useMemo(() => {
    if (selDays.length === 0) return [];
    return TIME_SLOTS.filter(time =>
      selDays.every(day => {
        const declared = tutorAvailability[day];
        // If tutor has no declared slots for this day → treat as all available
        if (!declared || declared.length === 0) return true;
        return declared.includes(time);
      })
    );
  }, [selDays, tutorAvailability]);

  useEffect(() => {
    if (selTime && !availableTimeSlots.includes(selTime)) setSelTime("");
  }, [availableTimeSlots, selTime]);

  // Geo-derived display values
  const priceSymbol    = isIndia !== false ? "₹" : "$";
  const daysLabel      = formatDays(selDays);

  // Course-wise: compute total price
  const cwTotalWeeks = durationUnit === "months" ? durationValue * 4 : durationUnit === "weeks" ? durationValue : Math.ceil(durationValue / 7);
  const cwTotalSessions = 3 * cwTotalWeeks; // always 3 days/week
  const cwGroupPrice   = isIndia !== false ? cwPpsINR  : cwPpsUSD;
  const cwPrivatePrice = isIndia !== false ? cwPppsINR : cwPppsUSD;
  const cwPerSession   = classType === "private" ? cwPrivatePrice : cwGroupPrice;
  const cwTotalPrice   = cwTotalSessions * cwPerSession;

  const basePrice      = enrollModel === "course-wise" ? cwTotalPrice : (isIndia !== false ? priceINR : priceUSD);
  const chargePrice    = couponApplied ? couponApplied.discountedPrice : basePrice;
  const chargeCurrency = isIndia !== false ? "INR" : "USD";

  const doCreateSubscription = async (paymentInfo: { gateway:string; gatewayId:string; amount:number; currency:string }) => {
    const v = latestRef.current;
    const res = await fetch("/api/subscriptions/create", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        ...paymentInfo,
        courseId: v.courseId, courseName: v.courseName,
        selectedDays: v.selDays,
        timeSlot: v.selTime, timezone: v.timezone,
        childName: v.childName, childAge: v.childAge, grade: v.grade,
        durationValue: v.durationValue, durationUnit: v.durationUnit,
        sessionDates: v.sessionDates,
        couponCode:     v.couponApplied?.code     ?? null,
        discountAmount: v.couponApplied?.discountAmount ?? 0,
        slotId:         v.selectedSlotId ?? null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to create sessions");
    setCreatedSessions(data.sessions ?? []);
    setStep("done");
    localStorage.removeItem("pending_subscription");
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const v = latestRef.current;
      const originalPrice = v.enrollModel === "course-wise" ? v.cwTotalPrice : (v.isIndia !== false ? v.priceINR : v.priceUSD);
      const res  = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, originalPrice }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error ?? "Invalid coupon");
        setCouponApplied(null);
      } else {
        setCouponApplied({
          code:            data.coupon.code,
          discountAmount:  data.discountAmount,
          discountedPrice: data.discountedPrice,
          discountLabel:   data.discountLabel,
        });
        setCouponInput(data.coupon.code);
        setCouponError("");
      }
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePay = async () => {
    setPayError(""); setPayLoading(true);
    try {
      const v = latestRef.current;
      // India → INR price; International → USD price
      const chargeAmount   = v.enrollModel === "course-wise"
        ? (v.couponApplied ? v.couponApplied.discountedPrice : v.cwTotalPrice)
        : (v.couponApplied ? v.couponApplied.discountedPrice : (v.isIndia !== false ? v.priceINR : v.priceUSD));
      const chargeCurrency = v.chargeCurrency;

      localStorage.setItem("pending_subscription", JSON.stringify({
        courseId, courseName, priceINR, priceUSD, selectedDays: selDays, timeSlot: selTime,
        timezone, childName, childAge, grade, sessionDates, gateway,
        chargeAmount, chargeCurrency,
      }));

      const coupon = v.couponApplied;
      // chargeAmount is already discounted-aware for course-wise; for tutor-wise pass as-is
      const finalAmount = chargeAmount;

      const res = await fetch("/api/payment/create-order", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          gateway, amount: finalAmount, currency: chargeCurrency,
          courseId, courseName,
          couponCode: coupon?.code ?? null,
        }),
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
          description: `${durationValue} ${durationUnit} — ${courseName}`,
          prefill: { name: parentName, email: parentEmail },
          theme: { color: "#005da8" },
          handler: async (response: { razorpay_payment_id: string }) => {
            try {
              await doCreateSubscription({ gateway:"razorpay", gatewayId:response.razorpay_payment_id, amount:finalAmount, currency:chargeCurrency });
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

  // ── Restore from Stripe/PayPal redirect ────────────────────────────────────
  useEffect(() => {
    const pending = localStorage.getItem("pending_subscription");
    if (!pending) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("from") !== "subscribe") return;
    const sub = JSON.parse(pending);
    setSelDays(sub.selectedDays ?? ["Mon","Tue","Wed","Thu","Fri"]);
    setSelTime(sub.timeSlot);
    setTimezone(sub.timezone); setChildName(sub.childName);
    setChildAge(sub.childAge); setGrade(sub.grade);
    setSessionDates(sub.sessionDates);
    setPayLoading(true);
    doCreateSubscription({ gateway: sub.gateway, gatewayId: urlParams.get("token") ?? "redirect", amount: sub.chargeAmount, currency: sub.chargeCurrency })
      .catch(e => setPayError(e instanceof Error ? e.message : "Session creation failed"))
      .finally(() => setPayLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const STEPS = enrollModel === "course-wise"
    ? [
        { key:"daytime",   label:"Schedule" },
        { key:"classtype", label:"Class Type" },
        { key:"details",   label:"Details" },
        { key:"payment",   label:"Payment" },
      ]
    : [
        { key:"slot",    label:"Schedule" },
        { key:"details", label:"Details" },
        { key:"payment", label:"Payment" },
      ];
  const stepIdx = STEPS.findIndex(s=>s.key===step);

  // Toggle a day on/off
  const toggleDay = (day: string) => {
    setSelDays(prev =>
      prev.includes(day)
        ? prev.length > 1 ? prev.filter(d => d !== day) : prev // keep at least 1
        : [...ALL_DAYS.filter(d => [...prev, day].includes(d))] // preserve order
    );
  };

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
            <h1 className="font-display text-3xl font-extrabold text-on-surface">
              {enrollModel === "course-wise" ? "Choose Your Schedule" : "Book Your Sessions"}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              {durationValue} {durationUnit} course ·{" "}
              {enrollModel === "course-wise"
                ? `3 sessions/week · ${cwTotalSessions} sessions total`
                : "Choose your own schedule"}
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

          {/* ── COURSE-WISE STEP 1: SLOT PICKER ── */}
          {step === "daytime" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-5">
              <div>
                <h2 className="font-bold text-on-surface text-lg mb-1 flex items-center gap-2">
                  <Calendar size={20} className="text-primary"/> Choose Your Slot
                </h2>
                <p className="text-sm text-on-surface-variant mb-4">
                  3 sessions per week · select a slot combination that works for you
                </p>

                {cwSlots.length === 0 ? (
                  <div className="text-center py-10 text-on-surface-variant">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-semibold">No slots configured for this course</p>
                    <p className="text-xs mt-1">Please contact us to enroll via WhatsApp</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cwSlots.map(slot => {
                      const isFull     = slot.bookings >= slot.maxCapacity;
                      const isSelected = selectedSlotId === slot.id;
                      const spotsLeft  = slot.maxCapacity - slot.bookings;
                      return (
                        <button key={slot.id}
                          onClick={() => {
                            if (isFull) return;
                            setSelectedSlotId(slot.id);
                            setSelDays(slot.days);
                            setSelTime(slot.time);
                          }}
                          disabled={isFull}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                            isFull
                              ? "border-outline-variant bg-surface-container opacity-60 cursor-not-allowed"
                              : isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-outline-variant hover:border-primary/40 bg-surface-container-lowest"
                          }`}>
                          {/* Days */}
                          <div className="flex-1">
                            <div className="flex gap-1.5 mb-1.5">
                              {slot.days.map(d => (
                                <span key={d} className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  isFull ? "bg-surface-container text-on-surface-variant/50"
                                  : isSelected ? "bg-primary text-white"
                                  : "bg-primary/10 text-primary"
                                }`}>{d}</span>
                              ))}
                            </div>
                            <p className={`font-bold text-base ${isSelected ? "text-primary" : isFull ? "text-on-surface-variant/60" : "text-on-surface"}`}>
                              {slot.time}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{cwDurMins} min/session</p>
                          </div>
                          {/* Capacity */}
                          <div className="text-right shrink-0">
                            {isFull ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                                🔴 Full
                              </span>
                            ) : (
                              <>
                                <div className="flex items-center gap-1 justify-end mb-1">
                                  {Array.from({ length: slot.maxCapacity }).map((_, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < slot.bookings ? "bg-amber-400" : "bg-green-400"}`}/>
                                  ))}
                                </div>
                                <p className={`text-xs font-bold ${spotsLeft <= 1 ? "text-amber-600" : "text-green-600"}`}>
                                  {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                                </p>
                              </>
                            )}
                          </div>
                          {/* Radio */}
                          {!isFull && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary bg-primary" : "border-outline-variant"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white"/>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected slot summary */}
              {selectedSlotId && selTime && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/15 text-sm">
                  <CheckCircle size={14} className="text-primary shrink-0"/>
                  <span className="font-semibold text-on-surface">{selDays.join(" · ")} at {selTime}</span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="text-on-surface-variant">{cwTotalSessions} sessions · {durationValue} {durationUnit}</span>
                </div>
              )}

              <button onClick={() => setStep("classtype")} disabled={!selectedSlotId}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {/* ── COURSE-WISE STEP 2: CLASS TYPE ── */}
          {step === "classtype" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-5">
              <div>
                <h2 className="font-bold text-on-surface text-lg mb-1 flex items-center gap-2">
                  <User size={20} className="text-primary"/> Choose Your Class Type
                </h2>
                <p className="text-sm text-on-surface-variant mb-4">
                  Select how you'd like to learn
                </p>

                {/* Selected schedule summary */}
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 mb-5 text-sm">
                  <CheckCircle size={14} className="text-primary shrink-0"/>
                  <span className="font-semibold text-on-surface">{selDays.join(" · ")}</span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="text-primary font-medium">{selTime}</span>
                  <span className="text-on-surface-variant">·</span>
                  <span className="text-on-surface-variant">{cwDurMins} min/session</span>
                </div>

                {/* Class type cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Group class */}
                  <button onClick={() => setClassType("group")}
                    className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all ${
                      classType === "group" ? "border-primary bg-primary/5 shadow-sm" : "border-outline-variant hover:border-primary/40"
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">👥</span>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Most Popular</span>
                    </div>
                    <p className={`font-bold text-base mb-1 ${classType === "group" ? "text-primary" : "text-on-surface"}`}>Group Class</p>
                    <p className="text-xs text-on-surface-variant mb-3">3–5 students per session · collaborative learning</p>
                    {showPricing && cwGroupPrice > 0 && (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className="font-display text-2xl font-extrabold text-primary">{priceSymbol}{cwGroupPrice}</span>
                          <span className="text-xs text-on-surface-variant mb-0.5">/session</span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">Total: {priceSymbol}{cwGroupPrice * cwTotalSessions}</p>
                        <p className="text-[10px] text-on-surface-variant">{cwTotalSessions} sessions × {priceSymbol}{cwGroupPrice}</p>
                      </div>
                    )}
                  </button>

                  {/* 1-to-1 class */}
                  <button onClick={() => setClassType("private")}
                    className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all ${
                      classType === "private" ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-outline-variant hover:border-indigo-400/60"
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🎯</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Premium</span>
                    </div>
                    <p className={`font-bold text-base mb-1 ${classType === "private" ? "text-indigo-600" : "text-on-surface"}`}>1-to-1 Private</p>
                    <p className="text-xs text-on-surface-variant mb-3">Dedicated tutor · fully personalised attention</p>
                    {showPricing && cwPrivatePrice > 0 && (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className={`font-display text-2xl font-extrabold ${classType === "private" ? "text-indigo-600" : "text-on-surface"}`}>{priceSymbol}{cwPrivatePrice}</span>
                          <span className="text-xs text-on-surface-variant mb-0.5">/session</span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">Total: {priceSymbol}{cwPrivatePrice * cwTotalSessions}</p>
                        <p className="text-[10px] text-on-surface-variant">{cwTotalSessions} sessions × {priceSymbol}{cwPrivatePrice}</p>
                      </div>
                    )}
                  </button>
                </div>

                {/* Upgrade note */}
                {classType === "group" && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                    <span className="shrink-0">💡</span>
                    <span>You can upgrade to 1-to-1 at any time. Group classes still include personal feedback and Q&A time.</span>
                  </div>
                )}
              </div>

              {/* Total price summary */}
              {showPricing && cwPerSession > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-indigo-50 border border-primary/20 rounded-2xl p-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Your Order Summary</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-on-surface">{cwTotalSessions} sessions × {priceSymbol}{cwPerSession}</span>
                    <span className="font-bold text-on-surface">{priceSymbol}{cwTotalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{selDays.join(" · ")} · {selTime} · {durationValue} {durationUnit}</span>
                    <span>{classType === "private" ? "1-to-1" : "Group"}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-primary/15 flex items-center justify-between">
                    <span className="font-bold text-on-surface">Total</span>
                    <span className="font-display text-2xl font-extrabold text-primary">{priceSymbol}{cwTotalPrice}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("daytime")}
                  className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-all">
                  <ChevronLeft size={16}/> Back
                </button>
                <button onClick={() => setStep("details")} disabled={cwPerSession === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-all disabled:opacity-40">
                  Continue to Details <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 1: SCHEDULE (tutor-wise) ── */}
          {step === "slot" && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-6">

              {/* ── Days picker ── */}
              <div>
                <h2 className="font-bold text-on-surface text-lg mb-1 flex items-center gap-2">
                  <Calendar size={20} className="text-primary"/> Choose Your Days
                </h2>
                <p className="text-sm text-on-surface-variant mb-4">
                  Select the days you want sessions each week · at least 1 day required
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map(day => {
                    const isSelected = selDays.includes(day);
                    const isWeekend  = day === "Sat" || day === "Sun";
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : isWeekend
                            ? "border-outline-variant bg-surface-container text-on-surface-variant/50"
                            : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {selDays.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
                    <CheckCircle size={14} className="text-primary"/>
                    <span>
                      <span className="font-semibold text-on-surface">{selDays.length} day{selDays.length > 1 ? "s" : ""}/week</span>
                      {" · "}{daysLabel}
                      {sessionDates.length > 0 && ` · ${sessionDates.length} total sessions`}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Time slot picker ── */}
              <div>
                <h3 className="font-bold text-on-surface text-base mb-1 flex items-center gap-2">
                  <Clock size={18} className="text-primary"/> Choose Your Time Slot
                </h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Sessions happen at this time on your selected days
                  {Object.keys(tutorAvailability).length > 0 && " · Showing tutor's available slots"}
                </p>

                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant text-sm">
                    <p className="text-3xl mb-2">📅</p>
                    <p className="font-semibold">No available slots for selected days</p>
                    <p className="text-xs mt-1">Try adding more days or contact us for custom scheduling</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map(time => {
                      const isAvail = availableTimeSlots.includes(time);
                      const cnt     = popularity[time] ?? 0;
                      return (
                        <button
                          key={time}
                          onClick={() => isAvail && setSelTime(time)}
                          disabled={!isAvail}
                          title={!isAvail ? "Tutor unavailable at this time on selected days" : ""}
                          className={`relative py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                            !isAvail
                              ? "border-outline-variant text-on-surface-variant/30 bg-surface-container cursor-not-allowed opacity-40"
                              : selTime === time
                              ? "border-primary bg-primary text-white"
                              : "border-outline-variant hover:border-primary/40 text-on-surface"
                          }`}
                        >
                          {time}
                          {isAvail && cnt >= 3 && (
                            <span className="absolute -top-1.5 -right-1 text-[9px] bg-amber-400 text-white px-1 rounded-full">🔥</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Session dates preview ── */}
              {sessionDates.length > 0 && (
                <div className="space-y-2">
                  {/* Summary row */}
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/15 text-sm flex-wrap">
                    <CheckCircle size={14} className="text-primary shrink-0"/>
                    <span className="font-semibold text-on-surface">{sessionDates.length} sessions</span>
                    <span className="text-on-surface-variant">·</span>
                    <span className="text-on-surface-variant">
                      {formatDate(sessionDates[0])} → {formatDate(sessionDates[sessionDates.length - 1])}
                    </span>
                    {selTime && (
                      <>
                        <span className="text-on-surface-variant">·</span>
                        <span className="font-medium text-primary">{daysLabel} at {selTime}</span>
                      </>
                    )}
                  </div>

                  {/* First-5 upcoming session dates */}
                  <div className="bg-surface-container rounded-xl border border-outline-variant/50 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-3 pt-2.5 pb-1">
                      Upcoming session dates
                    </p>
                    <div className="divide-y divide-outline-variant/30">
                      {sessionDates.slice(0, 5).map((date, i) => (
                        <div key={date} className="flex items-center gap-3 px-3 py-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="text-sm font-medium text-on-surface">{formatDateLong(date)}</span>
                          {selTime && <span className="ml-auto text-xs text-on-surface-variant">{selTime}</span>}
                        </div>
                      ))}
                    </div>
                    {sessionDates.length > 5 && (
                      <p className="text-xs text-on-surface-variant text-center py-2 border-t border-outline-variant/30">
                        + {sessionDates.length - 5} more sessions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Assigned tutor preview */}
              {previewTutor && selTime && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {previewTutor.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Your assigned tutor</p>
                    <p className="font-bold text-on-surface">{previewTutor.name}</p>
                    <p className="text-xs text-green-600 mt-0.5">Priority #{previewTutor.priority === 999 ? "—" : previewTutor.priority} · Will be assigned automatically</p>
                  </div>
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                </div>
              )}

              <button
                onClick={() => setStep("details")}
                disabled={!selTime || selDays.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
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

              {/* Selected schedule summary */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-5">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Selected Schedule</p>
                <p className="font-bold text-on-surface">{daysLabel} at {selTime}</p>
                {enrollModel === "course-wise" ? (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    3 days/week · {cwTotalSessions} sessions · {classType === "private" ? "1-to-1 private" : "Group class (3–5 students)"} · {durationValue} {durationUnit}
                    {showPricing && cwPerSession > 0 && ` · Total: ${priceSymbol}${cwTotalPrice}`}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selDays.length} day{selDays.length > 1 ? "s" : ""}/week · {sessionDates.length} sessions over {durationValue} {durationUnit}
                  </p>
                )}
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

              {sessionDates.length > 0 && (
                <SessionPreview dates={sessionDates} timeSlot={selTime} courseName={courseName} />
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(enrollModel === "course-wise" ? "classtype" : "slot")}
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
                {/* Savings callout — shown when coupon applied */}
                {couponApplied && showPricing && (
                  <div className="flex items-center gap-2 bg-green-500 text-white rounded-xl px-4 py-2.5 mb-4 text-sm font-bold">
                    <span className="text-lg">🎉</span>
                    You&apos;re saving {priceSymbol}{couponApplied.discountAmount} with code <span className="font-mono tracking-wider">{couponApplied.code}</span>!
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-0.5">Enrolling in</p>
                    <p className="font-bold text-on-surface text-lg">{courseName}</p>
                    {enrollModel === "course-wise" ? (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {daysLabel} at {selTime} · {cwTotalSessions} sessions · {classType === "private" ? "1-to-1" : "Group"} · {durationValue} {durationUnit}
                      </p>
                    ) : (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {daysLabel} at {selTime} · {sessionDates.length} sessions · {durationValue} {durationUnit} course
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {showPricing ? (
                      <>
                        {isIndia === null
                          ? <div className="w-20 h-8 bg-primary/10 rounded animate-pulse"/>
                          : (() => {
                            const origCoursePrice = enrollModel === "course-wise" ? 0 : (isIndia !== false ? origPriceINR : origPriceUSD);
                            const hasCourseDisc   = origCoursePrice > basePrice && origCoursePrice > 0;
                            const totalSaved      = (hasCourseDisc ? origCoursePrice - basePrice : 0) + (couponApplied?.discountAmount ?? 0);
                            const strikePrice     = couponApplied ? basePrice : (hasCourseDisc ? origCoursePrice : 0);
                            return (
                              <div>
                                {strikePrice > 0 && (
                                  <p className="text-sm line-through text-on-surface-variant/50 leading-none mb-0.5">
                                    {priceSymbol}{strikePrice}
                                  </p>
                                )}
                                <span className={`font-display text-3xl font-extrabold ${totalSaved > 0 ? "text-green-600" : "text-primary"}`}>
                                  {priceSymbol}{chargePrice}
                                </span>
                                {enrollModel === "course-wise" && cwPerSession > 0 && !couponApplied && (
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">{cwTotalSessions} × {priceSymbol}{cwPerSession}</p>
                                )}
                                {totalSaved > 0 && (
                                  <p className="text-[10px] font-bold text-green-600 mt-0.5">
                                    🎉 Saved {priceSymbol}{totalSaved}!
                                  </p>
                                )}
                                {couponApplied && (
                                  <p className="text-[10px] text-green-600/70 mt-0.5">{couponApplied.discountLabel} coupon ✓</p>
                                )}
                              </div>
                            );
                          })()
                        }
                        <p className="text-xs text-on-surface-variant">{durationValue} {durationUnit} course</p>
                        <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
                          {isIndia !== false ? "🇮🇳 India · INR" : "🌍 International · USD"}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-on-surface-variant">Contact for pricing</span>
                        <p className="text-xs text-on-surface-variant mt-1">{durationValue} {durationUnit} course</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
                <SessionPreview dates={sessionDates} timeSlot={selTime} courseName={courseName} compact />
              </div>

              {showPricing ? (
                /* ── Normal payment flow ── */
                <>
                  {/* ── Coupon code box ── */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Tag size={13}/> Have a coupon code?
                    </p>

                    {couponApplied ? (
                      /* Applied state */
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <CheckCircle size={18} className="text-green-500 shrink-0"/>
                        <div className="flex-1">
                          <p className="font-bold text-green-800 text-sm">{couponApplied.code}</p>
                          <p className="text-xs text-green-600">
                            {couponApplied.discountLabel} applied · You save {priceSymbol}{couponApplied.discountAmount}
                          </p>
                        </div>
                        <button onClick={handleRemoveCoupon}
                          className="p-1.5 rounded-full hover:bg-green-100 text-green-600 transition-colors">
                          <X size={14}/>
                        </button>
                      </div>
                    ) : (
                      /* Input state */
                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="CODE200 / CODE20%"
                          className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm font-mono font-semibold uppercase placeholder:font-normal placeholder:normal-case focus:outline-none focus:border-primary"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponInput.trim() || couponLoading}
                          className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                        >
                          {couponLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "Apply"}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={12}/>{couponError}
                      </p>
                    )}
                  </div>

                  {/* Gateway selection — India: Razorpay only; International: Stripe + PayPal */}
                  <div className="space-y-2">
                    {GATEWAYS
                      .filter(gw => isIndia !== false ? gw.id === "razorpay" : gw.id !== "razorpay")
                      .map(gw=>(
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
                      ))
                    }
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
                        : (
                          <>
                            <CreditCard size={18}/>
                            Pay {priceSymbol}{chargePrice}
                            {couponApplied && <span className="text-xs opacity-80">(saved {priceSymbol}{couponApplied.discountAmount})</span>}
                            &amp; Book Sessions
                            <ArrowRight size={18}/>
                          </>
                        )
                      }
                    </button>
                  </div>
                  <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1.5">🔒 256-bit SSL · Secure payment</p>
                </>
              ) : (
                /* ── Pricing OFF: WhatsApp only ── */
                <>
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <p className="font-bold text-green-800 text-base mb-1">Complete your enrollment on WhatsApp</p>
                    <p className="text-sm text-green-700 mb-4">
                      Share your slot details with us and we&apos;ll confirm your sessions and send payment info directly.
                    </p>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Hi! I'd like to enroll in *${courseName}*.\n\n` +
                        `📅 Days: ${daysLabel}\n` +
                        `🕐 Time: ${selTime}\n` +
                        (enrollModel === "course-wise" ? `📋 Class type: ${classType === "private" ? "1-to-1 private" : "Group class"}\n` : "") +
                        `👦 Child: ${childName || "—"}\n` +
                        `📚 Duration: ${durationValue} ${durationUnit}\n\n` +
                        `Please share the payment details and confirm my sessions.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] text-sm"
                    >
                      <span className="text-lg">💬</span>
                      Chat on WhatsApp to Confirm Enrollment
                      <ArrowRight size={16}/>
                    </a>
                  </div>

                </>
              )}
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
                {enrollModel === "course-wise" ? cwTotalSessions : sessionDates.length} sessions scheduled ({daysLabel}) over {durationValue} {durationUnit}.
                {enrollModel === "course-wise" && ` ${classType === "private" ? "1-to-1 private" : "Group class (3–5 students)."}`}
                {" "}Zoom links sent to your email. You&apos;ll get a 30-min reminder before each session.
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

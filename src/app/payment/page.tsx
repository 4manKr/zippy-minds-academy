"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle, IndianRupee, CreditCard, Globe, Building2,
  ArrowRight, AlertCircle, Sparkles, RefreshCw, ChevronDown,
} from "lucide-react";
import Script from "next/script";
import { useSiteSettings } from "@/context/SiteSettingsContext";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ── Currency config ───────────────────────────────────────────────────────────

interface CurrencyInfo {
  code:   string;
  symbol: string;
  name:   string;
  flag:   string;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: "INR", symbol: "₹",    name: "Indian Rupee",        flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$",     name: "US Dollar",           flag: "🇺🇸" },
  GBP: { code: "GBP", symbol: "£",    name: "British Pound",       flag: "🇬🇧" },
  EUR: { code: "EUR", symbol: "€",    name: "Euro",                flag: "🇪🇺" },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham",          flag: "🇦🇪" },
  SGD: { code: "SGD", symbol: "S$",   name: "Singapore Dollar",    flag: "🇸🇬" },
  AUD: { code: "AUD", symbol: "A$",   name: "Australian Dollar",   flag: "🇦🇺" },
  CAD: { code: "CAD", symbol: "CA$",  name: "Canadian Dollar",     flag: "🇨🇦" },
  MYR: { code: "MYR", symbol: "RM",   name: "Malaysian Ringgit",   flag: "🇲🇾" },
  SAR: { code: "SAR", symbol: "SAR ", name: "Saudi Riyal",         flag: "🇸🇦" },
  NZD: { code: "NZD", symbol: "NZ$",  name: "New Zealand Dollar",  flag: "🇳🇿" },
};

// Timezone → currency code
const TZ_CURRENCY: Record<string, string> = {
  "Asia/Kolkata":        "INR",
  "America/New_York":    "USD",
  "America/Los_Angeles": "USD",
  "America/Chicago":     "USD",
  "America/Denver":      "USD",
  "America/Halifax":     "CAD",
  "America/Toronto":     "CAD",
  "America/Vancouver":   "CAD",
  "Europe/London":       "GBP",
  "Europe/Paris":        "EUR",
  "Europe/Berlin":       "EUR",
  "Europe/Amsterdam":    "EUR",
  "Europe/Rome":         "EUR",
  "Europe/Madrid":       "EUR",
  "Asia/Dubai":          "AED",
  "Asia/Riyadh":         "SAR",
  "Asia/Singapore":      "SGD",
  "Asia/Kuala_Lumpur":   "MYR",
  "Australia/Sydney":    "AUD",
  "Australia/Melbourne": "AUD",
  "Pacific/Auckland":    "NZD",
};

// PayPal supported currencies (server auto-falls back to USD if not in this list)
const PAYPAL_CURRENCIES = ["USD","GBP","EUR","AUD","CAD","SGD","NZD","MYR"];

// ── Gateway list ──────────────────────────────────────────────────────────────

const GATEWAYS = [
  { id: "razorpay", label: "Razorpay",            subtitle: "UPI · Cards · Net Banking · Wallets",        icon: "₹",  iconBg: "bg-blue-50",   badge: "🇮🇳 India Only",    badgeColor: "bg-blue-50 text-blue-700",   recommended: false },
  { id: "stripe",   label: "Stripe",              subtitle: "Visa · Mastercard · Amex · Apple Pay",       icon: "💳", iconBg: "bg-purple-50", badge: "🌍 International",  badgeColor: "bg-purple-50 text-purple-700", recommended: false },
  { id: "paypal",   label: "PayPal",              subtitle: "PayPal balance · Linked card · Bank account", icon: "🅿️", iconBg: "bg-sky-50",    badge: "🌐 Worldwide",      badgeColor: "bg-sky-50 text-sky-700",     recommended: false },
  { id: "wise",     label: "Wise Transfer",       subtitle: "Low-fee international bank transfer",        icon: "🌐", iconBg: "bg-teal-50",   badge: "💸 Lowest Fees",    badgeColor: "bg-teal-50 text-teal-700",   recommended: false },
  { id: "bank",     label: "Bank Transfer / NEFT",subtitle: "Direct bank transfer (India)",               icon: "🏦", iconBg: "bg-amber-50",  badge: "🇮🇳 India Only",    badgeColor: "bg-amber-50 text-amber-700", recommended: false },
  { id: "whatsapp", label: "Pay via WhatsApp",    subtitle: "Share payment screenshot with us directly",  icon: "💬", iconBg: "bg-green-50",  badge: "✅ Simplest",       badgeColor: "bg-green-50 text-green-700", recommended: false },
];

const BANK_DETAILS = {
  "Account Name":   "Zippy Minds Academy",
  "Account Number": "XXXXXXXXXX",
  "IFSC Code":      "XXXXXXXXXX",
  "Bank":           "HDFC Bank",
  "Branch":         "Mumbai, India",
};

// WISE_DETAILS is built dynamically inside the component using live contactEmail

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: number, info: CurrencyInfo): string {
  return `${info.symbol}${amount.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_CURRENCY[tz] ?? "USD";
  } catch { return "USD"; }
}

// ── Main component ────────────────────────────────────────────────────────────

function PaymentInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { whatsappNumber, contactEmail } = useSiteSettings();

  const WISE_DETAILS = {
    "Account Name": "Zippy Minds Academy",
    "Email (Wise)": contactEmail,
    "Currency":     "INR / USD / GBP / EUR",
  };

  const courseName = searchParams.get("course")   ?? "Subscription";
  const courseId   = searchParams.get("courseId") ?? "";
  const priceParam = searchParams.get("price")    ?? "199";
  const inrAmount  = parseInt(priceParam, 10) || 199; // always INR base price

  const [selected,      setSelected]      = useState("razorpay");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [copied,        setCopied]        = useState<string | null>(null);

  // Currency state
  const [userCurrency,  setUserCurrency]  = useState<string>("INR");
  const [rates,         setRates]         = useState<Record<string, number>>({ INR: 1 });
  const [ratesLoading,  setRatesLoading]  = useState(true);
  const [showCurrPicker, setShowCurrPicker] = useState(false);

  // Detect user's currency from timezone + fetch live rates
  useEffect(() => {
    const detected = detectCurrency();
    setUserCurrency(detected);

    fetch("/api/currency")
      .then(r => r.ok ? r.json() : null)
      .then((d: { rates: Record<string, number> } | null) => {
        if (d?.rates) setRates(d.rates);
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  // Auto-select best gateway when currency is known (just a default — user can pick any)
  useEffect(() => {
    if (userCurrency === "INR") { setSelected("razorpay"); return; }
    if (PAYPAL_CURRENCIES.includes(userCurrency)) { setSelected("paypal"); return; }
    setSelected("stripe");
  }, [userCurrency]);

  // Computed values
  const currInfo   = CURRENCIES[userCurrency] ?? CURRENCIES["USD"];
  const rate       = rates[userCurrency] ?? 1;
  const converted  = Math.ceil(inrAmount * rate * 100) / 100; // round up to 2dp
  const isINR      = userCurrency === "INR";

  // All gateways are always available — just mark the recommended one
  const enrichedGateways = GATEWAYS.map(gw => {
    let recommended = false;
    if (gw.id === "razorpay" && isINR) recommended = true;
    if (gw.id === "paypal"   && !isINR && PAYPAL_CURRENCIES.includes(userCurrency)) recommended = true;
    if (gw.id === "stripe"   && !isINR && !PAYPAL_CURRENCIES.includes(userCurrency)) recommended = true;
    return { ...gw, supported: true, recommended };
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePay = async () => {
    setError("");

    if (selected === "whatsapp") {
      const msg = encodeURIComponent(`Hi! I'd like to pay for ${courseName}. Please share payment details.`);
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
      return;
    }
    if (selected === "bank" || selected === "wise") return;

    setLoading(true);
    try {
      // Razorpay → always INR
      // PayPal   → user currency if supported, otherwise USD
      // Stripe   → user currency if not INR, otherwise USD
      let chargeAmount   = converted;
      let chargeCurrency = userCurrency;

      if (selected === "razorpay") {
        chargeAmount   = inrAmount;
        chargeCurrency = "INR";
      } else if (selected === "paypal") {
        if (!PAYPAL_CURRENCIES.includes(userCurrency)) {
          // Convert to USD for PayPal when currency not supported
          chargeCurrency = "USD";
          chargeAmount   = Math.ceil(inrAmount * (rates["USD"] ?? 0.012) * 100) / 100;
        }
      } else if (selected === "stripe") {
        if (userCurrency === "INR") {
          // Stripe can handle INR in some regions; fall back to USD if needed
          chargeCurrency = "USD";
          chargeAmount   = Math.ceil(inrAmount * (rates["USD"] ?? 0.012) * 100) / 100;
        }
      }

      const res = await fetch("/api/payment/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ gateway: selected, amount: chargeAmount, currency: chargeCurrency, courseId, courseName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // ── Stripe redirect ──────────────────────────────────────────────────────
      if (selected === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      // ── PayPal redirect ──────────────────────────────────────────────────────
      if (selected === "paypal" && data.url) {
        window.location.href = data.url;
        return;
      }

      // ── Razorpay modal ───────────────────────────────────────────────────────
      if (selected === "razorpay" && data.orderId) {
        if (!window.Razorpay) throw new Error("Razorpay SDK not loaded. Please refresh.");
        const rzp = new window.Razorpay({
          key:         data.keyId,
          amount:      data.amount,
          currency:    data.currency,
          order_id:    data.orderId,
          name:        data.name,
          description: data.description,
          prefill:     data.prefill,
          theme:       { color: "#005da8" },
          handler:     () => router.push("/payment/success"),
          modal:       { ondismiss: () => setLoading(false) },
        });
        rzp.open();
        return;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again or choose another method.");
    } finally {
      setLoading(false);
    }
  };

  const showDetails = selected === "bank" || selected === "wise";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-semibold text-primary mb-4">
              <Sparkles size={14} /> Secure Payment
            </div>
            <h1 className="font-display text-3xl font-extrabold text-on-surface">Choose Payment Method</h1>
            <p className="text-on-surface-variant text-sm mt-1">All transactions are secure &amp; encrypted</p>
          </div>

          {/* ── Order summary + currency display ── */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide mb-0.5">You are paying for</p>
                <p className="font-bold text-on-surface text-lg">{courseName}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Monthly 1-to-1 tutoring · 4 sessions</p>
              </div>
              <div className="text-right shrink-0">
                {/* Primary price in user's currency */}
                <div className="flex items-baseline gap-0.5 justify-end">
                  {ratesLoading ? (
                    <div className="w-20 h-8 bg-primary/10 rounded animate-pulse" />
                  ) : (
                    <span className="font-display text-3xl font-extrabold text-primary">
                      {formatAmount(converted, currInfo)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant">/month</p>
                {/* Show INR base price if not already INR */}
                {!isINR && !ratesLoading && (
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
                    Base price: ₹{inrAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Currency selector */}
            <div className="mt-4 pt-4 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Globe size={13} />
                  <span>
                    {ratesLoading ? "Detecting your currency…" : `Showing price in ${currInfo.flag} ${currInfo.name}`}
                  </span>
                </div>
                <button onClick={() => setShowCurrPicker(p => !p)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  Change <ChevronDown size={12} className={`transition-transform ${showCurrPicker ? "rotate-180" : ""}`} />
                </button>
              </div>

              {showCurrPicker && (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {Object.values(CURRENCIES).map(c => (
                    <button key={c.code}
                      onClick={() => { setUserCurrency(c.code); setShowCurrPicker(false); }}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        userCurrency === c.code
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                      }`}>
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exchange rate note */}
          {!isINR && !ratesLoading && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4">
              <RefreshCw size={13} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                Live rate: ₹1 = {currInfo.symbol}{(rates[userCurrency] ?? 0).toFixed(4)} · Converted from ₹{inrAmount}
              </p>
            </div>
          )}

          {/* What's included */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">✅ What&apos;s included</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["4 live 1-on-1 sessions","Personalised learning plan","Session recordings","Monthly progress report","WhatsApp tutor support","Free rescheduling"].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-green-700">
                  <CheckCircle size={11} className="shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>

          {/* Gateway selection */}
          <div className="space-y-3 mb-6">
            {enrichedGateways.map(gw => (
              <button key={gw.id}
                onClick={() => setSelected(gw.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selected === gw.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-outline-variant hover:border-primary/40 bg-surface-container-lowest"
                }`}>
                <div className={`w-11 h-11 rounded-xl ${gw.iconBg} flex items-center justify-center text-xl shrink-0`}>
                  {gw.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-on-surface text-sm">{gw.label}</span>
                    {gw.recommended && (
                      <span className="text-[10px] font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{gw.subtitle}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${gw.badgeColor}`}>{gw.badge}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === gw.id ? "border-primary bg-primary" : "border-outline-variant"}`}>
                    {selected === gw.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Inline bank details */}
          {selected === "bank" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <p className="font-bold text-amber-800 mb-3 flex items-center gap-2"><Building2 size={16}/> Bank Transfer Details</p>
              <div className="space-y-2">
                {Object.entries(BANK_DETAILS).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-amber-700 font-medium">{k}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-900">{v}</span>
                      <button onClick={() => handleCopy(v, k)} className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-300">
                        {copied === k ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-3">Transfer <strong>₹{inrAmount}</strong> and send UTR to <strong>{contactEmail}</strong></p>
            </div>
          )}

          {selected === "wise" && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-6">
              <p className="font-bold text-teal-800 mb-3 flex items-center gap-2"><Globe size={16}/> Wise Transfer Details</p>
              <div className="space-y-2">
                {Object.entries(WISE_DETAILS).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-teal-700 font-medium">{k}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-teal-900">{v}</span>
                      <button onClick={() => handleCopy(v, k)} className="text-[10px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full hover:bg-teal-300">
                        {copied === k ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-teal-600 mt-3">
                Send <strong>{formatAmount(converted, currInfo)}</strong> via Wise, then email confirmation to <strong>{contactEmail}</strong>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* CTA */}
          {!showDetails && (
            <button onClick={handlePay} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 text-base shadow-md">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : selected === "whatsapp"
                  ? <><span>Continue on WhatsApp</span><ArrowRight size={18} /></>
                  : selected === "paypal"
                  ? <><span>🅿️</span><span>Continue to PayPal</span><ArrowRight size={18} /></>
                  : <>
                      <CreditCard size={18} />
                      <span>
                        Pay {formatAmount(selected === "razorpay" ? inrAmount : converted, selected === "razorpay" ? CURRENCIES["INR"] : currInfo)} Securely
                      </span>
                      <ArrowRight size={18} />
                    </>
              }
            </button>
          )}

          {showDetails && (
            <p className="text-center text-sm text-on-surface-variant py-3">
              Use the details above to complete your transfer manually.
            </p>
          )}

          <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1.5">
            <span>🔒</span> 256-bit SSL encryption · Your data is safe
          </p>

          <IndianRupee size={0} className="hidden" />{/* keeps import alive */}
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PaymentInner />
    </Suspense>
  );
}

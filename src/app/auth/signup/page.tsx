"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";

const benefits = [
  "Free 30-minute demo session",
  "Access to 500+ expert tutors",
  "Timezone-smart scheduling",
  "No commitment required",
];

function SignupForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? null;

  const [step, setStep]               = useState<"form" | "verify">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm]               = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp]                 = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [resending, setResending]     = useState(false);

  // Step 1 — validate form + send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("verify");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP + create account
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Redirect to book-demo (or wherever) after signup
      router.push(redirectTo ?? "/dashboard/parent");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError("");
    try {
      await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
    } finally {
      setResending(false);
    }
  };

  const loginHref = redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 pt-24 pb-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-start">

        {/* Left benefits panel */}
        <div className="hidden lg:flex flex-col bg-primary rounded-3xl p-10 text-on-primary">
          <div className="relative w-14 h-14 mb-6">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain" />
          </div>
          <h2 className="font-display text-3xl font-extrabold mb-3">Start your learning journey</h2>
          <p className="text-on-primary/70 mb-8">Join thousands of families giving their children the best educational foundation.</p>
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-secondary-container shrink-0" />
                <span className="text-on-primary/90">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 p-5 bg-white/10 rounded-2xl border border-white/20">
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5].map((s) => <span key={s} className="text-secondary-container text-lg">★</span>)}
            </div>
            <p className="text-sm text-on-primary/80 italic">&ldquo;Best decision for my child. Grades improved dramatically in just 2 months!&rdquo;</p>
            <p className="text-xs text-on-primary/50 mt-2">— Sarah M., UK Parent</p>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-card-hover p-8 md:p-10 border border-outline-variant">

          {step === "form" ? (
            <>
              <div className="flex flex-col items-center mb-7 lg:items-start">
                <h1 className="font-display text-2xl font-bold text-on-surface">Create your account</h1>
                <p className="text-on-surface-variant text-sm mt-1">
                  {redirectTo ? "Sign up to book your free demo session." : "Free to join · No credit card required"}
                </p>
              </div>

              {error && (
                <div className="bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium mb-4">{error}</div>
              )}

              {/* Google Sign-up */}
              <a
                href={`/api/auth/google?role=PARENT${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className="flex items-center justify-center gap-3 w-full border-2 border-outline-variant rounded-xl py-3 px-4 text-sm font-bold text-on-surface hover:bg-surface-container transition-all mb-5"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Sign up with Google
              </a>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-surface-container-lowest px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" placeholder="Your full name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-primary-container" />
                    <input type="email" placeholder="you@example.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Phone Number <span className="text-on-surface-variant font-normal">(optional)</span></label>
                  <div className="relative">
                    <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-11 pr-11" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading}
                  className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Send Verification Code</span><ArrowRight size={18} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-on-surface-variant mt-5">
                Already have an account?{" "}
                <Link href={loginHref} className="font-semibold text-primary hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={30} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-on-surface">Verify your email</h1>
                <p className="text-on-surface-variant text-sm mt-2">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-on-surface">{form.email}</span>
                </p>
              </div>

              {error && (
                <div className="bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium mb-4">{error}</div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5 text-center">Enter 6-digit code</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} placeholder="123456"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="input-field text-center text-2xl font-bold tracking-[0.5em] py-4" required
                  />
                </div>

                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShieldCheck size={18} /><span>Verify & Create Account</span></>}
                </button>
              </form>

              <div className="text-center mt-5 space-y-2">
                <button onClick={handleResend} disabled={resending}
                  className="text-sm text-primary hover:underline disabled:opacity-50">
                  {resending ? "Sending..." : "Resend code"}
                </button>
                <br />
                <button onClick={() => { setStep("form"); setError(""); setOtp(""); }}
                  className="text-sm text-on-surface-variant hover:text-on-surface">
                  ← Change email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

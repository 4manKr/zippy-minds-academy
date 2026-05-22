"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Shield, Mail, Users, Globe, Sparkles } from "lucide-react";

type Role = "parent" | "tutor";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? null;
  const googleError  = searchParams.get("error");

  const googleErrorMsg =
    googleError === "google_denied"     ? "Google sign-in was cancelled." :
    googleError === "google_unverified" ? "Your Google email is not verified. Please use email login." :
    googleError === "google_failed"     ? "Google sign-in failed. Please try again." : "";

  const [role, setRole]           = useState<Role>("parent");
  const [email, setEmail]         = useState("");
  const [code, setCode]           = useState("");
  const [codeSent, setCodeSent]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  const handleGetCode = async () => {
    if (!email) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCodeSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Client-side redirect takes priority (e.g. ?redirect=/book-demo)
      router.push(redirectTo ?? data.redirect ?? "/dashboard/parent");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const footerTrust = [
    { icon: Shield,   label: "Safe & Secure"    },
    { icon: Users,    label: "Expert Tutors"     },
    { icon: Globe,    label: "Global Community"  },
    { icon: Sparkles, label: "Fun Learning"      },
  ];

  const signupHref = redirectTo ? `/auth/signup?redirect=${encodeURIComponent(redirectTo)}` : "/auth/signup";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="fixed top-20 left-16 text-primary/10 text-7xl select-none pointer-events-none animate-float">🚀</div>
      <div className="fixed bottom-32 right-20 text-secondary-container/30 text-5xl select-none pointer-events-none animate-float" style={{ animationDelay: "2s" }}>⚡</div>
      <div className="fixed top-1/3 right-12 text-tertiary-fixed/40 text-4xl select-none pointer-events-none animate-float" style={{ animationDelay: "1s" }}>⭐</div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-primary leading-tight">
            Welcome back!
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {redirectTo ? "Sign in to continue booking your demo." : "Log in to continue your learning journey."}
          </p>
        </div>

        <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-card-hover border border-outline-variant/40 p-8">
          {/* Role tabs */}
          <div className="flex rounded-full bg-surface-container p-1 mb-6">
            {(["parent", "tutor"] as Role[]).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${
                  role === r ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}>
                {r === "parent" ? "Parent / Student" : "Tutor"}
              </button>
            ))}
          </div>

          {googleErrorMsg && (
            <div className="bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium mb-4">{googleErrorMsg}</div>
          )}

          {/* Google Sign-in */}
          <a
            href={`/api/auth/google?role=${role === "tutor" ? "TUTOR" : "PARENT"}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="flex items-center justify-center gap-3 w-full border-2 border-outline-variant rounded-xl py-3 px-4 text-sm font-bold text-on-surface hover:bg-surface-container transition-all mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </a>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant" /></div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Or use email code</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-on-surface">Verification Code</label>
                <button type="button" onClick={handleGetCode} disabled={!email || loading}
                  className="text-xs font-bold text-primary hover:underline disabled:opacity-50">
                  {loading ? "Sending…" : codeSent ? "Resend Code" : "Get Code"}
                </button>
              </div>
              <div className="relative">
                <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input type="text" placeholder="6-digit code" value={code}
                  onChange={(e) => setCode(e.target.value)} maxLength={6}
                  className="input-field pl-10 tracking-widest font-mono" />
              </div>
              {codeSent && (
                <p className="text-xs text-primary mt-1.5 font-medium">
                  ✅ Code sent! Check your email inbox.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium">{error}</div>
            )}

            <button type="submit" disabled={submitting || !code}
              className="btn-primary w-full justify-center py-3.5 text-sm mt-2 rounded-xl disabled:opacity-60">
              {submitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Login</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant" /></div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">New Here?</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href={signupHref} className="btn-secondary w-full justify-center py-3 text-sm rounded-xl">
              Create Account
            </Link>
            {!redirectTo && (
              <Link href="/book-demo" className="btn-yellow w-full justify-center py-3 text-sm rounded-xl">
                Book a Free Demo
              </Link>
            )}
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-5">
            Having trouble?{" "}
            <Link href="/contact" className="text-primary font-semibold hover:underline">Contact Support</Link>
          </p>
        </div>
      </main>

      <div className="border-t border-outline-variant bg-surface-container-low py-4">
        <div className="max-w-lg mx-auto flex items-center justify-around px-4">
          {footerTrust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
              <Icon size={13} className="text-primary shrink-0" /> {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

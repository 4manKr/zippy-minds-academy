"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield, Mail, Users, Globe, Sparkles } from "lucide-react";

type Role = "parent" | "tutor";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole]         = useState<Role>("parent");
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const handleGetCode = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
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
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.redirect ?? "/dashboard/parent");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const footerTrust = [
    { icon: Shield,   label: "Safe & Secure" },
    { icon: Users,    label: "Expert Tutors" },
    { icon: Globe,    label: "Global Community" },
    { icon: Sparkles, label: "Fun Learning" },
  ];

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
          <p className="text-on-surface-variant text-sm mt-1">Log in to continue your learning journey.</p>
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
                  ✅ Code sent! Check your email. (Dev: check terminal console)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-error-container text-error rounded-xl px-4 py-2.5 text-sm font-medium">
                {error}
              </div>
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
            <Link href="/auth/signup" className="btn-secondary w-full justify-center py-3 text-sm rounded-xl">
              Create Account
            </Link>
            <Link href="/book-demo" className="btn-yellow w-full justify-center py-3 text-sm rounded-xl">
              Book a Free Demo
            </Link>
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

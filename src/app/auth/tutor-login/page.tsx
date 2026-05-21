"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap, AlertCircle } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function TutorLoginPage() {
  const router = useRouter();
  const { contactEmail } = useSiteSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "TUTOR" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.redirect ?? "/dashboard/tutor");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tertiary-fixed/30 to-primary-fixed/20 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-3xl shadow-card-hover p-8 md:p-10 border border-outline-variant/20">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-3">
              <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain rounded-2xl" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={20} className="text-tertiary" />
              <h1 className="text-2xl font-bold text-on-surface">Tutor Portal</h1>
            </div>
            <p className="text-on-surface-variant text-sm">Sign in to your tutor dashboard</p>
          </div>

          {/* Role switcher */}
          <div className="flex rounded-xl overflow-hidden border border-outline-variant/30 mb-6">
            <Link href="/auth/login" className="flex-1 py-2.5 text-sm font-medium text-center text-on-surface-variant hover:bg-surface-container transition-colors">
              Parent
            </Link>
            <span className="flex-1 py-2.5 text-sm font-semibold text-center bg-tertiary text-on-tertiary">
              Tutor
            </span>
            <Link href="/auth/admin-login" className="flex-1 py-2.5 text-sm font-medium text-center text-on-surface-variant hover:bg-surface-container transition-colors">
              Admin
            </Link>
          </div>

          {/* Info banner */}
          <div className="bg-tertiary-fixed/30 border border-tertiary/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <GraduationCap size={18} className="text-tertiary mt-0.5 shrink-0" />
            <p className="text-sm text-tertiary">
              This portal is exclusively for approved Zippy Minds tutors.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-error-container text-error rounded-xl px-4 py-3 text-sm font-medium mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Tutor Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  placeholder="tutor@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-tertiary to-primary text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Access Dashboard</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Need access?{" "}
            <a href={`mailto:${contactEmail}`} className="font-semibold text-tertiary hover:underline">
              Contact admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, KeyRound, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", adminKey: "" });
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
        body: JSON.stringify({ ...form, role: "ADMIN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.redirect ?? "/dashboard/admin");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary/20 to-gray-900 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-3xl shadow-card-hover p-8 md:p-10 border border-outline-variant/20">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-3">
              <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain rounded-2xl" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-error" />
              <h1 className="text-2xl font-bold text-on-surface">Admin Portal</h1>
            </div>
            <p className="text-on-surface-variant text-sm">Restricted access · Authorized personnel only</p>
          </div>

          {/* Role switcher */}
          <div className="flex rounded-xl overflow-hidden border border-outline-variant/30 mb-6">
            <Link href="/auth/login" className="flex-1 py-2.5 text-sm font-medium text-center text-on-surface-variant hover:bg-surface-container transition-colors">Parent</Link>
            <Link href="/auth/tutor-login" className="flex-1 py-2.5 text-sm font-medium text-center text-on-surface-variant hover:bg-surface-container transition-colors">Tutor</Link>
            <span className="flex-1 py-2.5 text-sm font-semibold text-center bg-gray-900 text-white">Admin</span>
          </div>

          {/* Security banner */}
          <div className="bg-error-container/40 border border-error/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Shield size={16} className="text-error mt-0.5 shrink-0" />
            <p className="text-xs text-error">
              This is a secure admin portal. All access attempts are logged and monitored.
              Unauthorized access is strictly prohibited.
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
              <label className="block text-sm font-medium text-on-surface mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  placeholder="admin@zippyminds.com"
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
                  placeholder="Admin password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Admin Secret Key</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter admin secret key"
                  value={form.adminKey}
                  onChange={(e) => setForm({ ...form, adminKey: e.target.value })}
                  className="input-field pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Set via ADMIN_SECRET_KEY environment variable</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-60 mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Shield size={18} /><span>Access Admin Dashboard</span></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

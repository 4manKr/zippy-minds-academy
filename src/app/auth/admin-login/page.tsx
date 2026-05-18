"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", adminKey: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("2fa"); }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
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
            <Link href="/auth/admin-login" className="flex-1 py-2.5 text-sm font-semibold text-center bg-gray-900 text-white">Admin</Link>
          </div>

          {/* Security banner */}
          <div className="bg-error-container/40 border border-error/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Shield size={16} className="text-error mt-0.5 shrink-0" />
            <p className="text-xs text-error">
              This is a secure admin portal. All access attempts are logged and monitored.
              Unauthorized access is strictly prohibited.
            </p>
          </div>

          {step === "login" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="email" placeholder="admin@zippyminds.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type={showPassword ? "text" : "password"} placeholder="Admin password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Admin Secret Key</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="password" placeholder="Enter admin secret key" value={form.adminKey} onChange={(e) => setForm({ ...form, adminKey: e.target.value })} className="input-field pl-11" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all mt-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Shield size={18} /> Proceed to Verification</>}
              </button>
            </form>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={24} className="text-on-surface-variant" />
                </div>
                <h3 className="font-bold text-on-surface">Two-Factor Authentication</h3>
                <p className="text-sm text-on-surface-variant mt-1">Enter the 6-digit code sent to your admin email</p>
              </div>
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-outline-variant rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                  />
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all">
                <ArrowRight size={18} /> Access Admin Dashboard
              </button>
              <button onClick={() => setStep("login")} className="w-full text-center text-sm text-on-surface-variant hover:text-on-surface mt-3 py-2">
                ← Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

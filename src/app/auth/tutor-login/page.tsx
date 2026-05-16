"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";

export default function TutorLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card-hover p-8 md:p-10 border border-purple-100">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-3">
              <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain rounded-2xl" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={20} className="text-brand-purple" />
              <h1 className="text-2xl font-bold text-gray-900">Tutor Portal</h1>
            </div>
            <p className="text-gray-500 text-sm">Sign in to your tutor dashboard</p>
          </div>

          {/* Role switcher */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <Link href="/auth/login" className="flex-1 py-2.5 text-sm font-medium text-center text-gray-500 hover:bg-gray-50 transition-colors">
              Parent
            </Link>
            <Link href="/auth/tutor-login" className="flex-1 py-2.5 text-sm font-semibold text-center bg-brand-purple text-white">
              Tutor
            </Link>
            <Link href="/auth/admin-login" className="flex-1 py-2.5 text-sm font-medium text-center text-gray-500 hover:bg-gray-50 transition-colors">
              Admin
            </Link>
          </div>

          {/* Info banner */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <GraduationCap size={18} className="text-brand-purple mt-0.5 shrink-0" />
            <p className="text-sm text-purple-700">
              This portal is exclusively for approved Zippy Minds tutors.
              Want to become a tutor?{" "}
              <Link href="/auth/tutor-signup" className="font-semibold underline">Apply here</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tutor Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-brand-purple hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Access Dashboard <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Not a tutor yet?{" "}
            <Link href="/auth/tutor-signup" className="font-semibold text-brand-purple hover:underline">
              Apply to teach
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

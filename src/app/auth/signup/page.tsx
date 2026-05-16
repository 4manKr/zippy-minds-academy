"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Chrome, CheckCircle } from "lucide-react";

const benefits = [
  "Free 30-minute demo session",
  "Access to 500+ expert tutors",
  "Timezone-smart scheduling",
  "No commitment required",
];

export default function ParentSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 pt-24 pb-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-start">
        {/* Left benefits panel */}
        <div className="hidden lg:block bg-gradient-to-br from-brand-blue to-brand-purple rounded-3xl p-10 text-white">
          <div className="relative w-14 h-14 mb-6">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds" fill className="object-contain rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Start your learning journey</h2>
          <p className="text-white/70 mb-8">Join thousands of families giving their children the best educational foundation.</p>
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-cyan shrink-0" />
                <span className="text-white/90">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 p-5 bg-white/10 rounded-2xl border border-white/20">
            <div className="flex gap-3 mb-2">
              {[1,2,3,4,5].map((s) => <span key={s} className="text-yellow-400">★</span>)}
            </div>
            <p className="text-sm text-white/80 italic">&ldquo;Best decision for my child. Grades improved dramatically in just 2 months!&rdquo;</p>
            <p className="text-xs text-white/50 mt-2">— Sarah M., UK Parent</p>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-white rounded-3xl shadow-card-hover p-8 md:p-10 border border-gray-100">
          <div className="flex flex-col items-center mb-7 lg:items-start">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Free to join · No credit card required</p>
          </div>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all mb-5">
            <Chrome size={18} className="text-blue-500" />
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-brand-blue hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3.5 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-blue hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

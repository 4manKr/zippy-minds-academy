"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="gradient-bg py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block">Contact Us</span>
          <h1 className="text-5xl font-bold mb-4">We&apos;d love to hear from you</h1>
          <p className="text-white/70 text-lg">Have a question, need support, or want to partner with us? Reach out!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, title: "Email Us", detail: "hello@zippymindsacademy.com", sub: "We reply within 4 hours" },
              { icon: Phone, title: "Call Us", detail: "+91 99999 99999", sub: "Mon–Sat, 9 AM–8 PM IST" },
              { icon: MapPin, title: "Head Office", detail: "New Delhi, India", sub: "Serving students globally" },
              { icon: Clock, title: "Support Hours", detail: "24/7 for urgent issues", sub: "Standard: Mon–Sat 9–8 IST" },
            ].map(({ icon: Icon, title, detail, sub }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-card">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-brand-blue text-sm font-medium">{detail}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-card border border-gray-100 p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-500">We&apos;ll get back to you within 4 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary mt-6">Send another message</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare size={22} className="text-brand-blue" /> Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                      <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field">
                      <option value="">Select a topic</option>
                      <option>Booking & Scheduling</option>
                      <option>Payment & Billing</option>
                      <option>Tutor Quality</option>
                      <option>Technical Support</option>
                      <option>Partnership Enquiry</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea placeholder="Describe your question or issue in detail..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field h-36 resize-none" required />
                  </div>
                  <button type="submit" className="w-full btn-primary justify-center py-3.5">
                    <Send size={18} /> Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

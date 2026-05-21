"use client";

import { useState } from "react";
import { Mail, Phone, Globe, Clock, Send, MessageSquare, CheckCircle } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function ContactPage() {
  const { contactEmail, phone } = useSiteSettings();
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  const contactInfo = [
    { icon: Mail,  title: "Email Us",       detail: contactEmail,               sub: "Reply within 4 hours",         href: `mailto:${contactEmail}` },
    { icon: Phone, title: "Call / WhatsApp", detail: phone,                     sub: "Mon–Sat, 9 AM–8 PM IST",       href: telHref },
    { icon: Globe, title: "Website",        detail: "www.zippymindsacademy.com", sub: "Explore all courses & tutors", href: "https://www.zippymindsacademy.com" },
    { icon: Clock, title: "Support Hours",  detail: "24/7 for urgent issues",   sub: "Standard: Mon–Sat 9–8 IST",    href: undefined },
  ];

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-primary pt-24 pb-0 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-secondary-container/10 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 text-center text-on-primary pb-14">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">Contact Us</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            We&apos;d love to{" "}
            <span className="text-secondary-container">hear from you</span>
          </h1>
          <p className="text-on-primary/80 text-lg max-w-xl mx-auto mb-10">
            Have a question, need support, or want to partner with us? Our team is here every step of the way.
          </p>

          {/* Quick contact chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`mailto:${contactEmail}`}
               className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/20 transition-all">
              <Mail size={14} /> {contactEmail}
            </a>
            <a href={telHref}
               className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-white/20 transition-all">
              <Phone size={14} /> {phone}
            </a>
            <span className="inline-flex items-center gap-2 bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-sm font-semibold px-4 py-2 rounded-full">
              <Clock size={14} /> 24/7 Support
            </span>
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-8 bg-surface-container-low" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Info cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-xl font-bold text-on-surface mb-6">Get in touch</h2>
            {contactInfo.map(({ icon: Icon, title, detail, sub, href }) => (
              <div key={title} className="flex items-start gap-4 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-on-surface">{title}</p>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="text-primary text-sm font-medium hover:underline">
                      {detail}
                    </a>
                  ) : (
                    <p className="text-primary text-sm font-medium">{detail}</p>
                  )}
                  <p className="text-xs text-on-surface-variant">{sub}</p>
                </div>
              </div>
            ))}

            {/* Response time badge */}
            <div className="bg-secondary-container/15 border border-secondary-container/30 rounded-2xl px-5 py-4">
              <p className="text-sm font-semibold text-secondary">⚡ Average response time: under 4 hours</p>
              <p className="text-xs text-on-surface-variant mt-1">Our support team is online Mon–Sat, 9 AM to 8 PM IST.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-on-surface mb-2">Message sent!</h3>
                <p className="text-on-surface-variant">We&apos;ll get back to you within 4 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary mt-6">Send another message</button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-on-surface mb-1 flex items-center gap-2">
                  <MessageSquare size={22} className="text-primary" /> Send us a message
                </h2>
                <p className="text-sm text-on-surface-variant mb-6">Fill in the form and we&apos;ll get back to you shortly.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1.5">Your Name</label>
                      <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-1.5">Email Address</label>
                      <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field">
                      <option value="">Select a topic</option>
                      <option>Booking &amp; Scheduling</option>
                      <option>Payment &amp; Billing</option>
                      <option>Tutor Quality</option>
                      <option>Technical Support</option>
                      <option>Partnership Enquiry</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Message</label>
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

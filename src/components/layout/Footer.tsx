"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const footerLinks = {
  Platform: [
    { label: "Courses",       href: "/courses"    },
    { label: "Book Free Demo",href: "/book-demo"  },
    { label: "Our Tutors",    href: "/tutors"     },
  ],
  Company: [
    { label: "About Us",      href: "/about"      },
    { label: "Contact",       href: "/contact"    },
    { label: "FAQ",           href: "/faq"        },
  ],
  Account: [
    { label: "Login",  href: "/auth/login"  },
    { label: "Sign Up",href: "/auth/signup" },
  ],
  Legal: [
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms & Conditions",href: "/terms"   },
    { label: "Refund Policy",     href: "/refund"  },
  ],
};

const socials = [
  { icon: Facebook,  href: "https://www.facebook.com/share/1WWDWsddNg/",                                                                                        label: "Facebook",  color: "hover:bg-[#1877F2]" },
  { icon: Twitter,   href: "#",                                                                                                                                    label: "Twitter",   color: "hover:bg-[#1DA1F2]" },
  { icon: Instagram, href: "https://www.instagram.com/zippymindsacademy?igsh=cmNjbmpkMTNydWRx",                                                                   label: "Instagram", color: "hover:bg-[#E1306C]" },
  { icon: Linkedin,  href: "https://www.linkedin.com/in/zippy-minds-academy-22884540b?utm_source=share_via&utm_content=profile&utm_medium=member_ios",             label: "LinkedIn",  color: "hover:bg-[#0A66C2]" },
  { icon: Youtube,   href: "https://youtube.com/@zippymindsacademy?si=aX10Dm_5gRM1ssHB",                                                                        label: "YouTube",   color: "hover:bg-[#FF0000]"  },
];

export default function Footer() {
  const { contactEmail, phone } = useSiteSettings();

  return (
    <footer className="bg-[#0a0f1e] text-white">

      {/* ── Top CTA Banner ── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
          <div className="bg-gradient-to-r from-[#005da8] to-[#2d5be3] rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-300 mb-2">🎓 Free Demo Available</p>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight">
                Give your child the best start.<br className="hidden md:block" /> Book a free session today!
              </h3>
            </div>
            <Link href="/book-demo"
              className="shrink-0 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-extrabold px-8 py-4 rounded-2xl text-base shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap">
              Book Free Demo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14 bg-white rounded-xl p-1">
                <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain rounded-lg" />
              </div>
              <div>
                <p className="font-display font-extrabold text-white text-xl leading-tight">Zippy Minds</p>
                <p className="text-xs text-white/60 font-medium tracking-wide">Academy</p>
              </div>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Connecting parents worldwide with expert Indian tutors for personalized
              1-to-1 online learning sessions. Premium education, globally accessible.
            </p>
            <div className="space-y-3">
              <a href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 text-sm text-white/60 hover:text-yellow-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors shrink-0">
                  <Mail size={14} className="text-yellow-400" />
                </div>
                {contactEmail}
              </a>
              <a href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-sm text-white/60 hover:text-yellow-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors shrink-0">
                  <Phone size={14} className="text-yellow-400" />
                </div>
                {phone}
              </a>
              <a href="https://www.zippymindsacademy.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-yellow-300 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors shrink-0">
                  <Globe size={14} className="text-yellow-400" />
                </div>
                www.zippymindsacademy.com
              </a>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2.5 mt-7">
              {socials.map(({ icon: Icon, href, label, color }) => (
                <a key={label} href={href} aria-label={label}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  className={`w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 ${color}`}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-2 border-b border-white/10">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-white/55 hover:text-yellow-300 transition-colors duration-200 flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-yellow-400 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust badges strip ── */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-5">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 text-xs text-white/40 font-semibold uppercase tracking-widest">
            <span>🌍 50+ Countries</span>
            <span>👩‍🎓 500+ Expert Tutors</span>
            <span>⭐ 4.9 / 5 Rating</span>
            <span>🔒 Safe & Secure</span>
            <span>🇮🇳 Made in India</span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Zippy Minds Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-white/70 transition-colors">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

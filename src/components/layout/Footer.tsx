import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Courses", href: "/courses" },
    { label: "Book Free Demo", href: "/book-demo" },
    { label: "Our Tutors", href: "/tutors" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
  Account: [
    { label: "Login", href: "/auth/login" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

const socials = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-on-surface-variant">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14">
                <Image
                  src="/zippy-logo.jpeg"
                  alt="Zippy Minds Academy"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-inverse-on-surface text-lg leading-tight">Zippy Minds</p>
                <p className="text-xs text-on-surface-variant">Academy</p>
              </div>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Connecting parents worldwide with expert Indian tutors for personalized
              1-to-1 online learning sessions. Premium education, globally accessible.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail size={15} className="text-secondary-container shrink-0" />
                <a href="mailto:hello@zippymindsacademy.com" className="hover:text-inverse-on-surface transition-colors">
                  hello@zippymindsacademy.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={15} className="text-secondary-container shrink-0" />
                <a href="tel:+919999999999" className="hover:text-inverse-on-surface transition-colors">
                  +91 99999 99999
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin size={15} className="text-secondary-container shrink-0" />
                <span>New Delhi, India · Available Worldwide</span>
              </div>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-inverse-on-surface mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant hover:text-inverse-on-surface transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            © 2025 Zippy Minds Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-on-surface-variant">
            <span>🌍 Available in 50+ Countries</span>
            <span className="mx-3">·</span>
            <span>🇮🇳 Powered by India&apos;s Best Tutors</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

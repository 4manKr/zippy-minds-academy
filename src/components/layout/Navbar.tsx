"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About Us", href: "/about" },
  { label: "Courses",  href: "/courses" },
  { label: "Reviews",  href: "/reviews" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex items-center justify-between h-16 md:h-18">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9 md:w-10 md:h-10">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain rounded-lg" priority />
          </div>
          <span className="font-display font-extrabold text-base md:text-lg text-primary tracking-tight leading-none">
            Zippy Minds Academy
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors duration-200 border-b-2 pb-0.5",
                pathname === link.href
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-primary hover:border-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-xl transition-all">
            Login
          </Link>
          <Link href="/book-demo" className="bg-secondary-container text-on-secondary-fixed font-bold text-sm px-5 py-2.5 rounded-full shadow-sm squishy-hover">
            Enroll Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  pathname === link.href
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2 border-t border-outline-variant mt-3">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block w-full text-center btn-secondary py-2.5 text-sm">
                Login
              </Link>
              <Link href="/book-demo" onClick={() => setMobileOpen(false)} className="block w-full text-center btn-yellow py-2.5 text-sm justify-center">
                Book Free Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

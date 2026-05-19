"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import DemoCTA from "@/components/DemoCTA";

const navLinks = [
  { label: "About Us", href: "/about" },
  { label: "Courses",  href: "/courses" },
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
          <div className="relative w-12 h-12 md:w-14 md:h-14">
            <Image src="/zippy-logo.jpeg" alt="Zippy Minds Academy" fill className="object-contain" priority />
          </div>
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
        <div className="hidden md:flex items-center gap-2">
          <Link href="/auth/login" className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-xl transition-all border border-primary/20">
            Login
          </Link>
          <Link href="/auth/signup" className="text-sm font-semibold text-on-surface-variant px-4 py-2 hover:bg-surface-container rounded-xl transition-all border border-outline-variant">
            Sign Up
          </Link>
          <DemoCTA className="bg-secondary-container text-on-secondary-fixed font-bold text-sm px-5 py-2.5 rounded-full shadow-sm squishy-hover ml-1" />
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
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block w-full text-center btn-secondary py-2.5 text-sm">
                  Login
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 text-sm font-semibold border border-outline-variant text-on-surface-variant rounded-2xl hover:bg-surface-container transition-all">
                  Sign Up
                </Link>
              </div>
              <DemoCTA className="block w-full text-center btn-yellow py-2.5 text-sm justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

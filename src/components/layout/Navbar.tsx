"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Bell, User, LogOut, LayoutDashboard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Tutors", href: "/tutors" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mock auth state — replace with real auth
  const isLoggedIn = false;
  const userRole = "parent"; // parent | tutor | admin

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/zippy-logo.jpeg"
                alt="Zippy Minds Academy"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className={cn(
              "font-bold text-lg hidden sm:block transition-colors duration-300",
              scrolled ? "text-brand-blue" : "text-white"
            )}>
              Zippy Minds
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  pathname === link.href
                    ? scrolled
                      ? "text-brand-blue bg-brand-blue/5"
                      : "text-white bg-white/10"
                    : scrolled
                    ? "text-gray-600 hover:text-brand-blue hover:bg-gray-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button className={cn(
                  "p-2 rounded-lg transition-colors",
                  scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"
                )}>
                  <Bell size={20} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                      scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <ChevronDown size={16} className={scrolled ? "text-gray-600" : "text-white"} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 animate-slide-down">
                      <Link href="/dashboard/parent" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link href="/dashboard/parent/sessions" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <BookOpen size={16} /> My Sessions
                      </Link>
                      <Link href="/dashboard/parent/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={16} /> Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={cn(
                    "font-medium text-sm px-4 py-2 rounded-lg transition-all",
                    scrolled ? "text-gray-700 hover:text-brand-blue" : "text-white hover:text-white/80"
                  )}
                >
                  Sign In
                </Link>
                <Link href="/book-demo" className="btn-primary text-sm py-2.5">
                  Book Free Demo
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "lg:hidden p-2 rounded-lg transition-colors",
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
            )}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 animate-slide-down">
            <div className="p-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl font-medium text-base transition-all",
                    pathname === link.href
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-3 border-t border-gray-100 mt-4">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center btn-secondary"
                >
                  Sign In
                </Link>
                <Link
                  href="/book-demo"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center btn-primary"
                >
                  Book Free Demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

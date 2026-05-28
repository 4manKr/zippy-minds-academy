"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import DemoCTA from "@/components/DemoCTA";

const navLinks = [
  { label: "About Us", href: "/about"   },
  { label: "Courses",  href: "/courses" },
  { label: "Blog",     href: "/blog"    },
  { label: "Contact",  href: "/contact" },
];

interface AuthUser { name: string; email: string; role: string; }

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // Check session on every navigation
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setAuthUser(d.user ?? null))
      .catch(() => setAuthUser(null))
      .finally(() => setAuthChecked(true));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
    setAccountOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const dashboardHref =
    authUser?.role === "TUTOR"  ? "/dashboard/tutor"  :
    authUser?.role === "ADMIN"  ? "/dashboard/admin"  :
    "/dashboard/parent";

  const dashboardLabel =
    authUser?.role === "TUTOR"  ? "Tutor Dashboard"  :
    authUser?.role === "ADMIN"  ? "Admin Panel"      :
    "Parent Dashboard";

  const initials = authUser?.name
    ? authUser.name.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const roleColor =
    authUser?.role === "TUTOR"  ? "bg-purple-500" :
    authUser?.role === "ADMIN"  ? "bg-red-500"    :
    "bg-primary";

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 flex items-center justify-between h-[72px] md:h-[84px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden">
            <Image src="/zippy-logo-new.jpeg" alt="Zippy Minds Academy" fill className="object-cover" priority />
          </div>
          <div className="relative w-16 h-16 md:w-[88px] md:h-[88px]">
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

        {/* Desktop right — auth-aware */}
        <div className="hidden md:flex items-center gap-2">
          {!authChecked ? (
            /* skeleton while checking auth */
            <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
          ) : authUser ? (
            /* ── Logged-in ── */
            <div className="relative">
              <button
                onClick={() => setAccountOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-all border border-outline-variant/50"
              >
                <div className={`w-7 h-7 rounded-full ${roleColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initials}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-on-surface leading-none">{authUser.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">{authUser.role.charAt(0) + authUser.role.slice(1).toLowerCase()}</p>
                </div>
                <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-2xl shadow-card-hover border border-outline-variant py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/30 mb-1">
                    <p className="text-xs font-bold text-on-surface truncate">{authUser.name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{authUser.email}</p>
                  </div>
                  <Link href={dashboardHref} onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
                    <LayoutDashboard size={15} className="text-primary" /> {dashboardLabel}
                  </Link>
                  <Link href={`${dashboardHref}#profile`} onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                    <User size={15} /> My Profile
                  </Link>
                  <div className="border-t border-outline-variant/30 mt-1 pt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest ── */
            <>
              <Link href="/auth/login" className="text-sm font-semibold text-primary px-4 py-2 hover:bg-primary/5 rounded-xl transition-all border border-primary/20">
                Login
              </Link>
              <Link href="/auth/signup" className="text-sm font-semibold text-on-surface-variant px-4 py-2 hover:bg-surface-container rounded-xl transition-all border border-outline-variant">
                Sign Up
              </Link>
              <DemoCTA className="bg-secondary-container text-on-secondary-fixed font-bold text-sm px-5 py-2.5 rounded-full shadow-sm squishy-hover ml-1" />
            </>
          )}
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

            <div className="pt-3 border-t border-outline-variant mt-3">
              {authUser ? (
                /* ── Logged-in mobile ── */
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2 bg-surface-container rounded-xl">
                    <div className={`w-9 h-9 rounded-full ${roleColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{authUser.name}</p>
                      <p className="text-xs text-on-surface-variant">{authUser.role.charAt(0) + authUser.role.slice(1).toLowerCase()}</p>
                    </div>
                  </div>
                  <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-all">
                    <LayoutDashboard size={16} /> {dashboardLabel}
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                /* ── Guest mobile ── */
                <div className="space-y-2">
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close dropdown */}
      {accountOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
      )}
    </header>
  );
}

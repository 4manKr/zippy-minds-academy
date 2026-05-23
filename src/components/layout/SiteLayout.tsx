"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import CustomCourseFloatingCTA from "@/components/CustomCourseFloatingCTA";
import LeadCapturePopup from "@/components/LeadCapturePopup";

const DASHBOARD_PREFIXES = ["/dashboard", "/auth"];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  if (isDashboard) {
    return <SiteSettingsProvider>{children}</SiteSettingsProvider>;
  }

  return (
    <SiteSettingsProvider>
      <LeadCapturePopup />
      <CustomCourseFloatingCTA />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </SiteSettingsProvider>
  );
}

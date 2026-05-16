import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Zippy Minds Academy — 1-to-1 Online Tutoring Worldwide",
    template: "%s | Zippy Minds Academy",
  },
  description:
    "Connect with expert Indian tutors for personalized 1-to-1 online learning. Book a free demo session today. Available worldwide with timezone-aware scheduling.",
  keywords: ["online tutoring", "Indian tutors", "1-to-1 learning", "personalized education", "online classes"],
  openGraph: {
    title: "Zippy Minds Academy",
    description: "Premium 1-to-1 online tutoring with expert Indian tutors. Available worldwide.",
    url: "https://www.zippymindsacademy.com",
    siteName: "Zippy Minds Academy",
    type: "website",
  },
};

const noLayoutPaths = ["/dashboard", "/tutor", "/admin", "/auth"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

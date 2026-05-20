import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";
import { Toaster } from "sonner";
import MaintenanceGate from "@/components/MaintenanceGate";

export const metadata: Metadata = {
  title: {
    default: "Zippy Minds Academy — 1-to-1 Online Tutoring Worldwide",
    template: "%s | Zippy Minds Academy",
  },
  description:
    "Connect with expert Indian tutors for personalized 1-to-1 online learning. Book a free demo session today. Available worldwide with timezone-aware scheduling.",
  keywords: ["online tutoring", "Indian tutors", "1-to-1 learning", "personalized education", "online classes"],
  icons: {
    icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/logo.jpg", type: "image/jpeg" }],
  },
  openGraph: {
    title: "Zippy Minds Academy",
    description: "Premium 1-to-1 online tutoring with expert Indian tutors. Available worldwide.",
    url: "https://www.zippymindsacademy.com",
    siteName: "Zippy Minds Academy",
    type: "website",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "Zippy Minds Academy" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W6ZQQJDN');`,
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W6ZQQJDN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* MaintenanceGate reads DB on every page render — shows maintenance
            page to non-admins when maintenance mode is ON in settings */}
        <MaintenanceGate>
          <SiteLayout>{children}</SiteLayout>
          <Toaster richColors position="top-right" />
        </MaintenanceGate>
      </body>
    </html>
  );
}

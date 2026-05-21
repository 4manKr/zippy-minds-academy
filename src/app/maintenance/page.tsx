"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function MaintenancePage() {
  const { contactEmail, phone, whatsappNumber } = useSiteSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-surface to-secondary/10 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <Image
              src="/zippy-logo.jpeg"
              alt="Zippy Minds Academy"
              fill
              className="object-contain rounded-2xl shadow-card"
            />
          </div>
        </div>

        {/* Icon */}
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🔧</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-3">
          Under Maintenance
        </h1>
        <p className="text-on-surface-variant text-lg mb-2">
          We&apos;re making Zippy Minds Academy even better for you!
        </p>
        <p className="text-on-surface-variant text-sm mb-8">
          Our site is temporarily down for scheduled maintenance. We&apos;ll be back shortly.
          Thank you for your patience! 🙏
        </p>

        {/* Contact */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 mb-6 text-left space-y-3">
          <p className="text-sm font-semibold text-on-surface">Need help right now?</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm text-on-surface hover:text-primary transition-colors"
          >
            <span className="text-xl">💬</span>
            WhatsApp us at {phone}
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-3 text-sm text-on-surface hover:text-primary transition-colors"
          >
            <span className="text-xl">✉️</span>
            {contactEmail}
          </a>
        </div>

        {/* Admin link */}
        <Link
          href="/auth/admin-login"
          className="text-xs text-on-surface-variant hover:text-primary transition-colors underline"
        >
          Admin? Login here
        </Link>
      </div>
    </div>
  );
}

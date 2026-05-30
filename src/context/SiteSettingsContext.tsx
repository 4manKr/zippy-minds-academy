"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SiteSettings {
  showPricing:     boolean;
  contactEmail:    string;
  phone:           string;
  siteName:        string;
  /** WhatsApp-ready number (digits only, no + or spaces, e.g. "919311483555") */
  whatsappNumber:  string;
  /** "tutor-wise" = existing subscription model | "course-wise" = per-session group/private */
  enrollmentModel: "tutor-wise" | "course-wise";
}

const DEFAULTS: SiteSettings = {
  showPricing:     true,
  contactEmail:    "zippymindsacademy@gmail.com",
  phone:           "+91 93114 83555",
  siteName:        "Zippy Minds Academy",
  whatsappNumber:  "919311483555",
  enrollmentModel: "tutor-wise",
};

/**
 * Converts a phone string to a WhatsApp-ready number.
 * "+91 93114 83555" → "919311483555"
 */
function toWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

const SiteSettingsContext = createContext<SiteSettings>(DEFAULTS);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch("/api/public-settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const phone = d.phone ?? DEFAULTS.phone;
        setSettings({
          showPricing:     d.showPricing === "true",
          contactEmail:    d.contactEmail ?? DEFAULTS.contactEmail,
          phone,
          siteName:        d.siteName ?? DEFAULTS.siteName,
          whatsappNumber:  toWhatsAppNumber(phone) || DEFAULTS.whatsappNumber,
          enrollmentModel: (d.enrollmentModel === "course-wise" ? "course-wise" : "tutor-wise"),
        });
      })
      .catch(() => {/* keep defaults on error */});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}

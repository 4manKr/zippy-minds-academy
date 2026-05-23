"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import CustomCourseModal from "./CustomCourseModal";

const STORAGE_KEY = "zippy_custom_banner_dismissed";

export default function CustomCourseFloatingCTA() {
  const [bannerDismissed, setBannerDismissed] = useState(true); // start hidden to avoid flash
  const [modalOpen, setModalOpen]             = useState(false);

  // Read localStorage after mount (client-only)
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    setBannerDismissed(dismissed);
  }, []);

  function dismissBanner() {
    localStorage.setItem(STORAGE_KEY, "1");
    setBannerDismissed(true);
  }

  return (
    <>
      {/* ── Top announcement banner ── */}
      {!bannerDismissed && (
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-2.5 flex items-center justify-center gap-3 flex-wrap">
            <Sparkles size={15} className="shrink-0 text-yellow-300" />
            <span className="font-medium">
              Can't find the right course?{" "}
              <strong>Build a fully custom learning plan</strong> designed just for your child.
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full transition-all"
            >
              Get Started →
            </button>
          </div>
          <button
            onClick={dismissBanner}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Floating pill button (always visible after banner dismissed) ── */}
      {bannerDismissed && (
        <button
          onClick={() => setModalOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-bold px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border border-violet-400/30"
          title="Build a custom course for your child"
        >
          <Sparkles size={16} className="text-yellow-300" />
          Custom Course
        </button>
      )}

      <CustomCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

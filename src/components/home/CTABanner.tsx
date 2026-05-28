"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function CTABanner() {
  const { whatsappNumber } = useSiteSettings();

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[40px] bg-primary px-6 sm:px-12 py-12 sm:py-16 md:px-20 md:py-20 text-center">

          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-secondary-container/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-primary mb-5 leading-tight">
              Give Your Child the Confidence to{" "}
              <span className="text-secondary-container">Learn, Speak &amp; Succeed</span>
            </h2>
            <p className="text-on-primary/80 text-lg mb-10 leading-relaxed">
              Join a learning experience where children feel encouraged, supported,
              and excited to grow every day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-demo"
                className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-fixed font-extrabold px-10 py-5 rounded-2xl hover:opacity-90 transition-all shadow-xl text-base">
                Book Free Trial
              </Link>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 text-on-primary font-bold px-10 py-5 rounded-2xl hover:bg-white/25 transition-all text-base">
                <MessageCircle size={18} />
                Speak With Our Team <ArrowRight size={16} />
              </a>
            </div>

            <p className="text-on-primary/50 text-sm mt-8">
              No credit card required · Free 30-min trial · 98% satisfaction rate
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

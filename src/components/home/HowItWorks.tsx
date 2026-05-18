"use client";

import Link from "next/link";
import { UserPlus, BookOpen, Calendar, Video, GraduationCap, ArrowRight } from "lucide-react";

const steps = [
  { step: "01", icon: UserPlus,      title: "Choose a Course",   description: "Browse our extensive catalog of subjects and find the perfect course for your child's grade and learning goals.",                       color: "blue" },
  { step: "02", icon: BookOpen,      title: "Book Free Demo",    description: "Reserve a complimentary 30-minute trial session with your preferred tutor. No payment required.",                                       color: "purple" },
  { step: "03", icon: Calendar,      title: "Select Time Slot",  description: "Pick a convenient time from your tutor's availability — automatically shown in your local timezone.",                                   color: "cyan" },
  { step: "04", icon: Video,         title: "Meet Your Tutor",   description: "Join your Zoom session and experience personalized 1-to-1 teaching tailored to your child's needs.",                                   color: "blue" },
  { step: "05", icon: GraduationCap, title: "Start Learning",    description: "Enroll in ongoing sessions, track progress, and watch your child thrive with consistent expert guidance.",                             color: "purple" },
];

const colorMap: Record<string, { step: string; icon: string; bg: string; line: string }> = {
  blue:   { step: "text-primary",   icon: "text-primary",   bg: "bg-primary/10",              line: "border-primary/30" },
  purple: { step: "text-tertiary",  icon: "text-tertiary",  bg: "bg-tertiary-fixed/50",        line: "border-tertiary/30" },
  cyan:   { step: "text-secondary", icon: "text-secondary", bg: "bg-secondary-container/20",   line: "border-secondary-container/30" },
};

export default function HowItWorks() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge-blue mb-4 inline-block">Simple Process</span>
          <h2 className="section-heading">
            Get started in{" "}
            <span className="gradient-text">5 easy steps</span>
          </h2>
          <p className="section-subheading mx-auto">
            From browsing to your first session — the entire process takes less than 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary via-tertiary to-secondary opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = colorMap[step.color];
              return (
                <div key={step.step} className="flex flex-col items-center text-center group">
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center border-2 border-white shadow-card group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} className={colors.icon} />
                    </div>
                    <span className={`absolute -top-2 -right-2 text-xs font-bold ${colors.step} bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-outline-variant/20`}>
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-on-surface text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link href="/book-demo" className="btn-primary px-10 py-4 text-base">
            Start Your Free Demo <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

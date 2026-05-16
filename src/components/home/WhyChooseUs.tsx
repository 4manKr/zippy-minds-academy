"use client";

import { Shield, Clock, Globe, Award, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    color: "blue",
    title: "Hand-Picked Expert Tutors",
    description: "Every tutor undergoes a rigorous 5-stage verification. Only the top 3% of applicants make it onto our platform.",
  },
  {
    icon: Globe,
    color: "purple",
    title: "Global Timezone Flexibility",
    description: "Book sessions in your local timezone. Our smart scheduler shows tutor availability converted to your time — no confusion.",
  },
  {
    icon: Award,
    color: "cyan",
    title: "Personalized 1-to-1 Learning",
    description: "No group classes. Every session is tailored exclusively to your child's pace, learning style, and goals.",
  },
  {
    icon: Shield,
    color: "blue",
    title: "Safe & Verified Platform",
    description: "Background-checked tutors, secure video sessions, recorded classes, and parental oversight built in.",
  },
  {
    icon: Clock,
    color: "purple",
    title: "Flexible Scheduling",
    description: "Morning, afternoon, or night — tutors across all Indian timezones fit parents in the US, UK, Gulf, and beyond.",
  },
  {
    icon: Zap,
    color: "cyan",
    title: "Free Demo First",
    description: "Try before you commit. Book a free 30-minute demo session with any tutor, risk-free. No credit card required.",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-brand-blue", border: "border-blue-100" },
  purple: { bg: "bg-purple-50", icon: "text-brand-purple", border: "border-purple-100" },
  cyan: { bg: "bg-cyan-50", icon: "text-brand-cyan", border: "border-cyan-100" },
};

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-purple mb-4 inline-block">Why Zippy Minds</span>
          <h2 className="section-heading">
            The smarter way to{" "}
            <span className="gradient-text">learn online</span>
          </h2>
          <p className="section-subheading mx-auto">
            We&apos;ve reimagined online tutoring from the ground up — combining
            expert Indian educators with world-class technology for a premium experience.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={`group p-8 rounded-3xl border ${colors.border} ${colors.bg} card-hover cursor-default`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className={colors.icon} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

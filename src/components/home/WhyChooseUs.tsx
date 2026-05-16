"use client";

import { Shield, Clock, Globe, Award, Users, Zap } from "lucide-react";

const features = [
  { icon: Users,  color: "primary",   title: "Hand-Picked Expert Tutors",    description: "Every tutor undergoes a rigorous 5-stage verification. Only the top 1% of applicants make it onto our platform." },
  { icon: Globe,  color: "secondary", title: "Global Timezone Flexibility",   description: "Book sessions in your local timezone. Our smart scheduler shows tutor availability converted to your time — no confusion." },
  { icon: Award,  color: "tertiary",  title: "Personalized 1-to-1 Learning", description: "No group classes. Every session is tailored exclusively to your child's pace, learning style, and goals." },
  { icon: Shield, color: "primary",   title: "Safe & Verified Platform",      description: "Background-checked tutors, secure video sessions, recorded classes, and parental oversight built in." },
  { icon: Clock,  color: "secondary", title: "Flexible Scheduling",           description: "Morning, afternoon, or evening — tutors across all Indian timezones fit parents in the US, UK, Gulf, and beyond." },
  { icon: Zap,    color: "tertiary",  title: "Free Demo First",               description: "Try before you commit. Book a free 30-minute demo session with any tutor, risk-free. No credit card required." },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  primary:   { bg: "bg-primary-fixed/40",    icon: "text-primary",   border: "border-primary" },
  secondary: { bg: "bg-secondary-container/20", icon: "text-secondary", border: "border-secondary-container" },
  tertiary:  { bg: "bg-tertiary-fixed/50",   icon: "text-tertiary",  border: "border-tertiary" },
};

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-blue mb-4 inline-block font-semibold text-xs uppercase tracking-wide">Why Zippy Minds</span>
          <h2 className="section-heading">
            Global Excellence,{" "}
            <span className="text-tertiary">One-on-One.</span>
          </h2>
          <p className="section-subheading mx-auto text-center">
            We bridge the gap between world-class education and personalized attention —
            India&apos;s finest educators, trusted by families across 50+ countries.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={`group p-8 rounded-3xl border-t-4 ${colors.border} bg-surface-container-lowest shadow-card card-hover`}
              >
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={26} className={colors.icon} />
                </div>
                <h3 className="font-display font-bold text-on-surface text-lg mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

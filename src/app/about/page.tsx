import Link from "next/link";
import { Target, Heart, Globe, Shield, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

const values = [
  { icon: Target, title: "Mission-Driven",     description: "Every decision we make is focused on improving learning outcomes for students worldwide.", bg: "bg-primary/5",              icon_color: "text-primary",   border: "border-primary/20" },
  { icon: Heart,  title: "Student-First",       description: "We put the student at the centre of everything. Their growth is our success.",            bg: "bg-tertiary/5",             icon_color: "text-tertiary",  border: "border-tertiary/20" },
  { icon: Globe,  title: "Globally Accessible", description: "World-class Indian education, available to families in any country, in any timezone.",   bg: "bg-primary/5",              icon_color: "text-primary",   border: "border-primary/20" },
  { icon: Shield, title: "Safe & Trusted",      description: "Rigorous tutor verification, safe video sessions, and complete transparency.",            bg: "bg-secondary-container/20", icon_color: "text-secondary", border: "border-secondary/20" },
];

async function getStats() {
  try {
    const [parents, tutors, courses] = await Promise.all([
      prisma.user.count({ where: { role: "PARENT" } }),
      prisma.user.count({ where: { role: "TUTOR", approvalStatus: "APPROVED" } }),
      prisma.course.count({ where: { status: "active" } }),
    ]);
    return { parents, tutors, courses };
  } catch {
    return { parents: 0, tutors: 0, courses: 0 };
  }
}

function fallbackMin(fallback: string): number {
  const m = fallback.match(/^(\d+(?:\.\d+)?)(K?)\+?$/i);
  if (!m) return Infinity;
  return parseFloat(m[1]) * (m[2].toUpperCase() === "K" ? 1000 : 1);
}

function fmt(n: number, fallback: string): string {
  if (n < fallbackMin(fallback)) return fallback;
  if (n >= 10000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

export default async function AboutPage() {
  const { parents, tutors } = await getStats();

  const storyStats = [
    { value: "2022",                 label: "Founded",   emoji: "🚀" },
    { value: "50+",                  label: "Countries", emoji: "🌍" },
    { value: fmt(parents, "10K+"),   label: "Students",  emoji: "👧" },
    { value: fmt(tutors,  "500+"),   label: "Tutors",    emoji: "👩‍🏫" },
  ];

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ── */}
      <div className="bg-primary py-16 pt-20 md:py-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-5 text-center text-on-primary">
          <span className="inline-block bg-white/15 border border-white/25 text-white mb-4 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            About Us
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            We&apos;re on a mission to make quality education borderless
          </h1>
          <p className="text-on-primary/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Zippy Minds Academy bridges the gap between India&apos;s exceptional teaching talent
            and students worldwide who deserve personalised, high-quality education.
          </p>
        </div>
      </div>

      {/* ── Stats strip (mobile-first) ── */}
      <div className="bg-white border-b border-outline-variant/30 lg:hidden">
        <div className="grid grid-cols-4 divide-x divide-outline-variant/30">
          {storyStats.map((s) => (
            <div key={s.label} className="py-5 text-center">
              <p className="text-lg mb-0.5">{s.emoji}</p>
              <p className="font-extrabold text-primary text-lg leading-none font-display">{s.value}</p>
              <p className="text-on-surface-variant text-[10px] font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <section className="py-14 md:py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Text */}
          <div>
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Our Story
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-5 leading-tight">
              Born from a simple belief
            </h2>

            {/* Mobile: card-style paragraphs */}
            <div className="space-y-3 mb-6 lg:space-y-0 lg:block">
              <div className="lg:hidden bg-surface-container rounded-2xl p-4 border border-outline-variant/30">
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  In 2022, our founders noticed a gap: parents in the UK, US, and Gulf were struggling to find
                  quality tutors for children following the Indian curriculum — or simply needed affordable expert help.
                </p>
              </div>
              <div className="lg:hidden bg-surface-container rounded-2xl p-4 border border-outline-variant/30">
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Meanwhile, thousands of brilliant Indian educators were limited to local students despite
                  their world-class expertise.
                </p>
              </div>
              <div className="lg:hidden bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Zippy Minds Academy was created to solve both problems at once — a premium platform that
                  brings India&apos;s best tutors to students in every corner of the world.
                </p>
              </div>

              {/* Desktop: plain paragraphs */}
              <p className="hidden lg:block text-on-surface-variant leading-relaxed mb-4">
                In 2022, our founders noticed a gap: parents in the UK, US, and Gulf were struggling to find
                quality tutors for their children who were following the Indian curriculum — or simply needed
                affordable expert help.
              </p>
              <p className="hidden lg:block text-on-surface-variant leading-relaxed mb-4">
                Meanwhile, thousands of brilliant Indian educators were limited to local students despite
                their world-class expertise.
              </p>
              <p className="hidden lg:block text-on-surface-variant leading-relaxed mb-6">
                Zippy Minds Academy was created to solve both problems at once — a premium platform that
                brings India&apos;s best tutors to students in every corner of the world.
              </p>
            </div>

            <Link href="/book-demo" className="btn-primary">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats grid — desktop only (mobile shown in strip above) */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {storyStats.map((stat) => (
              <div key={stat.label} className="bg-surface-container rounded-2xl p-6 text-center border border-outline-variant/30">
                <p className="text-4xl font-bold gradient-text font-display">{stat.value}</p>
                <p className="text-on-surface-variant text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-14 md:py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-secondary-container/20 text-secondary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
              Our Values
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-on-surface">What drives us every day</h2>
          </div>

          {/* Mobile: horizontal scroll cards */}
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide lg:hidden -mx-5 px-5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title}
                  className={`snap-start shrink-0 w-[72vw] max-w-[260px] ${v.bg} border ${v.border} rounded-3xl p-6 flex flex-col`}>
                  <div className={`w-12 h-12 rounded-2xl ${v.bg} border ${v.border} flex items-center justify-center mb-4`}>
                    <Icon size={24} className={v.icon_color} />
                  </div>
                  <h3 className="font-display font-bold text-on-surface text-base mb-2">{v.title}</h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>

          {/* Desktop: 4-col grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className={`p-7 rounded-3xl ${v.bg} border border-outline-variant/30`}>
                  <Icon size={28} className={`${v.icon_color} mb-4`} />
                  <h3 className="font-display font-bold text-on-surface text-lg mb-2">{v.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}

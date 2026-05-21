import Link from "next/link";
import { Target, Heart, Globe, Shield, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

const team = [
  { name: "Arpit Sharma", role: "Co-Founder & CEO",        initials: "AS", gradient: "from-primary to-primary-container" },
  { name: "Priya Menon",  role: "Head of Education",       initials: "PM", gradient: "from-tertiary to-tertiary-container" },
  { name: "Rohan Joshi",  role: "CTO",                     initials: "RJ", gradient: "from-secondary to-secondary-fixed-dim" },
  { name: "Kavya Nair",   role: "Head of Tutor Success",   initials: "KN", gradient: "from-green-500 to-emerald-600" },
];

const values = [
  { icon: Target, title: "Mission-Driven",      description: "Every decision we make is focused on improving learning outcomes for students worldwide.", bg: "bg-primary/5",              icon_color: "text-primary" },
  { icon: Heart,  title: "Student-First",        description: "We put the student at the centre of everything. Their growth is our success.",            bg: "bg-tertiary/5",             icon_color: "text-tertiary" },
  { icon: Globe,  title: "Globally Accessible",  description: "World-class Indian education, available to families in any country, in any timezone.",   bg: "bg-primary/5",              icon_color: "text-primary" },
  { icon: Shield, title: "Safe & Trusted",       description: "Rigorous tutor verification, safe video sessions, and complete transparency.",            bg: "bg-secondary-container/20", icon_color: "text-secondary" },
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

// Parse the numeric floor from the fallback string (e.g. "10K+" → 10000, "500+" → 500)
function fallbackMin(fallback: string): number {
  const m = fallback.match(/^(\d+(?:\.\d+)?)(K?)\+?$/i);
  if (!m) return Infinity;
  return parseFloat(m[1]) * (m[2].toUpperCase() === "K" ? 1000 : 1);
}

// Only show live count when it exceeds the fallback marketing number
function fmt(n: number, fallback: string): string {
  if (n < fallbackMin(fallback)) return fallback;
  if (n >= 10000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 1000)  return `${(n / 1000).toFixed(1)}K+`;
  return `${n}+`;
}

export default async function AboutPage() {
  const { parents, tutors } = await getStats();

  const storyStats = [
    { value: "2022",                           label: "Founded" },
    { value: "50+",                            label: "Countries" },
    { value: fmt(parents, "10K+"),             label: "Students" },
    { value: fmt(tutors,  "500+"),             label: "Tutors" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-primary py-20 pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center text-on-primary">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">About Us</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-5">
            We&apos;re on a mission to make quality education borderless
          </h1>
          <p className="text-on-primary/80 text-lg max-w-2xl mx-auto">
            Zippy Minds Academy was founded to bridge the gap between India&apos;s exceptional teaching talent
            and students worldwide who deserve personalized, high-quality education.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="badge-blue mb-4 inline-block">Our Story</span>
            <h2 className="font-display text-4xl font-bold text-on-surface mb-6">Born from a simple belief</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              In 2022, our founders noticed a gap: parents in the UK, US, and Gulf were struggling to find
              quality tutors for their children who were following the Indian curriculum — or simply needed
              affordable expert help.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Meanwhile, thousands of brilliant Indian educators were limited to local students despite
              their world-class expertise.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Zippy Minds Academy was created to solve both problems at once — a premium platform that
              brings India&apos;s best tutors to students in every corner of the world.
            </p>
            <Link href="/book-demo" className="btn-primary">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {storyStats.map((stat) => (
              <div key={stat.label} className="bg-surface-container rounded-2xl p-6 text-center border border-outline-variant/30">
                <p className="text-4xl font-bold gradient-text font-display">{stat.value}</p>
                <p className="text-on-surface-variant text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-purple mb-4 inline-block">Our Values</span>
            <h2 className="font-display text-4xl font-bold text-on-surface">What drives us every day</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Team */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-blue mb-4 inline-block">Our Team</span>
            <h2 className="font-display text-4xl font-bold text-on-surface">Meet the people behind Zippy Minds</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold font-display mb-4 group-hover:scale-105 transition-transform shadow-card`}>
                  {member.initials}
                </div>
                <p className="font-bold text-on-surface">{member.name}</p>
                <p className="text-sm text-on-surface-variant">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

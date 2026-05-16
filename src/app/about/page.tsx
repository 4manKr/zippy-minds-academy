import Image from "next/image";
import Link from "next/link";
import { Target, Heart, Globe, Shield, ArrowRight } from "lucide-react";

const team = [
  { name: "Arpit Sharma", role: "Co-Founder & CEO", initials: "AS", color: "from-blue-400 to-brand-blue" },
  { name: "Priya Menon", role: "Head of Education", initials: "PM", color: "from-purple-400 to-brand-purple" },
  { name: "Rohan Joshi", role: "CTO", initials: "RJ", color: "from-cyan-400 to-brand-cyan" },
  { name: "Kavya Nair", role: "Head of Tutor Success", initials: "KN", color: "from-emerald-400 to-emerald-600" },
];

const values = [
  { icon: Target, title: "Mission-Driven", description: "Every decision we make is focused on improving learning outcomes for students worldwide.", color: "blue" },
  { icon: Heart, title: "Student-First", description: "We put the student at the centre of everything. Their growth is our success.", color: "purple" },
  { icon: Globe, title: "Globally Accessible", description: "World-class Indian education, available to families in any country, in any timezone.", color: "cyan" },
  { icon: Shield, title: "Safe & Trusted", description: "Rigorous tutor verification, safe video sessions, and complete transparency.", color: "blue" },
];

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-brand-blue" },
  purple: { bg: "bg-purple-50", icon: "text-brand-purple" },
  cyan: { bg: "bg-cyan-50", icon: "text-brand-cyan" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="gradient-bg py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block">About Us</span>
          <h1 className="text-5xl font-bold mb-5">We&apos;re on a mission to make quality education borderless</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Zippy Minds Academy was founded to bridge the gap between India&apos;s exceptional teaching talent
            and students worldwide who deserve personalized, high-quality education.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="badge-blue mb-4 inline-block">Our Story</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Born from a simple belief</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              In 2022, our founders noticed a gap: parents in the UK, US, and Gulf were struggling to find
              quality tutors for their children who were following the Indian curriculum — or simply needed
              affordable expert help.
            </p>
            <p className="text-gray-500 leading-relaxed mb-4">
              Meanwhile, thousands of brilliant Indian educators were limited to local students despite
              their world-class expertise.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Zippy Minds Academy was created to solve both problems at once — a premium platform that
              brings India&apos;s best tutors to students in every corner of the world.
            </p>
            <Link href="/book-demo" className="btn-primary">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "2022", label: "Founded" },
              { value: "50+", label: "Countries" },
              { value: "10K+", label: "Students" },
              { value: "500+", label: "Tutors" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-purple mb-4 inline-block">Our Values</span>
            <h2 className="text-4xl font-bold text-gray-900">What drives us every day</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              const colors = colorMap[v.color];
              return (
                <div key={v.title} className={`p-7 rounded-3xl ${colors.bg} border border-white`}>
                  <Icon size={28} className={`${colors.icon} mb-4`} />
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-cyan mb-4 inline-block">Our Team</span>
            <h2 className="text-4xl font-bold text-gray-900">Meet the people behind Zippy Minds</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-105 transition-transform`}>
                  {member.initials}
                </div>
                <p className="font-bold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

const skills = [
  { icon: "📖", label: "Reading Fluency" },
  { icon: "🗣️", label: "Clear Pronunciation" },
  { icon: "🎤", label: "Public Speaking Confidence" },
  { icon: "💬", label: "Stronger Communication" },
  { icon: "🔍", label: "Problem-Solving Ability" },
  { icon: "📚", label: "Vocabulary Growth" },
  { icon: "🧠", label: "Logical Thinking" },
  { icon: "🎨", label: "Creative Expression" },
  { icon: "🌱", label: "Independent Learning" },
];

export default function SkillsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary via-[#1a4fa0] to-[#2d5be3]">

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-container rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Learning Outcomes
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Skills Children Build{" "}
            <span className="text-secondary-container">With Us</span>
          </h2>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
          {skills.map((s) => (
            <div key={s.label}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 hover:bg-white/20 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className="text-white font-semibold text-sm">✔ {s.label}</span>
            </div>
          ))}
        </div>

        {/* Growth Journey strip */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-3xl mx-auto">
          <p className="text-center text-white/70 text-xs font-bold uppercase tracking-widest mb-6">📈 Growth Journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { before: "Hesitant reader",    after: "Fluent reader" },
              { before: "Shy speaker",        after: "Confident communicator" },
              { before: "Struggling learner", after: "Active participant" },
            ].map(({ before, after }) => (
              <div key={before} className="space-y-2">
                <p className="text-white/50 text-sm line-through">{before}</p>
                <div className="text-secondary-container text-xl font-bold">↓</div>
                <p className="text-white font-extrabold text-base">{after}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

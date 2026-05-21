"use client";

const points = [
  {
    emoji: "🎥",
    title: "Live & Interactive",
    desc: "Children actively participate instead of passively watching.",
    color: "bg-blue-50 border-blue-200",
    titleColor: "text-blue-700",
  },
  {
    emoji: "🎮",
    title: "Activity-Based Learning",
    desc: "Fun exercises and creative engagement improve retention and understanding.",
    color: "bg-purple-50 border-purple-200",
    titleColor: "text-purple-700",
  },
  {
    emoji: "💡",
    title: "Confidence-Focused Approach",
    desc: "We encourage children to ask questions, express ideas, and think independently.",
    color: "bg-yellow-50 border-yellow-200",
    titleColor: "text-yellow-700",
  },
  {
    emoji: "🤝",
    title: "Positive Learning Environment",
    desc: "Supportive teachers who make children feel comfortable and motivated.",
    color: "bg-green-50 border-green-200",
    titleColor: "text-green-700",
  },
];

export default function LearningExperience() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            The Zippy Difference
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
            What Makes Our{" "}
            <span className="text-primary">Classes Different</span>
          </h2>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {points.map((p) => (
            <div key={p.title}
              className={`flex items-start gap-5 p-7 rounded-3xl border-2 ${p.color} hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="text-4xl shrink-0">{p.emoji}</div>
              <div>
                <h3 className={`font-display font-extrabold text-lg mb-2 ${p.titleColor}`}>{p.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

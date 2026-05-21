"use client";

const features = [
  { icon: "🎯", title: "Personalized Attention",       desc: "Small batch sizes ensure every child is heard, guided, and encouraged.",                                            color: "border-primary",            bg: "bg-primary/8" },
  { icon: "🌈", title: "Engaging Learning Experience", desc: "Interactive activities, visual learning, games, and discussions keep classes lively and effective.",                  color: "border-secondary-container", bg: "bg-secondary-container/10" },
  { icon: "👩‍🏫", title: "Expert Mentors",               desc: "Passionate educators who understand how to nurture young learners with patience and positivity.",                  color: "border-tertiary",            bg: "bg-tertiary/10" },
  { icon: "🌍", title: "Learn From Anywhere",          desc: "Flexible online classes accessible from the comfort of your home.",                                               color: "border-primary",            bg: "bg-primary/8" },
  { icon: "🧠", title: "Beyond Academics",             desc: "We focus on confidence, communication, creativity, and independent thinking.",                                     color: "border-secondary-container", bg: "bg-secondary-container/10" },
  { icon: "⭐", title: "Confidence That Lasts",        desc: "Helping children express themselves clearly — in classrooms and beyond.",                                          color: "border-tertiary",            bg: "bg-tertiary/10" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            Why Zippy Minds
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Why Parents Trust{" "}
            <span className="text-primary">Zippy Minds Academy</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title}
              className={`group p-8 rounded-3xl border-t-4 ${f.color} bg-surface-container-lowest shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-on-surface text-lg mb-3">{f.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

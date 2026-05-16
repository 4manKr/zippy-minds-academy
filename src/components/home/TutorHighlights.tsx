import { Star, MapPin, Award } from "lucide-react";

const tutors = [
  {
    name: "Ms. Ananya Singh",
    role: "Phonics & English Grammar",
    experience: "10 years",
    rating: 4.9,
    reviews: 512,
    students: 620,
    location: "Mumbai",
    initials: "AS",
    gradient: "from-tertiary to-tertiary-container",
    subjects: ["Phonics", "Reading", "Grammar"],
    achievement: "600+ kids reading confidently",
  },
  {
    name: "Mr. Rahul Verma",
    role: "Mathematics",
    experience: "9 years",
    rating: 4.9,
    reviews: 634,
    students: 890,
    location: "Bangalore",
    initials: "RV",
    gradient: "from-primary to-primary-container",
    subjects: ["Arithmetic", "Algebra", "Problem Solving"],
    achievement: "850+ students scoring top marks",
  },
  {
    name: "Ms. Kavya Nair",
    role: "Public Speaking & Writing",
    experience: "7 years",
    rating: 4.8,
    reviews: 278,
    students: 380,
    location: "Delhi",
    initials: "KN",
    gradient: "from-secondary to-secondary-fixed-dim",
    subjects: ["Confidence", "Debate", "Essay Writing"],
    achievement: "Transformed 350+ shy kids into speakers",
  },
  {
    name: "Mr. Arjun Mehta",
    role: "Coding & Science",
    experience: "5 years",
    rating: 4.9,
    reviews: 341,
    students: 480,
    location: "Pune",
    initials: "AM",
    gradient: "from-on-surface to-on-surface-variant",
    subjects: ["Scratch", "Python", "Science Concepts"],
    achievement: "450+ young coders & builders",
  },
];

export default function TutorHighlights() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-blue mb-4 inline-block font-semibold text-xs uppercase tracking-wide">Our Educators</span>
          <h2 className="section-heading">
            Meet the Minds Behind{" "}
            <span className="text-tertiary">the Magic</span>
          </h2>
          <p className="section-subheading mx-auto text-center">
            India&apos;s finest educators — hand-picked, background-verified, and passionate
            about making every child love learning.
          </p>
        </div>

        {/* Tutor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor.name} className="group bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card card-hover overflow-hidden">
              {/* Header band */}
              <div className={`bg-gradient-to-br ${tutor.gradient} h-28 relative flex items-end px-5 pb-0`}>
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary translate-y-10 border-4 border-white font-display">
                  {tutor.initials}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="badge bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs">
                    <Award size={10} className="mr-1 inline" />Verified
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 p-5">
                <h3 className="font-display font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                  {tutor.name}
                </h3>
                <p className="text-sm text-on-surface-variant mb-1">{tutor.role}</p>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant mb-3">
                  <MapPin size={11} /> {tutor.location} · {tutor.experience} exp.
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} fill="#fdd000" stroke="#fdd000" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-on-surface">{tutor.rating}</span>
                  <span className="text-xs text-on-surface-variant">({tutor.reviews})</span>
                </div>

                {/* Subject tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="badge-gray text-xs">{s}</span>
                  ))}
                </div>

                {/* Achievement */}
                <div className="bg-secondary-container/20 rounded-xl px-3 py-2.5 border-l-4 border-secondary-container">
                  <p className="text-xs font-semibold text-secondary">🏆 {tutor.achievement}</p>
                </div>

                {/* Student count */}
                <div className="flex items-center justify-end pt-3 mt-2 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                  <span>{tutor.students.toLocaleString()}+ students taught</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4">
            <span className="text-2xl">🎓</span>
            <p className="text-sm text-on-surface-variant">
              <span className="font-bold text-primary">500+ verified tutors</span> across all subjects —
              your child is automatically matched with the best available expert.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

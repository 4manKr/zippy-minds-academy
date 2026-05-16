import Link from "next/link";
import { Star, MapPin, Award, CheckCircle, ArrowRight } from "lucide-react";

const tutors = [
  {
    name: "Ms. Ananya Singh",   role: "Phonics & English Grammar", experience: "10 years",
    rating: 4.9, reviews: 512, students: 620, location: "Mumbai", initials: "AS",
    gradient: "from-tertiary to-tertiary-container",
    subjects: ["Phonics", "Reading", "Grammar", "Comprehension"],
    achievement: "600+ kids reading confidently",
    bio: "Specialist in early childhood literacy with a proven phonics-first method that has transformed hundreds of young readers.",
  },
  {
    name: "Mr. Rahul Verma",    role: "Mathematics", experience: "9 years",
    rating: 4.9, reviews: 634, students: 890, location: "Bangalore", initials: "RV",
    gradient: "from-primary to-primary-container",
    subjects: ["Arithmetic", "Algebra", "Geometry", "Problem Solving"],
    achievement: "850+ students scoring top marks",
    bio: "Makes maths feel like play. Known for visual learning techniques and building deep conceptual understanding from an early age.",
  },
  {
    name: "Ms. Kavya Nair",     role: "Public Speaking & Writing", experience: "7 years",
    rating: 4.8, reviews: 278, students: 380, location: "Delhi", initials: "KN",
    gradient: "from-secondary to-secondary-fixed-dim",
    subjects: ["Confidence", "Debate", "Essay Writing", "Storytelling"],
    achievement: "Transformed 350+ shy kids into speakers",
    bio: "Former national debate champion turned educator. Specialises in turning shy, quiet children into confident public communicators.",
  },
  {
    name: "Mr. Arjun Mehta",    role: "Coding & Science", experience: "5 years",
    rating: 4.9, reviews: 341, students: 480, location: "Pune", initials: "AM",
    gradient: "from-on-surface to-on-surface-variant",
    subjects: ["Scratch", "Python", "Science Concepts", "Logic"],
    achievement: "450+ young coders & builders",
    bio: "Software engineer turned kids' coding mentor. Uses project-based learning so children build real apps and games from day one.",
  },
  {
    name: "Dr. Meera Patel",    role: "Science Explorer", experience: "9 years",
    rating: 4.8, reviews: 198, students: 320, location: "Ahmedabad", initials: "MP",
    gradient: "from-green-500 to-emerald-600",
    subjects: ["Biology", "Physics", "Chemistry", "Experiments"],
    achievement: "300+ future scientists inspired",
    bio: "PhD in Life Sciences. Makes complex scientific concepts tangible through virtual experiments and real-world examples kids love.",
  },
  {
    name: "Ms. Sunita Rao",     role: "Writing & Communication", experience: "6 years",
    rating: 4.7, reviews: 267, students: 290, location: "Hyderabad", initials: "SR",
    gradient: "from-teal-500 to-cyan-600",
    subjects: ["Creative Writing", "Journaling", "Story Craft", "Essays"],
    achievement: "250+ young authors published",
    bio: "Published author and writing coach. Guides children to find their unique voice and express their ideas with clarity and creativity.",
  },
];

const selectionSteps = [
  { step: "1", title: "You pick a subject",      desc: "Choose the area your child needs help with from our course catalogue." },
  { step: "2", title: "We match the expert",     desc: "Our system instantly assigns the highest-rated available tutor for that subject." },
  { step: "3", title: "Free demo — no pressure", desc: "Your child meets the tutor in a free 30-min demo before any commitment." },
];

export default function TutorsPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center text-on-primary">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">Our Educators</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Meet the Minds Behind the Magic
          </h1>
          <p className="text-on-primary/80 text-lg max-w-2xl mx-auto">
            India&apos;s finest educators — hand-picked, background-verified, and passionate about making every child love learning.
            <strong className="text-secondary-container"> You never have to choose — we match your child automatically.</strong>
          </p>
        </div>
      </div>

      {/* How matching works */}
      <div className="bg-surface-container-low py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-on-surface text-center mb-8">How tutor matching works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectionSteps.map(({ step, title, desc }) => (
              <div key={step} className="bg-surface-container-lowest rounded-2xl p-6 border-t-4 border-secondary-container shadow-card text-center">
                <div className="w-10 h-10 bg-secondary-container text-on-secondary-fixed font-extrabold rounded-full flex items-center justify-center mx-auto mb-4 font-display text-lg">
                  {step}
                </div>
                <h3 className="font-display font-bold text-on-surface mb-2">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tutor grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16">
        <h2 className="font-display text-2xl font-bold text-on-surface text-center mb-10">
          Some of our <span className="text-tertiary">top-rated tutors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {tutors.map((tutor) => (
            <div key={tutor.name} className="group bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card card-hover overflow-hidden">
              {/* Header */}
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
              <div className="pt-12 p-6">
                <h3 className="font-display font-bold text-on-surface text-lg">{tutor.name}</h3>
                <p className="text-sm text-on-surface-variant mb-1">{tutor.role}</p>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant mb-3">
                  <MapPin size={11} /> {tutor.location} · {tutor.experience} experience
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill="#fdd000" stroke="#fdd000" />)}
                  </div>
                  <span className="text-sm font-bold text-on-surface">{tutor.rating}</span>
                  <span className="text-xs text-on-surface-variant">({tutor.reviews} reviews)</span>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{tutor.bio}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="badge-gray text-xs">{s}</span>
                  ))}
                </div>

                <div className="bg-secondary-container/20 rounded-xl px-3 py-2.5 border-l-4 border-secondary-container mb-4">
                  <p className="text-xs font-semibold text-secondary">🏆 {tutor.achievement}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs text-on-surface-variant">
                  <span>{tutor.students.toLocaleString()}+ students taught</span>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <CheckCircle size={12} /> Available
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-primary rounded-3xl p-10 max-w-2xl mx-auto text-on-primary">
            <h3 className="font-display text-2xl font-bold mb-3">Ready to get started?</h3>
            <p className="text-on-primary/80 mb-6">
              Book a free demo and we&apos;ll automatically match your child with the perfect tutor for their subject and age group.
            </p>
            <Link href="/book-demo" className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-fixed font-bold px-8 py-4 rounded-2xl squishy-hover shadow-lg">
              Book Free Demo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

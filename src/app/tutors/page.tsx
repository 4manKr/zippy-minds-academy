import Link from "next/link";
import { Star, MapPin, Award, CheckCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Tutors",
  description: "Meet Zippy Minds Academy's expert tutors — hand-picked, background-verified, and passionate about making every child love learning.",
};

// Static enrichment data for known tutors (bio, experience, location, etc.)
const TUTOR_META: Record<string, {
  role: string; experience: string; rating: number; reviews: number;
  students: number; location: string; gradient: string; achievement: string; bio: string;
}> = {
  "Ms. Ananya Singh":  { role: "Phonics & English Grammar", experience: "10 years",  rating: 4.9, reviews: 512, students: 620, location: "Mumbai",    gradient: "from-pink-400 to-rose-500",     achievement: "600+ kids reading confidently",        bio: "Specialist in early childhood literacy with a proven phonics-first method that has transformed hundreds of young readers." },
  "Ms. Priya Sharma":  { role: "English Grammar",           experience: "8 years",   rating: 4.8, reviews: 389, students: 540, location: "Chennai",    gradient: "from-blue-400 to-blue-600",     achievement: "500+ students acing grammar tests",    bio: "Passionate English educator who makes grammar intuitive through storytelling and real-world writing exercises." },
  "Mr. Rahul Verma":   { role: "Mathematics",               experience: "9 years",   rating: 4.9, reviews: 634, students: 890, location: "Bangalore",  gradient: "from-purple-400 to-purple-600", achievement: "850+ students scoring top marks",      bio: "Makes maths feel like play. Known for visual learning techniques and building deep conceptual understanding." },
  "Ms. Kavya Nair":    { role: "Public Speaking & Writing", experience: "7 years",   rating: 4.8, reviews: 278, students: 380, location: "Delhi",      gradient: "from-orange-400 to-yellow-400", achievement: "Transformed 350+ shy kids into speakers", bio: "Former national debate champion. Specialises in turning shy, quiet children into confident public communicators." },
  "Ms. Sunita Rao":    { role: "Writing & Communication",   experience: "6 years",   rating: 4.7, reviews: 267, students: 290, location: "Hyderabad",  gradient: "from-teal-400 to-cyan-500",     achievement: "250+ young authors published",          bio: "Published author and writing coach. Guides children to find their unique voice and express ideas with clarity." },
  "Mr. Arjun Mehta":   { role: "Coding & Science",          experience: "5 years",   rating: 4.9, reviews: 341, students: 480, location: "Pune",       gradient: "from-indigo-400 to-blue-600",   achievement: "450+ young coders & builders",          bio: "Software engineer turned kids' coding mentor. Uses project-based learning so children build real apps and games." },
  "Dr. Meera Patel":   { role: "Science Explorer",          experience: "9 years",   rating: 4.8, reviews: 198, students: 320, location: "Ahmedabad",  gradient: "from-green-400 to-emerald-500", achievement: "300+ future scientists inspired",       bio: "PhD in Life Sciences. Makes complex scientific concepts tangible through virtual experiments and real-world examples." },
  "Mr. Rohan Gupta":   { role: "Life Skills",               experience: "8 years",   rating: 4.7, reviews: 189, students: 240, location: "Kolkata",    gradient: "from-yellow-400 to-orange-400", achievement: "200+ future leaders coached",           bio: "Focuses on emotional intelligence, growth mindset, and real-world skills that schools rarely teach." },
  "Ms. Kavita Sharma": { role: "Hindi",                     experience: "7 years",   rating: 4.7, reviews: 156, students: 210, location: "Jaipur",     gradient: "from-red-400 to-orange-500",    achievement: "200+ students mastering Hindi",         bio: "Brings Hindi alive through poetry, stories, and cultural context — making language learning deeply meaningful." },
  "Mr. Vikram Nair":   { role: "General Knowledge",         experience: "6 years",   rating: 4.6, reviews: 134, students: 180, location: "Kochi",      gradient: "from-cyan-400 to-teal-500",     achievement: "150+ quiz champions nurtured",          bio: "Makes current affairs and GK fascinating through interactive quizzes, debates, and world-event discussions." },
  "Ms. Divya Iyer":    { role: "Creative Arts",             experience: "5 years",   rating: 4.8, reviews: 121, students: 160, location: "Mysore",     gradient: "from-fuchsia-400 to-pink-500",  achievement: "140+ little artists flourishing",       bio: "Trained fine artist who channels creativity through drawing, painting, and craft — nurturing self-expression." },
  "Ms. Rekha Pillai":  { role: "Social Studies",            experience: "6 years",   rating: 4.7, reviews: 112, students: 150, location: "Trivandrum", gradient: "from-amber-400 to-orange-400",  achievement: "130+ geography & history stars",        bio: "Brings history and geography to life through maps, timelines, and storytelling that makes facts unforgettable." },
};

const DEFAULT_GRADIENTS = [
  "from-violet-400 to-purple-600", "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",  "from-indigo-400 to-violet-600",
];

const selectionSteps = [
  { step: "1", title: "You pick a subject",      desc: "Choose the area your child needs help with from our course catalogue." },
  { step: "2", title: "We match the expert",     desc: "Our system instantly assigns the highest-rated available tutor for that subject." },
  { step: "3", title: "Free demo — no pressure", desc: "Your child meets the tutor in a free 30-min demo before any commitment." },
];

export default async function TutorsPage() {
  // Fetch approved tutors from DB
  const dbTutors = await prisma.user.findMany({
    where: { role: "TUTOR", approvalStatus: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, subjects: true },
  });

  // Build display list — DB tutors enriched with static meta
  const displayTutors = dbTutors.map((t, i) => {
    let parsedSubjects: string[] = [];
    try { parsedSubjects = JSON.parse(t.subjects ?? "[]"); } catch { /* ignore */ }

    const meta = TUTOR_META[t.name];
    const initials = t.name.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2);

    return {
      name:       t.name,
      initials,
      subjects:   parsedSubjects,
      role:       meta?.role       ?? (parsedSubjects.join(" & ") || "Expert Tutor"),
      experience: meta?.experience ?? "5+ years",
      rating:     meta?.rating     ?? 4.8,
      reviews:    meta?.reviews    ?? 100,
      students:   meta?.students   ?? 100,
      location:   meta?.location   ?? "India",
      gradient:   meta?.gradient   ?? DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length],
      achievement:meta?.achievement ?? "Dedicated to student excellence",
      bio:        meta?.bio        ?? "Experienced and passionate tutor dedicated to personalized 1-to-1 learning.",
    };
  });

  // If no DB tutors yet, fall back to static showcase list
  const staticFallback = Object.entries(TUTOR_META).slice(0, 6).map(([name, meta]) => ({
    name,
    initials: name.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2),
    subjects: meta.role.split(" & "),
    ...meta,
  }));

  const tutors = displayTutors.length > 0 ? displayTutors : staticFallback;

  return (
    <div className="min-h-screen bg-surface">

      {/* Header */}
      <div className="bg-primary py-16 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center text-on-primary">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">
            Our Educators
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Meet the Minds Behind the Magic
          </h1>
          <p className="text-on-primary/80 text-lg max-w-2xl mx-auto">
            India&apos;s finest educators — hand-picked, background-verified, and passionate about making every child love learning.{" "}
            <strong className="text-secondary-container">You never have to choose — we match your child automatically.</strong>
          </p>
          <p className="text-on-primary/60 text-sm mt-4">
            {dbTutors.length > 0
              ? `${dbTutors.length} approved tutor${dbTutors.length !== 1 ? "s" : ""} currently active`
              : "500+ expert tutors across all subjects"}
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
          {displayTutors.length > 0
            ? "Our approved tutors"
            : <>Some of our <span className="text-tertiary">top-rated tutors</span></>}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {tutors.map((tutor) => (
            <div key={tutor.name} className="group bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden">
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

                {tutor.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tutor.subjects.slice(0, 4).map((s) => (
                      <span key={s} className="badge-gray text-xs">{s}</span>
                    ))}
                  </div>
                )}

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
            <Link href="/book-demo" className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-fixed font-bold px-8 py-4 rounded-2xl hover:-translate-y-0.5 transition-all shadow-lg">
              Book Free Demo <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

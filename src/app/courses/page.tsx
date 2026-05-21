"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star, Filter, IndianRupee, DollarSign, BookOpen } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/utils";
import DemoCTA from "@/components/DemoCTA";
import { usePricingVisibility } from "@/hooks/usePricingVisibility";

// Enrichment metadata for each subject — display fields not stored in DB
const COURSE_META: Record<string, {
  ageGroup: string;
  tutor: string;
  rating: number;
  reviews: number;
  students: number;
  tagline: string;
  tags: string[];
}> = {
  "Phonics": {
    ageGroup: "Ages 3–7", tutor: "Ms. Ananya Singh", rating: 4.9, reviews: 512,
    students: 2100,
    tagline: "Build strong reading and speaking foundations",
    tags: ["Letter Sounds", "Blending", "Sight Words"],
  },
  "English Grammar": {
    ageGroup: "Ages 6–12", tutor: "Ms. Priya Sharma", rating: 4.8, reviews: 389,
    students: 1540,
    tagline: "Learn better, express better — every day",
    tags: ["Grammar", "Vocabulary", "Comprehension"],
  },
  "Mathematics": {
    ageGroup: "Ages 5–15", tutor: "Mr. Rahul Verma", rating: 4.9, reviews: 634,
    students: 1890,
    tagline: "Understand concepts, solve with confidence",
    tags: ["Arithmetic", "Algebra", "Problem Solving"],
  },
  "Public Speaking": {
    ageGroup: "Ages 7–15", tutor: "Ms. Kavya Nair", rating: 4.8, reviews: 278,
    students: 980,
    tagline: "Speak up, stand out, be confident",
    tags: ["Confidence", "Debate", "Presentation"],
  },
  "Coding": {
    ageGroup: "Ages 8–15", tutor: "Mr. Arjun Mehta", rating: 4.9, reviews: 341,
    students: 1120,
    tagline: "Build apps, games & the future",
    tags: ["Scratch", "Python", "Web Dev"],
  },
  "Writing & Communication": {
    ageGroup: "Ages 6–12", tutor: "Ms. Sunita Rao", rating: 4.7, reviews: 267,
    students: 870,
    tagline: "Write clearly, think creatively",
    tags: ["Story Writing", "Essays", "Journaling"],
  },
  "Science": {
    ageGroup: "Ages 8–15", tutor: "Dr. Meera Patel", rating: 4.8, reviews: 198,
    students: 760,
    tagline: "Discover, experiment & wonder",
    tags: ["Biology", "Physics", "Chemistry"],
  },
  "Life Skills": {
    ageGroup: "Ages 6–15", tutor: "Mr. Rohan Gupta", rating: 4.7, reviews: 189,
    students: 650,
    tagline: "Leadership, mindset & real-world readiness",
    tags: ["Leadership", "Mindset", "Social Skills"],
  },
  "Hindi": {
    ageGroup: "Ages 4–14", tutor: "Ms. Seema Joshi", rating: 4.8, reviews: 154,
    students: 540,
    tagline: "Master Hindi reading, writing & conversation",
    tags: ["Reading", "Writing", "Conversation"],
  },
  "General Knowledge": {
    ageGroup: "Ages 6–15", tutor: "Mr. Vikram Singh", rating: 4.7, reviews: 112,
    students: 430,
    tagline: "Curious minds, smarter kids",
    tags: ["World Affairs", "Science Facts", "Current Events"],
  },
  "Creative Arts": {
    ageGroup: "Ages 4–12", tutor: "Ms. Riya Mehta", rating: 4.8, reviews: 203,
    students: 680,
    tagline: "Express yourself through art & creativity",
    tags: ["Drawing", "Painting", "Craft"],
  },
  "Social Studies": {
    ageGroup: "Ages 7–14", tutor: "Ms. Divya Rao", rating: 4.7, reviews: 134,
    students: 510,
    tagline: "Understand the world around you",
    tags: ["Geography", "History", "Civics"],
  },
};

const DEFAULT_META = {
  ageGroup: "Ages 4–15", tutor: "Expert Tutor", rating: 4.8, reviews: 100,
  students: 500,
  tagline: "Expert 1-on-1 tutoring with personalised learning",
  tags: ["Live Sessions", "Personalised", "Progress Reports"],
};

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUSD: number;
  status: string;
  durationValue?: number;
  durationUnit?: string;
}

export default function CoursesPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [category, setCategory] = useState("All");
  const [stats,   setStats]     = useState({ parents: 0, tutors: 0, sessions: 0, courses: 0 });
  const [isIndia,  setIsIndia]  = useState<boolean | null>(null);
  const { showPricing }         = usePricingVisibility();

  useEffect(() => {
    fetch("/api/courses")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.courses) setCourses(d.courses); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});

    fetch("/api/geo")
      .then(r => r.ok ? r.json() : null)
      .then(d => setIsIndia(d?.isIndia ?? true))
      .catch(() => setIsIndia(true));
  }, []);

  const categories = ["All", ...courses.map(c => c.name)];

  const filtered = courses.filter((c) => {
    const meta = COURSE_META[c.name] ?? DEFAULT_META;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      meta.tagline.toLowerCase().includes(search.toLowerCase()) ||
      meta.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || c.name === category;
    return matchSearch && matchCat;
  });

  // Only show live DB counts once they exceed the minimum marketing thresholds,
  // so small real counts (e.g. 4 tutors during early launch) never replace
  // the published marketing numbers.
  const heroStats = [
    { value: stats.courses >= 8    ? `${stats.courses}+` : "8+",    label: "Subjects"      },
    { value: stats.tutors  >= 500  ? `${stats.tutors}+`  : "500+",  label: "Expert Tutors" },
    { value: stats.parents >= 10000? `${stats.parents}+` : "10K+",  label: "Students"      },
    { value: "50+",                                                   label: "Countries"     },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-primary pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center text-on-primary pb-12">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">Our Courses</span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Learn Smart.{" "}
            <span className="text-secondary-container">Grow Fast.</span>
          </h1>
          <p className="text-on-primary/80 text-lg max-w-xl mx-auto mb-8">
            Fun &amp; interactive 1-to-1 classes for young minds — ages 3 to 15, from anywhere in the world.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {heroStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-secondary-container">{s.value}</p>
                <p className="text-on-primary/70 text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Subject emoji pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { emoji: "🔤", label: "Phonics" },
              { emoji: "📚", label: "English" },
              { emoji: "➗", label: "Maths" },
              { emoji: "🎤", label: "Speaking" },
              { emoji: "💻", label: "Coding" },
              { emoji: "✏️", label: "Writing" },
              { emoji: "🔬", label: "Science" },
              { emoji: "🌟", label: "Life Skills" },
            ].map((s) => (
              <span key={s.label} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-8 bg-surface-container-low" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      {/* Search + filter bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search courses by name or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field py-2.5 px-4 md:w-52">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-on-surface-variant text-sm">
            Showing <span className="font-semibold text-on-surface">{loading ? "…" : filtered.length}</span> courses
          </p>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Filter size={15} /> Best rated
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((course) => {
              const meta   = COURSE_META[course.name] ?? DEFAULT_META;
              const colors = SUBJECT_COLORS[course.name] ?? SUBJECT_COLORS["Science"];
              return (
                <div
                  key={course.id}
                  className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-card border border-outline-variant flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className={`h-40 bg-gradient-to-br ${colors.gradient} flex items-center justify-center relative`}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {colors.icon}
                    </span>
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-white/90 text-on-surface font-semibold text-xs">{meta.ageGroup}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`badge text-xs mb-2 inline-block ${colors.bg} ${colors.text}`}>
                      {course.name}
                    </span>
                    <h3 className="font-display font-bold text-on-surface text-base mb-1 leading-snug">
                      {course.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mb-3 leading-snug">
                      {course.description || meta.tagline}
                    </p>
                    <p className="text-xs text-on-surface-variant mb-3">
                      by <span className="font-medium text-on-surface">{meta.tutor}</span>
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {meta.tags.map((tag) => (
                        <span key={tag} className="badge-gray text-xs">{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3 pt-3 border-t border-outline-variant/30">
                      <div className="flex items-center gap-1">
                        <Star size={11} fill="#fdd000" stroke="#fdd000" />
                        <span className="font-bold text-on-surface">{meta.rating}</span>
                        <span>({meta.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={11} />
                        {course.durationValue ?? 1} {course.durationUnit ?? "months"} · Daily Mon–Fri
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-0.5 mb-4">
                      {showPricing ? (
                        <>
                          {isIndia !== false
                            ? <IndianRupee size={15} className="text-primary mb-0.5 shrink-0" />
                            : <DollarSign  size={15} className="text-primary mb-0.5 shrink-0" />
                          }
                          <span className="font-display text-2xl font-extrabold text-primary leading-none">
                            {isIndia !== false ? course.price : (course.priceUSD ?? 15)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-on-surface-variant">Contact for pricing</span>
                      )}
                    </div>

                    <DemoCTA subject={course.name}
                      className="w-full btn-yellow justify-center text-xs py-2.5 mt-auto flex items-center gap-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">No courses found</h3>
            <p className="text-on-surface-variant mb-4">Try adjusting your search or filter criteria.</p>
            {courses.length === 0 && (
              <Link href="/book-demo" className="btn-primary inline-flex">Book a Free Demo</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, Clock, Filter, BookOpen } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/utils";

const allCourses = [
  {
    id: 1, subject: "Phonics", title: "Phonics Foundations", ageGroup: "Ages 3–7",
    tutor: "Ms. Ananya Singh", price: 199, rating: 4.9, reviews: 512,
    duration: "30 min/session", students: 2100,
    tagline: "Build strong reading and speaking foundations",
    tags: ["Letter Sounds", "Blending", "Sight Words"],
  },
  {
    id: 2, subject: "English Grammar", title: "English Grammar Mastery", ageGroup: "Ages 6–12",
    tutor: "Ms. Priya Sharma", price: 219, rating: 4.8, reviews: 389,
    duration: "45 min/session", students: 1540,
    tagline: "Learn better, express better — every day",
    tags: ["Grammar", "Vocabulary", "Comprehension"],
  },
  {
    id: 3, subject: "Mathematics", title: "Mathematics Excellence", ageGroup: "Ages 5–15",
    tutor: "Mr. Rahul Verma", price: 229, rating: 4.9, reviews: 634,
    duration: "45 min/session", students: 1890,
    tagline: "Understand concepts, solve with confidence",
    tags: ["Arithmetic", "Algebra", "Problem Solving"],
  },
  {
    id: 4, subject: "Public Speaking", title: "Speak Up & Shine", ageGroup: "Ages 7–15",
    tutor: "Ms. Kavya Nair", price: 219, rating: 4.8, reviews: 278,
    duration: "30 min/session", students: 980,
    tagline: "Speak up, stand out, be confident",
    tags: ["Confidence", "Debate", "Presentation"],
  },
  {
    id: 5, subject: "Coding", title: "Kids Coding Adventures", ageGroup: "Ages 8–15",
    tutor: "Mr. Arjun Mehta", price: 249, rating: 4.9, reviews: 341,
    duration: "45 min/session", students: 1120,
    tagline: "Build apps, games & the future",
    tags: ["Scratch", "Python", "Web Dev"],
  },
  {
    id: 6, subject: "Writing & Communication", title: "Creative Writing Stars", ageGroup: "Ages 6–12",
    tutor: "Ms. Sunita Rao", price: 199, rating: 4.7, reviews: 267,
    duration: "30 min/session", students: 870,
    tagline: "Write clearly, think creatively",
    tags: ["Story Writing", "Essays", "Journaling"],
  },
  {
    id: 7, subject: "Science", title: "Science Explorers", ageGroup: "Ages 8–15",
    tutor: "Dr. Meera Patel", price: 229, rating: 4.8, reviews: 198,
    duration: "45 min/session", students: 760,
    tagline: "Discover, experiment & wonder",
    tags: ["Biology", "Physics", "Chemistry"],
  },
  {
    id: 8, subject: "Life Skills", title: "Future-Ready Life Skills", ageGroup: "Ages 6–15",
    tutor: "Mr. Rohan Gupta", price: 199, rating: 4.7, reviews: 189,
    duration: "30 min/session", students: 650,
    tagline: "Leadership, mindset & real-world readiness",
    tags: ["Leadership", "Mindset", "Social Skills"],
  },
];

const categories = ["All", "Phonics", "English Grammar", "Mathematics", "Public Speaking", "Coding", "Writing & Communication", "Science", "Life Skills"];

const heroStats = [
  { value: "8", label: "Subjects" },
  { value: "500+", label: "Expert Tutors" },
  { value: "10K+", label: "Students" },
  { value: "50+", label: "Countries" },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = allCourses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.subject === category;
    return matchSearch && matchCat;
  });

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
            Showing <span className="font-semibold text-on-surface">{filtered.length}</span> courses
          </p>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Filter size={15} /> Best rated
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((course) => {
            const colors = SUBJECT_COLORS[course.subject] ?? SUBJECT_COLORS["Science"];
            const demoUrl = `/book-demo?subject=${encodeURIComponent(course.subject)}`;
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
                    <span className="badge bg-white/90 text-on-surface font-semibold text-xs">{course.ageGroup}</span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="badge bg-green-100 text-green-700 font-bold text-xs">Free Demo Available</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <span className={`badge text-xs mb-2 inline-block ${colors.bg} ${colors.text}`}>
                    {course.subject}
                  </span>
                  <h3 className="font-display font-bold text-on-surface text-base mb-1 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3 leading-snug">{course.tagline}</p>
                  <p className="text-xs text-on-surface-variant mb-3">by <span className="font-medium text-on-surface">{course.tutor}</span></p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.map((tag) => (
                      <span key={tag} className="badge-gray text-xs">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4 pt-3 border-t border-outline-variant/30">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="#fdd000" stroke="#fdd000" />
                      <span className="font-bold text-on-surface">{course.rating}</span>
                      <span>({course.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1"><Clock size={11} /> {course.duration}</div>
                  </div>

                  <Link href={demoUrl} className="w-full btn-yellow justify-center text-xs py-2.5 mt-auto">
                    <BookOpen size={13} /> Book Free Demo
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">No courses found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

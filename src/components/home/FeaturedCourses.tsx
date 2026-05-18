"use client";

import Link from "next/link";
import { Star, Clock, ArrowRight } from "lucide-react";

const courses = [
  {
    id: 1, subject: "Phonics & Reading", icon: "🔤",
    title: "Phonics Foundations",
    desc: "Build a rock-solid foundation for a lifetime of confident reading and literacy.",
    tutor: "Ms. Ananya Singh", price: 199, rating: 4.9, reviews: 512,
    duration: "30 min/session", ageGroup: "Ages 3–7",
    borderColor: "border-tertiary",
    subjectColor: "bg-tertiary-fixed text-tertiary",
  },
  {
    id: 2, subject: "Mathematics", icon: "🔢",
    title: "Mathematics Excellence",
    desc: "Master logic, problem-solving, and advanced concepts with visual learning tools.",
    tutor: "Mr. Rahul Verma", price: 229, rating: 4.9, reviews: 634,
    duration: "45 min/session", ageGroup: "Ages 5–15",
    borderColor: "border-secondary-container",
    subjectColor: "bg-secondary-container/30 text-secondary",
  },
  {
    id: 4, subject: "Public Speaking", icon: "🎤",
    title: "Speak Up & Shine",
    desc: "Unleash the leader within. Learn to speak with poise, clarity, and confidence.",
    tutor: "Ms. Kavya Nair", price: 219, rating: 4.8, reviews: 278,
    duration: "30 min/session", ageGroup: "Ages 7–15",
    borderColor: "border-primary",
    subjectColor: "bg-primary/10 text-primary",
  },
  {
    id: 2, subject: "English Grammar", icon: "💬",
    title: "English Grammar Mastery",
    desc: "Learn better, express better — build vocabulary and grammar every day.",
    tutor: "Ms. Priya Sharma", price: 219, rating: 4.8, reviews: 389,
    duration: "45 min/session", ageGroup: "Ages 6–12",
    borderColor: "border-primary-container",
    subjectColor: "bg-primary-fixed text-primary",
  },
  {
    id: 5, subject: "Coding", icon: "💻",
    title: "Kids Coding Adventures",
    desc: "Build apps, games & the future — from Scratch to Python and beyond.",
    tutor: "Mr. Arjun Mehta", price: 249, rating: 4.9, reviews: 341,
    duration: "45 min/session", ageGroup: "Ages 8–15",
    borderColor: "border-on-surface-variant",
    subjectColor: "bg-surface-container-highest text-on-surface-variant",
  },
  {
    id: 6, subject: "Writing & Communication", icon: "✏️",
    title: "Creative Writing Stars",
    desc: "Write clearly, think creatively — story writing, essays, and journaling.",
    tutor: "Ms. Sunita Rao", price: 199, rating: 4.7, reviews: 267,
    duration: "30 min/session", ageGroup: "Ages 6–12",
    borderColor: "border-teal-400",
    subjectColor: "bg-teal-50 text-teal-700",
  },
  {
    id: 7, subject: "Science", icon: "🔬",
    title: "Science Explorers",
    desc: "Discover, experiment & wonder — biology, physics, and chemistry made fun.",
    tutor: "Dr. Meera Patel", price: 229, rating: 4.8, reviews: 198,
    duration: "45 min/session", ageGroup: "Ages 8–15",
    borderColor: "border-green-400",
    subjectColor: "bg-green-50 text-green-700",
  },
  {
    id: 8, subject: "Life Skills", icon: "🌟",
    title: "Future-Ready Life Skills",
    desc: "Leadership, mindset & real-world readiness — skills for life beyond school.",
    tutor: "Mr. Rohan Gupta", price: 199, rating: 4.7, reviews: 189,
    duration: "30 min/session", ageGroup: "Ages 6–15",
    borderColor: "border-secondary-fixed-dim",
    subjectColor: "bg-secondary-container/20 text-secondary",
  },
];

const categories = ["All", "Phonics & Reading", "English Grammar", "Mathematics", "Public Speaking", "Coding", "Science", "Writing & Communication", "Life Skills"];

export default function FeaturedCourses() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="badge-blue mb-3 inline-block font-semibold text-xs uppercase tracking-wide">Our Courses</span>
            <h2 className="section-heading">
              Future-Ready{" "}
              <span className="text-tertiary">Skills.</span>
            </h2>
            <p className="text-on-surface-variant mt-2">Explore our most popular courses designed to challenge and inspire young minds.</p>
          </div>
          <Link href="/courses" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline whitespace-nowrap self-start md:self-auto">
            Explore All Courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-1">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                i === 0
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <Link
              key={idx}
              href={`/courses/${course.id}`}
              className={`group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-card card-hover border-t-8 ${course.borderColor}`}
            >
              {/* Thumbnail */}
              <div className="h-36 bg-surface-container flex items-center justify-center relative">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                  {course.icon}
                </span>
                <div className="absolute top-3 right-3">
                  <span className="badge bg-white text-on-surface-variant font-semibold text-xs shadow-sm">{course.ageGroup}</span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="badge bg-primary text-on-primary font-bold text-xs">₹{course.price}/mo</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className={`badge text-xs mb-2 inline-block ${course.subjectColor}`}>
                  {course.subject}
                </span>
                <h3 className="font-display font-bold text-on-surface text-base mb-1 group-hover:text-primary transition-colors leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-on-surface-variant mb-3 leading-snug">{course.desc}</p>
                <p className="text-xs text-on-surface-variant mb-3">by <span className="font-semibold">{course.tutor}</span></p>

                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/20">
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#fdd000" stroke="#fdd000" />
                    <span className="font-bold text-on-surface">{course.rating}</span>
                    <span>({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1"><Clock size={11} /> {course.duration}</div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button className="w-full bg-secondary-container text-on-secondary-fixed font-bold text-xs py-2.5 rounded-full squishy-hover">
                    Book Free Demo 🎉
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

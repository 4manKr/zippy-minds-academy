"use client";

import Link from "next/link";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/utils";

const courses = [
  {
    id: 1, subject: "Phonics", title: "Phonics Foundations",
    tagline: "Build strong reading foundations",
    tutor: "Ms. Ananya Singh", price: 199, rating: 4.9, reviews: 512,
    duration: "30 min/session", students: 2100, ageGroup: "Ages 3–7",
  },
  {
    id: 2, subject: "English Grammar", title: "English Grammar Mastery",
    tagline: "Learn better, express better",
    tutor: "Ms. Priya Sharma", price: 219, rating: 4.8, reviews: 389,
    duration: "45 min/session", students: 1540, ageGroup: "Ages 6–12",
  },
  {
    id: 3, subject: "Mathematics", title: "Mathematics Excellence",
    tagline: "Understand concepts, solve with confidence",
    tutor: "Mr. Rahul Verma", price: 229, rating: 4.9, reviews: 634,
    duration: "45 min/session", students: 1890, ageGroup: "Ages 5–15",
  },
  {
    id: 4, subject: "Public Speaking", title: "Speak Up & Shine",
    tagline: "Speak up, stand out, be confident",
    tutor: "Ms. Kavya Nair", price: 219, rating: 4.8, reviews: 278,
    duration: "30 min/session", students: 980, ageGroup: "Ages 7–15",
  },
  {
    id: 5, subject: "Coding", title: "Kids Coding Adventures",
    tagline: "Build apps, games & the future",
    tutor: "Mr. Arjun Mehta", price: 249, rating: 4.9, reviews: 341,
    duration: "45 min/session", students: 1120, ageGroup: "Ages 8–15",
  },
  {
    id: 6, subject: "Writing & Communication", title: "Creative Writing Stars",
    tagline: "Write clearly, think creatively",
    tutor: "Ms. Sunita Rao", price: 199, rating: 4.7, reviews: 267,
    duration: "30 min/session", students: 870, ageGroup: "Ages 6–12",
  },
  {
    id: 7, subject: "Science", title: "Science Explorers",
    tagline: "Discover, experiment & wonder",
    tutor: "Dr. Meera Patel", price: 229, rating: 4.8, reviews: 198,
    duration: "45 min/session", students: 760, ageGroup: "Ages 8–15",
  },
  {
    id: 8, subject: "Life Skills", title: "Future-Ready Life Skills",
    tagline: "Coding, leadership & real-world skills",
    tutor: "Mr. Rohan Gupta", price: 199, rating: 4.7, reviews: 189,
    duration: "30 min/session", students: 650, ageGroup: "Ages 6–15",
  },
];

const categories = ["All", "Phonics", "English Grammar", "Mathematics", "Public Speaking", "Coding", "Science", "Writing & Communication", "Life Skills"];

export default function FeaturedCourses() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="badge-orange mb-3 inline-block">Our Courses</span>
            <h2 className="section-heading">
              Learn Smart.{" "}
              <span className="gradient-text">Grow Fast.</span>
            </h2>
            <p className="text-gray-500 mt-2">Fun & interactive classes designed for young minds worldwide.</p>
          </div>
          <Link href="/courses" className="btn-secondary whitespace-nowrap self-start md:self-auto">
            All Courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-1">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                i === 0
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => {
            const colors = SUBJECT_COLORS[course.subject] ?? SUBJECT_COLORS["Science"];
            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-card card-hover border border-gray-100"
              >
                {/* Thumbnail */}
                <div className={`h-36 bg-gradient-to-br ${colors.gradient} flex items-center justify-center relative`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {colors.icon}
                  </span>
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-white/90 text-gray-700 font-semibold text-xs">{course.ageGroup}</span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="badge bg-white font-bold text-brand-blue text-xs">${course.price}/mo</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className={`badge text-xs mb-2 inline-block ${colors.bg} ${colors.text}`}>
                    {course.subject}
                  </span>
                  <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-brand-blue transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3 leading-snug">{course.tagline}</p>
                  <p className="text-xs text-gray-500 mb-3">by <span className="font-medium">{course.tutor}</span></p>

                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="gold" stroke="gold" />
                      <span className="font-bold text-gray-800">{course.rating}</span>
                      <span>({course.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1"><Clock size={11} /> {course.duration}</div>
                  </div>

                  <button className="w-full btn-primary justify-center text-xs py-2.5">
                    Book Free Demo 🎉
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

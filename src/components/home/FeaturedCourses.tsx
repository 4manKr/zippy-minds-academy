"use client";

import Link from "next/link";
import { Star, Clock, Users, ArrowRight, BookOpen } from "lucide-react";

const courses = [
  { id: 1, title: "Advanced Mathematics", subject: "Mathematics", grade: "Grade 9-12", tutor: "Dr. Priya Sharma", price: 25, rating: 4.9, reviews: 234, duration: "60 min/session", students: 1200, color: "blue", emoji: "📐" },
  { id: 2, title: "IGCSE Physics Mastery", subject: "Physics", grade: "Grade 10-12", tutor: "Rahul Verma", price: 22, rating: 4.8, reviews: 189, duration: "60 min/session", students: 890, color: "purple", emoji: "⚡" },
  { id: 3, title: "English Literature & Writing", subject: "English", grade: "Grade 6-12", tutor: "Ananya Singh", price: 18, rating: 4.9, reviews: 312, duration: "45 min/session", students: 1540, color: "cyan", emoji: "📖" },
  { id: 4, title: "Chemistry for IB/A-Level", subject: "Chemistry", grade: "Grade 11-12", tutor: "Dr. Vikram Nair", price: 28, rating: 4.7, reviews: 156, duration: "60 min/session", students: 670, color: "blue", emoji: "🧪" },
  { id: 5, title: "Computer Science & Coding", subject: "Computer Science", grade: "Grade 7-12", tutor: "Arjun Mehta", price: 30, rating: 4.9, reviews: 278, duration: "60 min/session", students: 1100, color: "purple", emoji: "💻" },
  { id: 6, title: "Biology & Life Sciences", subject: "Biology", grade: "Grade 8-12", tutor: "Dr. Meera Patel", price: 22, rating: 4.8, reviews: 198, duration: "60 min/session", students: 760, color: "cyan", emoji: "🔬" },
];

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-brand-blue",
  purple: "from-purple-500 to-brand-purple",
  cyan: "from-cyan-400 to-brand-cyan",
};

const categories = ["All", "Mathematics", "Science", "English", "Computer Science", "Languages"];

export default function FeaturedCourses() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="badge-blue mb-3 inline-block">Featured Courses</span>
            <h2 className="section-heading">
              Learn from India&apos;s{" "}
              <span className="gradient-text">best educators</span>
            </h2>
          </div>
          <Link href="/courses" className="btn-secondary whitespace-nowrap self-start md:self-auto">
            View All Courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === 0
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-card card-hover border border-gray-100"
            >
              {/* Thumbnail */}
              <div className={`h-44 bg-gradient-to-br ${colorMap[course.color]} flex items-center justify-center relative overflow-hidden`}>
                <span className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-500">{course.emoji}</span>
                <div className="absolute top-4 right-4">
                  <span className="badge bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                    {course.grade}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="badge bg-white text-brand-blue font-bold">
                    ${course.price}/session
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-gray">{course.subject}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-blue transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">by {course.tutor}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="gold" stroke="gold" />
                    <span className="font-semibold text-gray-900">{course.rating}</span>
                    <span>({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                <button className="w-full btn-primary justify-center text-sm py-2.5">
                  <BookOpen size={16} />
                  Enroll Now
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

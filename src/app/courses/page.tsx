"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, Clock, Users, Filter, BookOpen, ArrowRight } from "lucide-react";

const allCourses = [
  { id: 1, title: "Advanced Mathematics", subject: "Mathematics", grade: "Grade 9-12", tutor: "Dr. Priya Sharma", price: 25, rating: 4.9, reviews: 234, duration: "60 min", students: 1200, emoji: "📐", difficulty: "Advanced", category: "Mathematics" },
  { id: 2, title: "IGCSE Physics Mastery", subject: "Physics", grade: "Grade 10-12", tutor: "Rahul Verma", price: 22, rating: 4.8, reviews: 189, duration: "60 min", students: 890, emoji: "⚡", difficulty: "Advanced", category: "Science" },
  { id: 3, title: "English Literature & Writing", subject: "English", grade: "Grade 6-12", tutor: "Ananya Singh", price: 18, rating: 4.9, reviews: 312, duration: "45 min", students: 1540, emoji: "📖", difficulty: "Intermediate", category: "English" },
  { id: 4, title: "Chemistry for IB/A-Level", subject: "Chemistry", grade: "Grade 11-12", tutor: "Dr. Vikram Nair", price: 28, rating: 4.7, reviews: 156, duration: "60 min", students: 670, emoji: "🧪", difficulty: "Advanced", category: "Science" },
  { id: 5, title: "Computer Science & Coding", subject: "Computer Science", grade: "Grade 7-12", tutor: "Arjun Mehta", price: 30, rating: 4.9, reviews: 278, duration: "60 min", students: 1100, emoji: "💻", difficulty: "Intermediate", category: "Technology" },
  { id: 6, title: "Biology & Life Sciences", subject: "Biology", grade: "Grade 8-12", tutor: "Dr. Meera Patel", price: 22, rating: 4.8, reviews: 198, duration: "60 min", students: 760, emoji: "🔬", difficulty: "Intermediate", category: "Science" },
  { id: 7, title: "Foundation Mathematics", subject: "Mathematics", grade: "Grade 1-5", tutor: "Sunita Rao", price: 15, rating: 4.8, reviews: 445, duration: "30 min", students: 2100, emoji: "➕", difficulty: "Beginner", category: "Mathematics" },
  { id: 8, title: "Hindi Language Mastery", subject: "Hindi", grade: "Grade 1-10", tutor: "Kavita Sharma", price: 15, rating: 4.7, reviews: 267, duration: "45 min", students: 980, emoji: "🇮🇳", difficulty: "Beginner", category: "Languages" },
  { id: 9, title: "Economics & Business Studies", subject: "Economics", grade: "Grade 11-12", tutor: "Rohan Gupta", price: 20, rating: 4.6, reviews: 134, duration: "60 min", students: 540, emoji: "📊", difficulty: "Advanced", category: "Commerce" },
];

const categories = ["All", "Mathematics", "Science", "English", "Technology", "Languages", "Commerce"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

const gradientMap: Record<number, string> = {
  1: "from-blue-500 to-brand-blue",
  2: "from-purple-500 to-brand-purple",
  3: "from-cyan-400 to-brand-cyan",
  4: "from-emerald-400 to-emerald-600",
  5: "from-orange-400 to-red-500",
  6: "from-pink-400 to-rose-500",
  7: "from-yellow-400 to-orange-400",
  8: "from-indigo-400 to-brand-blue",
  9: "from-teal-400 to-cyan-600",
};

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = allCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    const matchDiff = difficulty === "All" || c.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block">Our Courses</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore All Courses</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Browse 100+ courses across all subjects, taught by India&apos;s finest educators.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <div className="flex gap-3">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field py-2.5 px-4 w-auto">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field py-2.5 px-4 w-auto">
                {difficulties.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> courses
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={15} /> Sort by: Best rated
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-card card-hover border border-gray-100">
              <div className={`h-44 bg-gradient-to-br ${gradientMap[course.id] || "from-brand-blue to-brand-purple"} flex items-center justify-center relative`}>
                <span className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-500">{course.emoji}</span>
                <div className="absolute top-4 left-4">
                  <span className={`badge text-xs ${course.difficulty === "Beginner" ? "bg-green-100 text-green-700" : course.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {course.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="badge bg-white/90 text-brand-blue font-bold">${course.price}/hr</span>
                </div>
              </div>
              <div className="p-6">
                <span className="badge-gray text-xs mb-2 inline-block">{course.subject} · {course.grade}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-blue transition-colors">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4">by {course.tutor}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Star size={13} fill="gold" stroke="gold" />
                    <span className="font-semibold text-gray-900">{course.rating}</span>
                    <span className="text-xs">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1"><Clock size={13} /> {course.duration}</div>
                  <div className="flex items-center gap-1"><Users size={13} /> {course.students.toLocaleString()}</div>
                </div>
                <button className="w-full btn-primary justify-center text-sm py-2.5">
                  <BookOpen size={15} /> Enroll Now
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

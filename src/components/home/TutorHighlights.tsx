"use client";

import Link from "next/link";
import { Star, ArrowRight, MapPin, BookOpen, Award } from "lucide-react";

const tutors = [
  { id: 1, name: "Ms. Ananya Singh",  subject: "Phonics & English Grammar", experience: "10 years", rating: 4.9, reviews: 512, location: "Mumbai",    students: 620, initials: "AS", color: "from-pink-400 to-rose-500",     subjects: ["Phonics", "Reading", "Grammar"] },
  { id: 2, name: "Mr. Rahul Verma",   subject: "Mathematics",               experience: "9 years",  rating: 4.9, reviews: 634, location: "Bangalore",  students: 890, initials: "RV", color: "from-purple-400 to-brand-purple", subjects: ["Arithmetic", "Algebra", "Problem Solving"] },
  { id: 3, name: "Ms. Kavya Nair",    subject: "Public Speaking & Writing",  experience: "7 years",  rating: 4.8, reviews: 278, location: "Delhi",      students: 380, initials: "KN", color: "from-orange-400 to-yellow-400",  subjects: ["Confidence", "Debate", "Essay Writing"] },
  { id: 4, name: "Mr. Arjun Mehta",   subject: "Coding & Science",           experience: "5 years",  rating: 4.9, reviews: 341, location: "Pune",       students: 480, initials: "AM", color: "from-indigo-400 to-blue-600",    subjects: ["Scratch", "Python", "Science Concepts"] },
];

export default function TutorHighlights() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="badge-purple mb-3 inline-block">Meet Our Tutors</span>
            <h2 className="section-heading">
              Top-rated tutors{" "}
              <span className="gradient-text">ready for you</span>
            </h2>
          </div>
          <Link href="/tutors" className="btn-secondary self-start md:self-auto whitespace-nowrap">
            View All Tutors <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map((tutor) => (
            <Link
              key={tutor.id}
              href={`/tutors/${tutor.id}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-card card-hover overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${tutor.color} h-28 relative flex items-end px-5 pb-0`}>
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-brand-blue translate-y-10 border-4 border-white">
                  {tutor.initials}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="badge bg-white/20 text-white border border-white/30 backdrop-blur-sm text-xs">
                    <Award size={10} className="mr-1 inline" />
                    Verified
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 p-5">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-blue transition-colors">{tutor.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{tutor.subject}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <MapPin size={12} /> {tutor.location} · {tutor.experience} exp.
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} fill="gold" stroke="gold" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{tutor.rating}</span>
                  <span className="text-xs text-gray-400">({tutor.reviews})</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="badge-gray text-xs">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} /> {tutor.students} students
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, BookOpen, Award, Users, Filter } from "lucide-react";

const allTutors = [
  { id: 1, name: "Dr. Priya Sharma", subjects: ["Mathematics", "Physics"], experience: "8 years", rating: 4.9, reviews: 342, location: "Bangalore", students: 450, initials: "PS", color: "from-blue-400 to-brand-blue", tags: ["IGCSE", "IB", "CBSE"], price: 25, available: true },
  { id: 2, name: "Rahul Verma", subjects: ["Physics", "Chemistry"], experience: "6 years", rating: 4.8, reviews: 287, location: "Delhi", students: 380, initials: "RV", color: "from-purple-400 to-brand-purple", tags: ["A-Level", "IGCSE"], price: 22, available: true },
  { id: 3, name: "Ananya Singh", subjects: ["English", "Literature"], experience: "10 years", rating: 4.9, reviews: 512, location: "Mumbai", students: 620, initials: "AS", color: "from-cyan-400 to-brand-cyan", tags: ["IELTS", "Creative Writing"], price: 18, available: true },
  { id: 4, name: "Dr. Vikram Nair", subjects: ["Chemistry", "Biology"], experience: "12 years", rating: 4.7, reviews: 198, location: "Chennai", students: 290, initials: "VN", color: "from-emerald-400 to-emerald-600", tags: ["IB", "AP"], price: 28, available: false },
  { id: 5, name: "Arjun Mehta", subjects: ["Computer Science"], experience: "5 years", rating: 4.9, reviews: 278, location: "Pune", students: 410, initials: "AM", color: "from-orange-400 to-red-500", tags: ["Python", "Web Dev", "IGCSE"], price: 30, available: true },
  { id: 6, name: "Dr. Meera Patel", subjects: ["Biology", "Science"], experience: "9 years", rating: 4.8, reviews: 198, location: "Ahmedabad", students: 320, initials: "MP", color: "from-pink-400 to-rose-500", tags: ["IB HL", "CBSE"], price: 22, available: true },
  { id: 7, name: "Sunita Rao", subjects: ["Mathematics", "Hindi"], experience: "7 years", rating: 4.8, reviews: 445, location: "Hyderabad", students: 560, initials: "SR", color: "from-yellow-400 to-orange-400", tags: ["Primary", "CBSE"], price: 15, available: true },
  { id: 8, name: "Rohan Gupta", subjects: ["Economics", "Accountancy"], experience: "8 years", rating: 4.6, reviews: 134, location: "Kolkata", students: 240, initials: "RG", color: "from-teal-400 to-cyan-600", tags: ["A-Level", "IB Economics"], price: 20, available: true },
];

const subjectFilters = ["All", "Mathematics", "Science", "English", "Computer Science", "Commerce", "Languages"];

export default function TutorsPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = allTutors.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchSubject = subject === "All" || t.subjects.some((s) => s.includes(subject));
    const matchAvailable = !availableOnly || t.available;
    return matchSearch && matchSubject && matchAvailable;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block">Our Tutors</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Expert Tutors</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            500+ verified, background-checked Indian tutors ready to teach your child.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search tutors by name or subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-11" />
            </div>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field py-2.5 px-4 w-auto">
              {subjectFilters.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="w-4 h-4 accent-brand-blue" />
              Available now
            </label>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> tutors</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((tutor) => (
            <Link key={tutor.id} href={`/tutors/${tutor.id}`} className="group bg-white rounded-3xl border border-gray-100 shadow-card card-hover overflow-hidden">
              <div className={`bg-gradient-to-br ${tutor.color} h-28 relative flex items-end px-5`}>
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-brand-blue translate-y-10 border-4 border-white">
                  {tutor.initials}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`badge text-xs ${tutor.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {tutor.available ? "● Available" : "○ Busy"}
                  </span>
                </div>
              </div>
              <div className="pt-12 p-5">
                <h3 className="font-bold text-gray-900 text-base group-hover:text-brand-blue transition-colors">{tutor.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{tutor.subjects.join(" · ")}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <MapPin size={11} /> {tutor.location} · {tutor.experience} exp.
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={11} fill="gold" stroke="gold" />)}</div>
                  <span className="text-sm font-semibold text-gray-900">{tutor.rating}</span>
                  <span className="text-xs text-gray-400">({tutor.reviews})</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {tutor.tags.map((tag) => <span key={tag} className="badge-gray text-xs">{tag}</span>)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Users size={12} /> {tutor.students} students</div>
                  <span className="font-bold text-brand-blue">${tutor.price}/hr</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

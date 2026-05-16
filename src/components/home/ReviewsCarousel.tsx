"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  { id: 1, name: "Sarah Mitchell", country: "🇬🇧 United Kingdom", avatar: "SM", subject: "Mathematics", grade: "Grade 10", text: "My daughter's grades went from a C to an A in just 3 months! The tutor Dr. Priya is absolutely brilliant — patient, knowledgeable, and very encouraging. Highly recommend Zippy Minds to every UK parent!", rating: 5 },
  { id: 2, name: "James Anderson", country: "🇺🇸 United States", avatar: "JA", subject: "Physics", grade: "Grade 11", text: "The timezone flexibility is incredible. We're in California and our tutor seamlessly adjusts to PST. My son's SAT Physics score improved by 120 points. Worth every penny!", rating: 5 },
  { id: 3, name: "Preethi Ramachandran", country: "🇸🇬 Singapore", avatar: "PR", subject: "English", grade: "Grade 8", text: "Ananya's English classes transformed my child's writing skills completely. The booking process is so smooth — I love how it shows slots in Singapore time automatically!", rating: 5 },
  { id: 4, name: "Mohammed Al-Rashid", country: "🇦🇪 UAE", avatar: "MA", subject: "Chemistry", grade: "Grade 12", text: "Excellent platform! The free demo was a game-changer — we knew within 30 minutes that Dr. Vikram was the perfect fit. My son got 94% in CBSE Chemistry!", rating: 5 },
  { id: 5, name: "Emily Chen", country: "🇦🇺 Australia", avatar: "EC", subject: "Biology", grade: "Grade 11", text: "Found Zippy Minds after trying 3 other platforms. The quality of tutors here is on another level. Dr. Meera made complex topics so simple. My daughter scored an A* in IB!", rating: 5 },
  { id: 6, name: "David Williams", country: "🇨🇦 Canada", avatar: "DW", subject: "Computer Science", grade: "Grade 10", text: "Arjun's coding classes are amazing! My son went from zero to building his own web app in 6 months. The platform is smooth, sessions are punctual, and the quality is outstanding.", rating: 5 },
];

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(totalPages - 1, i + 1));

  const visibleReviews = reviews.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="badge-yellow mb-4 inline-block">Parent Stories</span>
          <h2 className="section-heading">
            Loved by families{" "}
            <span className="gradient-text">across the globe</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={20} fill="gold" stroke="gold" />)}
            </div>
            <span className="text-lg font-bold text-gray-900">4.9/5</span>
            <span className="text-gray-500">from 2,400+ reviews</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 card-hover">
              <Quote size={28} className="text-brand-purple/20 mb-4" />
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.country}</p>
                  <p className="text-xs text-gray-400">{review.subject} · {review.grade}</p>
                </div>
                <div className="flex shrink-0">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill="gold" stroke="gold" />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-brand-blue w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={currentIndex === totalPages - 1}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

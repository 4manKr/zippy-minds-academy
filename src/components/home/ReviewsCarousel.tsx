"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  { id: 1, name: "Sarah K.",  country: "London, UK",        avatar: "SK", avatarBg: "bg-primary-container",    subject: "Phonics",          age: "Age 5",  text: "The 1-on-1 attention is unmatched. My daughter went from struggling with letters to reading full sentences in just 2 months. Zippy Minds is amazing!" },
  { id: 2, name: "James D.",  country: "New York, USA",      avatar: "JD", avatarBg: "bg-tertiary",             subject: "Mathematics",      age: "Age 9",  text: "Finding a tutor who can really connect with a 9-year-old online is hard. Zippy Minds makes it look easy. My son looks forward to his Maths class every week!" },
  { id: 3, name: "Meera R.",  country: "Dubai, UAE",         avatar: "MR", avatarBg: "bg-secondary",            subject: "Public Speaking",  age: "Age 11", text: "The Public Speaking course gave my daughter so much confidence. She used to be shy, but now she's participating in all her school debates!" },
  { id: 4, name: "Preethi S.",country: "Singapore",          avatar: "PS", avatarBg: "bg-primary",              subject: "English Grammar",  age: "Age 8",  text: "Ananya's English classes transformed my child's writing skills completely. The booking process is so smooth — I love how it shows slots in Singapore time!" },
  { id: 5, name: "Emily C.",  country: "Sydney, Australia",  avatar: "EC", avatarBg: "bg-tertiary-container",   subject: "Coding",           age: "Age 12", text: "My daughter built her own game in Scratch within 6 weeks! Mr. Arjun's Coding classes are on another level. Highly recommend Zippy Minds!" },
  { id: 6, name: "David W.",  country: "Toronto, Canada",    avatar: "DW", avatarBg: "bg-secondary-fixed-dim",  subject: "Life Skills",      age: "Age 10", text: "The Life Skills sessions are fantastic — my son is more organised, confident, and has better social skills at school. Sessions are always punctual!" },
];

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(totalPages - 1, i + 1));

  const visibleReviews = reviews.slice(currentIndex * itemsPerPage, currentIndex * itemsPerPage + itemsPerPage);

  return (
    <section className="py-24 bg-inverse-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12">
          <div className="inline-block text-secondary-fixed font-bold tracking-widest text-xs uppercase mb-3">
            Parent Feedback
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-inverse-on-surface">
            Winning Hearts Globally
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} size={18} fill="#fdd000" stroke="#fdd000" />)}
            </div>
            <span className="text-lg font-bold text-inverse-on-surface">4.9/5</span>
            <span className="text-surface-variant text-sm">from 2,400+ reviews</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/10 flex flex-col justify-between card-hover">
              <div>
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={18} fill="#fdd000" stroke="#fdd000" />)}
                </div>
                <p className="text-surface-container-low text-sm leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/10">
                <div className={`w-11 h-11 rounded-full ${review.avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {review.avatar}
                </div>
                <div>
                  <p className="font-bold text-inverse-on-surface text-sm">{review.name}</p>
                  <p className="text-xs text-surface-variant">{review.country}</p>
                  <p className="text-xs text-surface-dim">{review.subject} · {review.age}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} disabled={currentIndex === 0} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-inverse-on-surface hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className={`h-2.5 rounded-full transition-all ${i === currentIndex ? "bg-secondary-container w-6" : "bg-white/30 w-2.5"}`} />
            ))}
          </div>
          <button onClick={next} disabled={currentIndex === totalPages - 1} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-inverse-on-surface hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

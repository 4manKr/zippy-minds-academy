import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Sarah Mitchell", country: "🇬🇧 UK", avatar: "SM", subject: "Mathematics", grade: "Grade 10", rating: 5, text: "My daughter's grades went from C to A in 3 months. Dr. Priya is absolutely brilliant!", verified: true },
  { name: "James Anderson", country: "🇺🇸 USA", avatar: "JA", subject: "Physics", grade: "Grade 11", rating: 5, text: "Timezone flexibility is incredible. My son's SAT Physics improved by 120 points.", verified: true },
  { name: "Preethi R.", country: "🇸🇬 Singapore", avatar: "PR", subject: "English", grade: "Grade 8", rating: 5, text: "Ananya transformed my child's writing. The booking system shows slots in SGT automatically!", verified: true },
  { name: "Mohammed A.", country: "🇦🇪 UAE", avatar: "MA", subject: "Chemistry", grade: "Grade 12", rating: 5, text: "My son got 94% in CBSE Chemistry. Dr. Vikram is exceptional.", verified: true },
  { name: "Emily Chen", country: "🇦🇺 Australia", avatar: "EC", subject: "Biology", grade: "Grade 11", rating: 5, text: "My daughter scored an A* in IB Biology. Quality of tutors here is on another level.", verified: true },
  { name: "David Williams", country: "🇨🇦 Canada", avatar: "DW", subject: "Computer Science", grade: "Grade 10", rating: 5, text: "My son went from zero to building his own web app in 6 months. Amazing!", verified: true },
  { name: "Fatima Al-Hassan", country: "🇸🇦 Saudi Arabia", avatar: "FA", subject: "Mathematics", grade: "Grade 9", rating: 5, text: "Best online tutoring platform. Very professional and structured sessions.", verified: true },
  { name: "Sophie Laurent", country: "🇫🇷 France", avatar: "SL", subject: "English", grade: "Grade 7", rating: 5, text: "The free demo was the clincher. My child loves Ananya's lessons!", verified: true },
  { name: "Ravi Kumar", country: "🇳🇿 New Zealand", avatar: "RK", subject: "Physics", grade: "Grade 12", rating: 5, text: "Excellent platform. My son prepared for A-Levels with Rahul Verma — got 4 A*s!", verified: true },
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="gradient-bg py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block">Reviews</span>
          <h1 className="text-5xl font-bold mb-4">What parents say about us</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} size={22} fill="gold" stroke="gold" />)}</div>
            <span className="text-2xl font-bold">4.9/5</span>
            <span className="text-white/60">from 2,400+ reviews</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "5 Star Reviews", value: "94%" },
            { label: "Would Recommend", value: "98%" },
            { label: "Tutors Praised", value: "99%" },
            { label: "Repeat Bookings", value: "87%" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-card border border-gray-100">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 card-hover">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill="gold" stroke="gold" />)}
                {r.verified && <span className="ml-2 text-xs text-green-600 font-medium">✓ Verified</span>}
              </div>
              <Quote size={24} className="text-brand-purple/20 mb-3" />
              <p className="text-gray-600 text-sm leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {r.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.country} · {r.subject} · {r.grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

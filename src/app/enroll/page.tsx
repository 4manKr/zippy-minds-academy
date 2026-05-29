"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle, Phone, MessageSquare, IndianRupee, DollarSign,
  Sparkles, BookOpen, ArrowRight, Star, CreditCard, HelpCircle,
} from "lucide-react";
import { usePricingVisibility } from "@/hooks/usePricingVisibility";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const INCLUDES = [
  "Live 1-on-1 sessions with your assigned tutor",
  "Personalised learning plan for your child",
  "Session recordings shared after every class",
  "Progress reports every month",
  "WhatsApp support from your tutor",
  "Free rescheduling with 24 h notice",
];

const SUBJECT_ICONS: Record<string, string> = {
  "Phonics":                 "🔤",
  "English Grammar":         "📝",
  "Mathematics":             "🔢",
  "Public Speaking":         "🎤",
  "Writing & Communication": "✍️",
  "Coding":                  "💻",
  "Science":                 "🔬",
  "Life Skills":             "🌱",
  "Hindi":                   "🇮🇳",
  "General Knowledge":       "🌍",
  "Creative Arts":           "🎨",
  "Social Studies":          "📚",
};

const SUBJECT_COLORS: Record<string, string> = {
  "Phonics":                 "from-pink-400 to-rose-500",
  "English Grammar":         "from-blue-400 to-blue-600",
  "Mathematics":             "from-purple-400 to-purple-600",
  "Public Speaking":         "from-orange-400 to-yellow-500",
  "Writing & Communication": "from-teal-400 to-cyan-500",
  "Coding":                  "from-indigo-400 to-blue-600",
  "Science":                 "from-green-400 to-emerald-500",
  "Life Skills":             "from-yellow-400 to-orange-400",
  "Hindi":                   "from-red-400 to-orange-500",
  "General Knowledge":       "from-cyan-400 to-teal-500",
  "Creative Arts":           "from-fuchsia-400 to-pink-500",
  "Social Studies":          "from-amber-400 to-orange-400",
};

interface Course {
  id:              string;
  name:            string;
  description:     string;
  price:           number;
  priceUSD:        number;
  status:          string;
  durationValue?:  number;
  durationUnit?:   string;
  sessionsPerWeek?: number;
  subject?:        { id: string; name: string };
}

/** Human-readable schedule label derived from sessionsPerWeek */
function scheduleLabel(spw: number): string {
  if (spw >= 7) return "Daily (7 days/week)";
  if (spw >= 6) return "6 days/week (Mon–Sat)";
  if (spw >= 5) return "Mon–Fri (5 days/week)";
  if (spw === 4) return "4 days/week";
  if (spw === 3) return "3 days/week (Mon, Wed, Fri)";
  if (spw === 2) return "2 days/week";
  return "1 day/week";
}

function EnrollInner() {
  const searchParams = useSearchParams();
  const preSubject   = searchParams.get("subject") ?? "";

  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isIndia, setIsIndia]   = useState<boolean | null>(null);
  const { showPricing }         = usePricingVisibility();
  const { whatsappNumber, contactEmail } = useSiteSettings();

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then(r => r.ok ? r.json() : null),
      fetch("/api/geo").then(r => r.ok ? r.json() : null),
    ]).then(([courseData, geoData]) => {
      if (courseData?.courses) setCourses(courseData.courses);
      setIsIndia(geoData?.isIndia ?? true);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Match by subject.name OR course.name so admin-uploaded courses
  // always appear regardless of how they were named.
  const sorted = preSubject
    ? courses.filter(c =>
        c.subject?.name === preSubject ||
        c.name === preSubject
      )
    : courses;

  const waMsg = (courseName: string) =>
    encodeURIComponent(`Hi! I'd like to enroll in ${courseName} at Zippy Minds Academy. Please share payment details.`);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          {preSubject ? (
            <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 text-sm font-semibold text-green-700 mb-4">
              <CheckCircle size={15} /> Free demo completed — time to enroll!
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-semibold text-primary mb-4">
              <Sparkles size={15} /> Choose your learning plan
            </div>
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">
            {preSubject ? `Enroll in ${preSubject}` : "All Courses & Plans"}
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-xl mx-auto">
            {preSubject
              ? "Pick a slot and subscribe to start your regular sessions with your assigned tutor."
              : "Choose any subject and enroll today. All sessions are live 1-on-1 with an expert tutor."}
          </p>
        </div>

        {/* ── What's Included strip ── */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl px-6 py-4 mb-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {INCLUDES.map(item => (
            <div key={item} className="flex items-start gap-2 text-sm text-on-surface">
              <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* ── Courses grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant h-64 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-semibold">No courses available right now.</p>
            <Link href="/courses" className="text-primary text-sm hover:underline mt-2 inline-block">Browse courses page</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map(course => {
              const subjectName = course.subject?.name ?? course.name;
              const isFeatured  = course.subject?.name === preSubject || course.name === preSubject;
              const icon        = SUBJECT_ICONS[subjectName] ?? SUBJECT_ICONS[course.name] ?? "📚";
              const gradient    = SUBJECT_COLORS[subjectName] ?? SUBJECT_COLORS[course.name] ?? "from-blue-400 to-indigo-600";
              const spw         = course.sessionsPerWeek ?? 5;
              const waLink      = `https://wa.me/${whatsappNumber}?text=${waMsg(course.name)}`;

              // Build subscribe URL with sessionsPerWeek so the slot page
              // can pre-select the correct number of days
              const subscribeHref = `/enroll/subscribe?course=${encodeURIComponent(course.name)}&courseId=${course.id}&price=${course.price}&priceUSD=${course.priceUSD ?? 15}&dv=${course.durationValue ?? 1}&du=${course.durationUnit ?? "months"}&spw=${spw}`;

              return (
                <div key={course.id}
                  className={`relative bg-surface-container-lowest rounded-3xl border-2 shadow-card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
                    isFeatured ? "border-primary ring-2 ring-primary/20" : "border-outline-variant"
                  }`}
                >
                  {/* Featured badge */}
                  {isFeatured && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 bg-primary text-on-primary text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        <Star size={9} fill="currentColor" /> Your Demo
                      </span>
                    </div>
                  )}

                  {/* Coloured header */}
                  <div className={`bg-gradient-to-br ${gradient} px-6 pt-6 pb-4`}>
                    <span className="text-4xl block mb-2">{icon}</span>
                    <h3 className="font-display font-extrabold text-white text-xl leading-tight">{course.name}</h3>
                    {course.description && (
                      <p className="text-white/80 text-xs mt-1 leading-relaxed line-clamp-2">{course.description}</p>
                    )}
                  </div>

                  {/* Price + CTA */}
                  <div className="p-5 flex flex-col flex-1">
                    {showPricing ? (
                      <>
                        <div className="flex items-end gap-1 mb-1">
                          {isIndia !== false
                            ? <IndianRupee size={20} className="text-primary mb-0.5" />
                            : <DollarSign  size={20} className="text-primary mb-0.5" />
                          }
                          <span className="font-display text-3xl font-extrabold text-primary">
                            {isIndia !== false ? course.price : (course.priceUSD ?? 15)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                          <BookOpen size={11} />
                          {course.durationValue ?? 1} {course.durationUnit ?? "months"} · {scheduleLabel(spw)}
                        </p>
                        {isIndia === false && (
                          <p className="text-[10px] text-on-surface-variant/60 mb-3">USD · International pricing</p>
                        )}
                        {isIndia === true && (
                          <p className="text-[10px] text-on-surface-variant/60 mb-3">INR · India pricing</p>
                        )}
                        {isIndia === null && <div className="h-3 mb-3" />}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <HelpCircle size={16} className="text-on-surface-variant" />
                          <span className="text-sm font-semibold text-on-surface-variant">Contact for pricing</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                          <BookOpen size={11} />
                          {course.durationValue ?? 1} {course.durationUnit ?? "months"} · {scheduleLabel(spw)}
                        </p>
                      </>
                    )}

                    <div className="mt-auto space-y-2">
                      <Link href={subscribeHref}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 bg-primary">
                        <CreditCard size={16} />
                        Pick Slot &amp; Subscribe
                      </Link>
                      <a href={waLink} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 border border-outline-variant text-on-surface-variant hover:text-on-surface">
                        <MessageSquare size={15} />
                        Enroll via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Other contact options ── */}
        <div className="mt-10 bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <p className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> Other ways to enroll
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href={`tel:${contactEmail.replace(/\s/g,"")}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-all text-sm font-medium text-on-surface">
              <Phone size={16} className="text-primary shrink-0" />
              Call us
            </a>
            <a href={`mailto:${contactEmail}?subject=Enrollment${preSubject ? ` — ${preSubject}` : ""}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-all text-sm font-medium text-on-surface">
              <MessageSquare size={16} className="text-primary shrink-0" />
              Email us
            </a>
          </div>
        </div>

        {/* ── Back to dashboard ── */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <Link href="/dashboard/parent"
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
          <Link href="/courses"
            className="flex items-center gap-1.5 text-primary hover:underline font-semibold">
            Browse Courses <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <EnrollInner />
    </Suspense>
  );
}

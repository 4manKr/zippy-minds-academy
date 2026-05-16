import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="relative overflow-hidden rounded-[48px] bg-primary px-12 py-16 md:px-20 md:py-20 text-center">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-secondary-container/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-on-primary mb-6 leading-tight">
              Ready to Shape Your Child&apos;s Future?
            </h2>
            <p className="text-on-primary/80 text-lg mb-10 leading-relaxed">
              Join thousands of parents who have chosen Zippy Minds Academy
              for a smarter, more confident tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-fixed font-extrabold px-10 py-5 rounded-2xl squishy-hover shadow-xl text-base"
              >
                <Calendar size={20} />
                Enroll Your Kid Today
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-on-primary font-bold px-10 py-5 rounded-2xl hover:bg-white/20 transition-all text-base"
              >
                Explore Courses <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-on-primary/50 text-sm mt-8">
              No credit card required · Cancel anytime · 98% satisfaction rate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

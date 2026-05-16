import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 md:p-16 text-center">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 text-white text-sm font-medium">
              <Sparkles size={14} className="text-brand-cyan" />
              Limited Free Demo Slots Available
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Learn Smart.{" "}
              <span className="text-yellow-300">Speak Confident.</span>{" "}
              <span className="text-teal-300">Shape Tomorrow.</span>
            </h2>

            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Join 10,000+ families worldwide who&apos;ve transformed their children&apos;s
              learning with Zippy Minds Academy — Phonics, English, Maths, Coding & more. Start with a free demo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-demo"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue font-bold px-10 py-4 rounded-2xl hover:bg-brand-cyan hover:text-white transition-all duration-300 hover:shadow-glow hover:-translate-y-1 text-base"
              >
                <Calendar size={20} />
                Book Free Demo Now
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300 text-base"
              >
                Explore Courses <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-white/50 text-sm mt-8">
              No credit card required · Cancel anytime · 98% satisfaction rate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6 animate-bounce">🔍</div>
        <h1 className="font-display text-6xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-3">
          Oops! Page not found
        </h2>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-all">
            🏠 Go Home
          </Link>
          <Link href="/courses"
            className="flex items-center justify-center gap-2 bg-surface-container border border-outline-variant text-on-surface font-semibold px-6 py-3 rounded-2xl hover:bg-surface-container-high transition-all">
            📚 Browse Courses
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-on-surface-variant">
          <Link href="/book-demo" className="hover:text-primary transition-colors">Book Free Demo</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
          <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Successful" };

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card-hover p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🎉</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Payment Successful!</h1>
        <p className="text-on-surface-variant mb-6 text-sm leading-relaxed">
          Your subscription is now active. Your tutor will be in touch shortly to schedule your first session.
        </p>
        <div className="space-y-3">
          <Link href="/dashboard/parent"
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all">
            Go to Dashboard →
          </Link>
          <Link href="/courses"
            className="block w-full text-center text-sm text-on-surface-variant hover:text-primary transition-colors py-2">
            Browse more courses
          </Link>
        </div>
      </div>
    </div>
  );
}

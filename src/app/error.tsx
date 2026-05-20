"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-20">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">⚡</div>
        <h1 className="font-display text-4xl font-extrabold text-on-surface mb-3">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
          Please try again or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-all"
          >
            🔄 Try Again
          </button>
          <Link href="/"
            className="flex items-center justify-center gap-2 bg-surface-container border border-outline-variant text-on-surface font-semibold px-6 py-3 rounded-2xl hover:bg-surface-container-high transition-all">
            🏠 Go Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-on-surface-variant/50 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

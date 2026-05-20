"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function SearchParamsReader() {
  const params = useSearchParams();
  const action = params.get("action");

  if (action === "approve") {
    return (
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Thank You!</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          You have <strong className="text-green-700">approved</strong> the availability change.
          The admin will be notified and will apply the change once all parents have responded.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm text-green-800 font-semibold">What happens next?</p>
          <p className="text-sm text-green-700 mt-1">
            Once all affected parents approve, the admin will apply the new schedule. You will receive a
            confirmation email when the change is live.
          </p>
        </div>
        <Link
          href="https://wa.me/919311483555"
          target="_blank"
          className="inline-block bg-green-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-700 transition-colors"
        >
          Contact Us on WhatsApp
        </Link>
      </div>
    );
  }

  if (action === "reject") {
    return (
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Response Recorded</h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          You have <strong className="text-red-700">rejected</strong> the availability change.
          The admin has been notified and the change will not be applied.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm text-amber-800 font-semibold">Have concerns?</p>
          <p className="text-sm text-amber-700 mt-1">
            Please reach out to us if the proposed schedule causes issues for your child&apos;s sessions.
            We are happy to work something out.
          </p>
        </div>
        <Link
          href="https://wa.me/919311483555"
          target="_blank"
          className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-700 transition-colors"
        >
          Contact Us on WhatsApp
        </Link>
      </div>
    );
  }

  // Invalid / unknown
  return (
    <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Invalid Link</h1>
      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        This link is invalid or has already been used. If you believe this is an error, please contact us.
      </p>
      <Link
        href="https://wa.me/919311483555"
        target="_blank"
        className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors"
      >
        Contact Us on WhatsApp
      </Link>
    </div>
  );
}

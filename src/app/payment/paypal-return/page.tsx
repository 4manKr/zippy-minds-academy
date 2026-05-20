"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PayPalReturnInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const token      = searchParams.get("token");      // PayPal order ID
  const courseName = searchParams.get("courseName") ?? "your course";

  const [status, setStatus] = useState<"capturing" | "success" | "error">("capturing");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrMsg("No PayPal order token found."); return; }

    fetch("/api/payment/paypal-capture", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderId: token }),
    })
      .then(r => r.json())
      .then((data: { success?: boolean; error?: string }) => {
        if (data.success) {
          // Redirect to shared success page
          router.replace("/payment/success");
        } else {
          setStatus("error");
          setErrMsg(data.error ?? "Payment could not be confirmed.");
        }
      })
      .catch(() => { setStatus("error"); setErrMsg("Network error. Please contact support."); });
  }, [token, router]);

  if (status === "capturing") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-20">
        <div className="max-w-sm w-full text-center bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card-hover p-10">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">Confirming Payment…</h2>
          <p className="text-sm text-on-surface-variant">
            Please wait while we confirm your PayPal payment for <strong>{courseName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 pt-20">
        <div className="max-w-sm w-full text-center bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-card-hover p-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">Payment Failed</h2>
          <p className="text-sm text-on-surface-variant mb-6">{errMsg}</p>
          <div className="space-y-3">
            <Link href="/enroll"
              className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all">
              Try Again
            </Link>
            <a href="https://wa.me/919311483555"
              className="block w-full text-center text-sm text-on-surface-variant hover:text-primary transition-colors py-2">
              Contact Support on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PayPalReturnInner />
    </Suspense>
  );
}

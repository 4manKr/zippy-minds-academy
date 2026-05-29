import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — no site can embed yours in an iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers guessing MIME types (drive-by download attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Force HTTPS for 2 years; include subdomains
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop leaking the full URL as referrer to third-party sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused powerful browser features
  // NOTE: payment=(self) allows Razorpay / Stripe Payment Request API — do NOT use payment=() as that blocks payment popups
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Basic XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Content Security Policy — restricts what scripts/styles/iframes can load
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Google Tag Manager + PayPal + Razorpay
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.paypal.com https://checkout.razorpay.com https://api.razorpay.com",
      // Styles: self + inline (Tailwind/CSS-in-JS needs this)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + external image hosts used by the app
      "img-src 'self' data: blob: https://images.unsplash.com https://randomuser.me https://ui-avatars.com https://zippymindsacademy.com https://www.zippymindsacademy.com https://res.cloudinary.com",
      // Connect (API fetch, WebSocket, analytics)
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google-analytics.com https://www.googletagmanager.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://zippy-minds-zippy-minds.aws-ap-south-1.turso.io",
      // Frames: PayPal and Razorpay need their own iframes
      "frame-src https://www.paypal.com https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com https://www.googletagmanager.com",
      // Form submissions only to self
      "form-action 'self'",
      // Upgrade insecure requests on the fly
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

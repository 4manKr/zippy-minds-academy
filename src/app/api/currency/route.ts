import { NextResponse } from "next/server";

// Hardcoded fallback rates (INR base) — updated periodically
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0096,
  EUR: 0.011,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.019,
  CAD: 0.016,
  MYR: 0.057,
  SAR: 0.045,
  NZD: 0.020,
};

// Cache rates for 1 hour to avoid hammering the API
let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Public endpoint — returns live INR conversion rates
export async function GET() {
  try {
    const now = Date.now();
    if (cachedRates && now - cacheTime < CACHE_TTL) {
      return NextResponse.json({ rates: cachedRates, source: "cache" });
    }

    // open.er-api.com is free, no API key needed, updates daily
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 3600 }, // Next.js cache 1 hour
    });

    if (res.ok) {
      const data = await res.json() as { rates: Record<string, number> };
      // Only keep the currencies we support
      const filtered: Record<string, number> = { INR: 1 };
      for (const code of Object.keys(FALLBACK_RATES)) {
        if (data.rates[code]) filtered[code] = data.rates[code];
      }
      cachedRates = filtered;
      cacheTime   = now;
      return NextResponse.json({ rates: filtered, source: "live" });
    }
  } catch {
    // Fall through to hardcoded fallback
  }

  return NextResponse.json({ rates: FALLBACK_RATES, source: "fallback" });
}

"use client";

import { useState, useEffect } from "react";

/**
 * Returns whether pricing should be shown on the public website.
 *
 * - `loading`  : true while the setting is being fetched
 * - `showPricing`: true = show prices, false = hide prices
 *
 * Defaults to showing prices on any fetch error (fail open).
 */
export function usePricingVisibility(): { showPricing: boolean; loading: boolean } {
  const [showPricing, setShowPricing] = useState(true);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/public-settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => setShowPricing(d?.showPricing !== "false"))
      .catch(() => setShowPricing(true))
      .finally(() => setLoading(false));
  }, []);

  return { showPricing, loading };
}

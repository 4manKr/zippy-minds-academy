"use client";

import { useState, useEffect } from "react";

// Returns true if the logged-in user already has a free demo booking.
// Falls back to false on any error (so the UI always shows something).
export function useHasDemo() {
  const [hasDemo, setHasDemo] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/bookings/status")
      .then(r => r.ok ? r.json() : { hasDemo: false })
      .then(d => setHasDemo(!!d.hasDemo))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  return { hasDemo, checked };
}

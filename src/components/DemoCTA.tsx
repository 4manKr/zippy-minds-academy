"use client";

import Link from "next/link";
import { useHasDemo } from "@/lib/useHasDemo";

interface Props {
  subject?: string;       // pre-selects subject on /enroll
  className?: string;
  children?: React.ReactNode; // override label
}

// Renders "Book Free Demo" for new users and "Enroll Now" for users
// who have already used their free demo.
export default function DemoCTA({ subject, className, children }: Props) {
  const { hasDemo, checked } = useHasDemo();

  const enrollHref = subject
    ? `/enroll?subject=${encodeURIComponent(subject)}`
    : "/enroll";

  if (!checked) {
    // Render placeholder while checking (avoids layout shift)
    return (
      <span className={className ?? "bg-secondary-container text-on-secondary-fixed font-bold text-sm px-5 py-2.5 rounded-full opacity-0"}>
        {children ?? "Book Free Demo"}
      </span>
    );
  }

  if (hasDemo) {
    return (
      <Link href={enrollHref} className={className ?? "bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-full shadow-sm squishy-hover"}>
        {children ?? "Enroll Now →"}
      </Link>
    );
  }

  return (
    <Link href={subject ? `/book-demo?subject=${encodeURIComponent(subject)}` : "/book-demo"}
      className={className ?? "bg-secondary-container text-on-secondary-fixed font-bold text-sm px-5 py-2.5 rounded-full shadow-sm squishy-hover ml-1"}>
      {children ?? "Book Free Demo"}
    </Link>
  );
}

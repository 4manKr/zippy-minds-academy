import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.zippymindsacademy.com";

// Static public pages with their priorities and change frequencies
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/",               priority: 1.0,  changeFrequency: "weekly"  },
  { path: "/courses",        priority: 0.9,  changeFrequency: "weekly"  },
  { path: "/tutors",         priority: 0.9,  changeFrequency: "weekly"  },
  { path: "/book-demo",      priority: 0.9,  changeFrequency: "monthly" },
  { path: "/enroll",         priority: 0.8,  changeFrequency: "monthly" },
  { path: "/about",          priority: 0.8,  changeFrequency: "monthly" },
  { path: "/reviews",        priority: 0.7,  changeFrequency: "weekly"  },
  { path: "/faq",            priority: 0.7,  changeFrequency: "monthly" },
  { path: "/contact",        priority: 0.7,  changeFrequency: "monthly" },
  { path: "/auth/login",     priority: 0.5,  changeFrequency: "yearly"  },
  { path: "/auth/signup",    priority: 0.5,  changeFrequency: "yearly"  },
  { path: "/privacy",        priority: 0.4,  changeFrequency: "yearly"  },
  { path: "/terms",          priority: 0.4,  changeFrequency: "yearly"  },
  { path: "/refund",         priority: 0.4,  changeFrequency: "yearly"  },
];

// Subject slugs used in enroll deep-links
const SUBJECTS = [
  "Phonics",
  "English Grammar",
  "Mathematics",
  "Public Speaking",
  "Coding",
  "Writing & Communication",
  "Science",
  "Life Skills",
  "Hindi",
  "General Knowledge",
  "Creative Arts",
  "Social Studies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // 2. Dynamic enroll deep-links — one per active subject from DB (fall back to static list)
  let subjectNames: string[] = SUBJECTS;
  try {
    const activeCourses = await prisma.course.findMany({
      where: { status: "active" },
      select: { name: true },
    });
    if (activeCourses.length > 0) {
      subjectNames = activeCourses.map((c) => c.name);
    }
  } catch {
    // Use static fallback list — no DB connection at build time
  }

  const enrollEntries: MetadataRoute.Sitemap = subjectNames.map((name) => ({
    url: `${BASE_URL}/enroll?subject=${encodeURIComponent(name)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...enrollEntries];
}

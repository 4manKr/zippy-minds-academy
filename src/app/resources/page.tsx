"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Download, FileText, FileImage, Presentation,
  Video, Music, Archive, File, Lock, Filter, X, Loader2,
  BookOpen, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FreeResource {
  id:          string;
  title:       string;
  description: string;
  fileType:    string;
  fileSize:    string;
  thumbnail:   string;
  category:    string;
  tags:        string; // JSON array
  downloads:   number;
  createdAt:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Worksheets", "Study Guides", "Presentations", "Videos", "Audio", "Templates", "Other"];

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function fileIcon(mimeType: string) {
  if (!mimeType) return <File size={22} />;
  if (mimeType.startsWith("image/"))       return <FileImage size={22} />;
  if (mimeType.startsWith("video/"))       return <Video size={22} />;
  if (mimeType.startsWith("audio/"))       return <Music size={22} />;
  if (mimeType === "application/pdf")      return <FileText size={22} />;
  if (mimeType.includes("presentation") ||
      mimeType.includes("powerpoint"))     return <Presentation size={22} />;
  if (mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("tar"))            return <Archive size={22} />;
  return <FileText size={22} />;
}

function fileIconBg(mimeType: string) {
  if (!mimeType) return "bg-gray-100 text-gray-500";
  if (mimeType.startsWith("image/"))       return "bg-pink-50 text-pink-500";
  if (mimeType.startsWith("video/"))       return "bg-purple-50 text-purple-500";
  if (mimeType.startsWith("audio/"))       return "bg-yellow-50 text-yellow-600";
  if (mimeType === "application/pdf")      return "bg-red-50 text-red-500";
  if (mimeType.includes("presentation") ||
      mimeType.includes("powerpoint"))     return "bg-orange-50 text-orange-500";
  if (mimeType.includes("zip") ||
      mimeType.includes("rar"))            return "bg-blue-50 text-blue-500";
  return "bg-indigo-50 text-indigo-500";
}

function fileLabel(mimeType: string) {
  if (!mimeType) return "File";
  if (mimeType === "application/pdf")         return "PDF";
  if (mimeType.startsWith("image/"))          return "Image";
  if (mimeType.startsWith("video/"))          return "Video";
  if (mimeType.startsWith("audio/"))          return "Audio";
  if (mimeType.includes("word") ||
      mimeType.includes("document"))          return "Word";
  if (mimeType.includes("presentation") ||
      mimeType.includes("powerpoint"))        return "PowerPoint";
  if (mimeType.includes("spreadsheet") ||
      mimeType.includes("excel"))             return "Excel";
  if (mimeType.includes("zip"))               return "ZIP";
  return "File";
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({
  resource,
  onDownload,
  downloading,
}: {
  resource: FreeResource;
  onDownload: (id: string) => void;
  downloading: boolean;
}) {
  const tags = parseTags(resource.tags);

  return (
    <div className="group bg-white rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail / file icon header */}
      <div className="relative h-40 bg-surface-container-low">
        {resource.thumbnail ? (
          <Image
            src={resource.thumbnail}
            alt={resource.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={cn("flex items-center justify-center h-full w-full", fileIconBg(resource.fileType))}>
            <div className="text-5xl opacity-70">{fileIcon(resource.fileType)}</div>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-on-surface px-2 py-0.5 rounded-full border border-outline-variant/50">
          {resource.category}
        </span>
        {/* File type badge */}
        <span className={cn(
          "absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
          fileIconBg(resource.fileType)
        )}>
          {fileLabel(resource.fileType)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-on-surface text-sm leading-snug line-clamp-2">{resource.title}</h3>
        {resource.description && (
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{resource.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-medium bg-secondary-container/30 text-on-surface-variant px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-auto pt-3 border-t border-outline-variant/30">
          <span className="flex items-center gap-1">
            <Download size={11} />
            {resource.downloads.toLocaleString()} downloads
          </span>
          {resource.fileSize && <span>{resource.fileSize}</span>}
        </div>
      </div>

      {/* Download button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onDownload(resource.id)}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
        >
          {downloading ? (
            <><Loader2 size={15} className="animate-spin" /> Downloading…</>
          ) : (
            <><Download size={15} /> Download</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Login Gate Modal ─────────────────────────────────────────────────────────
function LoginGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
          <X size={18} />
        </button>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-primary" />
        </div>
        <h2 className="font-display text-xl font-extrabold text-on-surface mb-2">Login to Download</h2>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
          Create a free account or log in to download this resource. It only takes 30 seconds!
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/login" onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 rounded-2xl hover:opacity-90 transition-all">
            Login to Download <ChevronRight size={16} />
          </Link>
          <Link href="/auth/signup" onClick={onClose}
            className="w-full flex items-center justify-center gap-2 border border-outline-variant text-on-surface font-semibold py-3 rounded-2xl hover:bg-surface-container transition-all text-sm">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [resources,    setResources]    = useState<FreeResource[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("All");
  const [showGate,     setShowGate]     = useState(false);
  const [downloading,  setDownloading]  = useState<string | null>(null);
  const [isLoggedIn,   setIsLoggedIn]   = useState<boolean | null>(null);

  // Check auth state
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setIsLoggedIn(!!(d.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetch resources
  useEffect(() => {
    setLoading(true);
    fetch("/api/free-resources")
      .then(r => r.json())
      .then(d => setResources(d.resources ?? []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter
  const filtered = resources.filter(r => {
    const matchesSearch = !search.trim() ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      parseTags(r.tags).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = category === "All" || r.category === category;
    return matchesSearch && matchesCat;
  });

  const handleDownload = useCallback(async (id: string) => {
    if (!isLoggedIn) { setShowGate(true); return; }
    setDownloading(id);
    try {
      const res = await fetch("/api/free-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Download failed"); return; }
      // Trigger browser download
      const a = document.createElement("a");
      a.href     = data.url;
      a.download = data.name || "resource";
      a.target   = "_blank";
      a.rel      = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Update local download count
      setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r));
    } finally {
      setDownloading(null);
    }
  }, [isLoggedIn]);

  return (
    <>
      {showGate && <LoginGateModal onClose={() => setShowGate(false)} />}

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary/5 via-surface to-secondary-container/10 pt-16 pb-12 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-5">
            <BookOpen size={15} /> Free Learning Resources
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Download Free Study Materials
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Worksheets, study guides, presentations and more — curated by our expert tutors.
            Browse freely, log in to download.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-outline-variant bg-white text-on-surface placeholder-on-surface-variant/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Filters ── */}
      <section className="sticky top-[72px] md:top-[84px] z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-on-surface-variant shrink-0 mr-1" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                category === cat
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-outline-variant overflow-hidden animate-pulse">
                  <div className="h-40 bg-surface-container-low" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-surface-container rounded w-3/4" />
                    <div className="h-3 bg-surface-container rounded w-full" />
                    <div className="h-3 bg-surface-container rounded w-2/3" />
                    <div className="h-9 bg-surface-container rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                {resources.length === 0 ? "No resources yet" : "No results found"}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {resources.length === 0
                  ? "Check back soon — our tutors are preparing great materials!"
                  : "Try a different search or category."}
              </p>
              {(search || category !== "All") && (
                <button
                  onClick={() => { setSearch(""); setCategory("All"); }}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">
                {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
                {category !== "All" && ` in "${category}"`}
                {search && ` for "${search}"`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onDownload={handleDownload}
                    downloading={downloading === resource.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Login CTA (for non-logged-in users) ── */}
      {isLoggedIn === false && (
        <section className="py-12 bg-primary/5 border-t border-outline-variant">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Lock size={32} className="text-primary mx-auto mb-3" />
            <h2 className="font-display text-2xl font-extrabold text-on-surface mb-2">Unlock All Downloads for Free</h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Create a free Zippy Minds account to download any resource instantly.
              Already a student? Just log in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition-all">
                Create Free Account <ChevronRight size={16} />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 border border-primary text-primary font-bold px-8 py-3 rounded-2xl hover:bg-primary/5 transition-all">
                Login
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

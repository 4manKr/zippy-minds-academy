"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Download, FileText, FileImage, Presentation,
  Video, Music, Archive, File, Lock, Filter, X, Loader2,
  BookOpen, ChevronRight, Eye,
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
  tags:        string;
  downloads:   number;
  createdAt:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Worksheets", "Study Guides", "Presentations", "Videos", "Audio", "Templates", "Other"];

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

/**
 * Decide how to "view" a file in the browser.
 *
 * Returns one of:
 *   { mode: "direct",  url }  — open the URL directly (image / video / audio)
 *   { mode: "gdocs",   url }  — wrap in Google Docs Viewer (PDF / Office)
 *   { mode: "none"         }  — no browser preview possible (ZIP, etc.)
 */
function viewStrategy(fileUrl: string, mimeType: string): { mode: "direct" | "gdocs" | "none"; url?: string } {
  if (!fileUrl) return { mode: "none" };

  // Native browser media — always renders inline regardless of hosting headers
  if (mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/")) {
    return { mode: "direct", url: fileUrl };
  }

  // Docs — Google Viewer handles PDF, Word, PPT, Excel etc.
  if (mimeType === "application/pdf"                                ||
      mimeType.includes("word")         || mimeType.includes("document")     ||
      mimeType.includes("presentation") || mimeType.includes("powerpoint")   ||
      mimeType.includes("spreadsheet")  || mimeType.includes("excel")        ||
      mimeType === "text/plain") {
    return {
      mode: "gdocs",
      url:  `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`,
    };
  }

  return { mode: "none" };
}

function fileIcon(mimeType: string) {
  if (!mimeType) return <File size={22} />;
  if (mimeType.startsWith("image/"))                                          return <FileImage size={22} />;
  if (mimeType.startsWith("video/"))                                          return <Video size={22} />;
  if (mimeType.startsWith("audio/"))                                          return <Music size={22} />;
  if (mimeType === "application/pdf")                                         return <FileText size={22} />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))  return <Presentation size={22} />;
  if (mimeType.includes("zip") || mimeType.includes("rar"))                  return <Archive size={22} />;
  return <FileText size={22} />;
}

function fileIconBg(mimeType: string) {
  if (!mimeType)                                                               return "bg-gray-100 text-gray-500";
  if (mimeType.startsWith("image/"))                                           return "bg-pink-50 text-pink-500";
  if (mimeType.startsWith("video/"))                                           return "bg-purple-50 text-purple-500";
  if (mimeType.startsWith("audio/"))                                           return "bg-yellow-50 text-yellow-600";
  if (mimeType === "application/pdf")                                          return "bg-red-50 text-red-500";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))   return "bg-orange-50 text-orange-500";
  if (mimeType.includes("zip") || mimeType.includes("rar"))                   return "bg-blue-50 text-blue-500";
  return "bg-indigo-50 text-indigo-500";
}

function fileLabel(mimeType: string) {
  if (!mimeType)                                                               return "File";
  if (mimeType === "application/pdf")                                          return "PDF";
  if (mimeType.startsWith("image/"))                                           return "Image";
  if (mimeType.startsWith("video/"))                                           return "Video";
  if (mimeType.startsWith("audio/"))                                           return "Audio";
  if (mimeType.includes("word") || mimeType.includes("document"))             return "Word";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))   return "PPT";
  if (mimeType.includes("spreadsheet")  || mimeType.includes("excel"))        return "Excel";
  if (mimeType.includes("zip"))                                                return "ZIP";
  return "File";
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({
  resource,
  onView,
  onDownload,
  viewing,
  downloading,
  isLoggedIn,
}: {
  resource:   FreeResource;
  onView:     (id: string) => void;
  onDownload: (id: string) => void;
  viewing:    boolean;
  downloading:boolean;
  isLoggedIn: boolean | null;
}) {
  const tags = parseTags(resource.tags);

  return (
    <div className="group bg-white rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-40 bg-surface-container-low">
        {resource.thumbnail ? (
          <Image src={resource.thumbnail} alt={resource.title} fill className="object-cover"
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" />
        ) : (
          <div className={cn("flex items-center justify-center h-full w-full", fileIconBg(resource.fileType))}>
            <div className="opacity-60 scale-150">{fileIcon(resource.fileType)}</div>
          </div>
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-on-surface px-2 py-0.5 rounded-full border border-outline-variant/50">
          {resource.category}
        </span>
        <span className={cn("absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", fileIconBg(resource.fileType))}>
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
              <span key={tag} className="text-[10px] font-medium bg-secondary-container/30 text-on-surface-variant px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-auto pt-3 border-t border-outline-variant/30">
          <span className="flex items-center gap-1"><Download size={11}/>{resource.downloads.toLocaleString()} downloads</span>
          {resource.fileSize && <span>{resource.fileSize}</span>}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {/* View — always available, no login */}
        <button
          onClick={() => onView(resource.id)}
          disabled={viewing}
          title="View file"
          className="flex items-center justify-center gap-1.5 border border-outline-variant text-on-surface-variant font-semibold text-sm py-2.5 px-3 rounded-xl hover:bg-surface-container hover:text-primary hover:border-primary transition-all disabled:opacity-60 shrink-0"
        >
          {viewing ? <Loader2 size={14} className="animate-spin"/> : <Eye size={14}/>}
          <span className="hidden sm:inline text-xs">View</span>
        </button>

        {/* Download — login required */}
        <button
          onClick={() => onDownload(resource.id)}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
        >
          {downloading ? (
            <><Loader2 size={15} className="animate-spin"/>Saving…</>
          ) : isLoggedIn ? (
            <><Download size={15}/>Download</>
          ) : (
            <><Lock size={14}/>Download</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── "No preview" notice modal ────────────────────────────────────────────────
function NoPreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"><X size={18}/></button>
        <div className="text-5xl mb-4">📦</div>
        <h2 className="font-bold text-on-surface mb-2">No Preview Available</h2>
        <p className="text-sm text-on-surface-variant mb-5">This file type cannot be previewed in the browser. Download it to open it on your device.</p>
        <button onClick={onClose} className="w-full py-2.5 rounded-2xl bg-primary text-on-primary font-semibold text-sm">Got it</button>
      </div>
    </div>
  );
}

// ─── Login gate modal ─────────────────────────────────────────────────────────
function LoginGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"><X size={18}/></button>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-primary"/>
        </div>
        <h2 className="font-display text-xl font-extrabold text-on-surface mb-2">Login to Download</h2>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
          Create a free account or log in to download this resource. It only takes 30 seconds!
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/login" onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold py-3 rounded-2xl hover:opacity-90 transition-all">
            Login to Download <ChevronRight size={16}/>
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
  const [noPreview,    setNoPreview]    = useState(false);
  const [downloading,  setDownloading]  = useState<string | null>(null);
  const [viewing,      setViewing]      = useState<string | null>(null);
  const [isLoggedIn,   setIsLoggedIn]   = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => setIsLoggedIn(!!(d.user)))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/free-resources")
      .then(r => r.json())
      .then(d => setResources(d.resources ?? []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      parseTags(r.tags).some(t => t.toLowerCase().includes(q));
    return matchesSearch && (category === "All" || r.category === category);
  });

  // ── VIEW ────────────────────────────────────────────────────────────────────
  const handleView = useCallback(async (id: string) => {
    setViewing(id);
    try {
      // GET single resource — public endpoint, returns fileUrl
      const res  = await fetch(`/api/free-resources?id=${id}`);
      const data = await res.json();
      const fileUrl  = data.resource?.fileUrl  as string | undefined;
      const fileType = data.resource?.fileType as string | undefined;

      if (!fileUrl) { setNoPreview(true); return; }

      const strategy = viewStrategy(fileUrl, fileType ?? "");

      if (strategy.mode === "none") {
        setNoPreview(true);
      } else {
        // Opens the direct URL or Google Docs Viewer in a new tab
        window.open(strategy.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      alert("Could not open file.");
    } finally {
      setViewing(null);
    }
  }, []);

  // ── DOWNLOAD (server-side proxy → proper filename, no CORS) ─────────────────
  const handleDownload = useCallback((id: string) => {
    if (!isLoggedIn) { setShowGate(true); return; }
    setDownloading(id);

    // Navigate to our proxy endpoint — browser will show Save-As with correct name
    // Using a hidden <a> click so the page doesn't navigate away
    const a = document.createElement("a");
    a.href   = `/api/free-resources/download?id=${id}`;
    a.target = "_blank";          // new tab — if auth fails, user sees error there
    a.rel    = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Optimistically update counter; server increments the real value
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r));

    // Re-enable button after a short delay
    setTimeout(() => setDownloading(null), 2000);
  }, [isLoggedIn]);

  return (
    <>
      {showGate  && <LoginGateModal onClose={() => setShowGate(false)} />}
      {noPreview && <NoPreviewModal onClose={() => setNoPreview(false)} />}

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary/5 via-surface to-secondary-container/10 pt-16 pb-12 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full mb-5">
            <BookOpen size={15}/> Free Learning Resources
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">
            Free Study Materials
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Worksheets, study guides, presentations and more — curated by our expert tutors.
            <br className="hidden sm:block"/>
            <span className="font-semibold text-primary">View freely</span> · Log in to download.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-outline-variant bg-white text-on-surface placeholder-on-surface-variant/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"/>
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                <X size={15}/>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Filters ── */}
      <section className="sticky top-[72px] md:top-[84px] z-30 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-on-surface-variant shrink-0 mr-1"/>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                category === cat
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary")}>
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
                  <div className="h-40 bg-surface-container-low"/>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-surface-container rounded w-3/4"/>
                    <div className="h-3 bg-surface-container rounded w-full"/>
                    <div className="h-3 bg-surface-container rounded w-2/3"/>
                    <div className="h-9 bg-surface-container rounded-xl mt-4"/>
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
                {resources.length === 0 ? "Check back soon — our tutors are preparing great materials!" : "Try a different search or category."}
              </p>
              {(search || category !== "All") && (
                <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-4 text-sm font-semibold text-primary hover:underline">
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
                    onView={handleView}
                    onDownload={handleDownload}
                    viewing={viewing === resource.id}
                    downloading={downloading === resource.id}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Login CTA (guests) ── */}
      {isLoggedIn === false && (
        <section className="py-12 bg-primary/5 border-t border-outline-variant">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Lock size={32} className="text-primary mx-auto mb-3"/>
            <h2 className="font-display text-2xl font-extrabold text-on-surface mb-2">Unlock All Downloads for Free</h2>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              Create a free Zippy Minds account to download any resource instantly. Already a student? Just log in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition-all">
                Create Free Account <ChevronRight size={16}/>
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

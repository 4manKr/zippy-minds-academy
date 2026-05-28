"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, User, Tag, ArrowRight, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  tags: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setPosts(d.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-primary pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 text-center text-on-primary pb-12">
          <span className="badge bg-white/10 border border-white/20 text-white mb-4 inline-block text-xs font-semibold uppercase tracking-wide">
            📝 Blog
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            Insights &amp; <span className="text-secondary-container">Ideas</span>
          </h1>
          <p className="text-on-primary/80 text-lg max-w-xl mx-auto">
            Tips, stories and learning guides for parents and young learners.
          </p>
        </div>
        <div className="h-8 bg-surface-container-low" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      {/* Search */}
      <div className="bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-11 w-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="font-display text-xl font-bold text-on-surface mb-2">
              {posts.length === 0 ? "No articles yet" : "No results found"}
            </h3>
            <p className="text-on-surface-variant">
              {posts.length === 0
                ? "Check back soon — articles are coming!"
                : "Try a different search term."}
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => {
              const tags: string[] = (() => { try { return JSON.parse(post.tags); } catch { return []; } })();
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-card border border-outline-variant flex flex-col hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={48} className="text-primary/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 3).map(t => (
                          <span key={t} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            <Tag size={9} /> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="font-display font-bold text-on-surface text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        {post.author && (
                          <span className="flex items-center gap-1"><User size={11}/> {post.author}</span>
                        )}
                        <span className="flex items-center gap-1"><Calendar size={11}/> {formatDate(post.createdAt)}</span>
                      </div>
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        Read <ArrowRight size={11}/>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

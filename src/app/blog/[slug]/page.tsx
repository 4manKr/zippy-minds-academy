"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  author: string;
  tags: string;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPostPage() {
  const { slug }                  = useParams<{ slug: string }>();
  const [post,    setPost]        = useState<BlogPost | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.post) setPost(d.post);
        else         setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center pt-24">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center pt-24 text-center px-4">
      <div className="text-6xl mb-4">📄</div>
      <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Article not found</h1>
      <p className="text-on-surface-variant mb-6">This article may have been removed or the link is incorrect.</p>
      <Link href="/blog" className="btn-primary inline-flex items-center gap-2"><ArrowLeft size={16}/> Back to Blog</Link>
    </div>
  );

  const tags: string[] = (() => { try { return JSON.parse(post.tags); } catch { return []; } })();

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16}/> Back to Blog
        </Link>

        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 shadow-card">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Tag size={10}/> {t}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant mb-8 pb-6 border-b border-outline-variant/40">
          {post.author && (
            <span className="flex items-center gap-1.5"><User size={14}/> {post.author}</span>
          )}
          <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(post.createdAt)}</span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-on-surface-variant leading-relaxed mb-8 italic border-l-4 border-primary/30 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose-blog text-on-surface leading-relaxed
            [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-on-surface [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-on-surface [&_h2]:mt-7 [&_h2]:mb-3
            [&_h3]:font-bold [&_h3]:text-xl [&_h3]:text-on-surface [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-base [&_p]:text-on-surface-variant [&_p]:leading-relaxed [&_p]:mb-4
            [&_strong]:font-bold [&_strong]:text-on-surface
            [&_em]:italic
            [&_u]:underline
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
            [&_li]:text-on-surface-variant [&_li]:text-base
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-on-surface-variant [&_blockquote]:my-4
            [&_img]:rounded-2xl [&_img]:w-full [&_img]:my-6 [&_img]:shadow-card
            [&_hr]:border-outline-variant [&_hr]:my-8
            [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </div>
    </div>
  );
}

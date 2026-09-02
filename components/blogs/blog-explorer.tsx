"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { PublicBlogSummary } from "@/lib/queries/blogs";

const categories = ["All", "Study Smart", "Entry Tests", "Exam Strategy", "Wellbeing"] as const;

export function BlogExplorer({ posts }: { posts: PublicBlogSummary[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesSearch = !search || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, posts, query]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col justify-between gap-7 border-b-2 border-black pb-8 lg:flex-row lg:items-end">
        <div><p className="font-headline text-xs font-bold uppercase tracking-[0.22em] text-brand">Explore the library</p><h2 className="mt-3 font-headline text-4xl font-bold uppercase tracking-tight md:text-5xl">Practical ideas, clearly explained.</h2></div>
        <label className="relative block w-full lg:max-w-sm"><span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2">search</span><span className="sr-only">Search articles</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search study advice..." className="w-full border-2 border-black bg-white py-4 pl-12 pr-4 font-medium outline-none transition-shadow placeholder:text-outline focus:shadow-hard-primary" /></label>
      </div>
      <div className="flex gap-2 overflow-x-auto py-7" aria-label="Blog categories">
        {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 border-2 border-black px-4 py-2 font-headline text-xs font-bold uppercase transition-all ${category === item ? "bg-black text-white shadow-hard-sm" : "bg-white hover:bg-brand-fixed"}`}>{item}</button>)}
      </div>
      {filtered.length ? (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, index) => <BlogCard key={post.slug} post={post} index={index} />)}
        </div>
      ) : (
        <div className="border-2 border-black bg-surface-high px-6 py-16 text-center"><span className="material-symbols-outlined text-5xl text-brand">search_off</span><h3 className="mt-4 font-headline text-2xl font-bold uppercase">No articles found</h3><p className="mt-2 text-on-surface-variant">Try another search or choose a different category.</p></div>
      )}
      <p className="mt-8 text-sm font-medium text-on-surface-variant">Showing {filtered.length} of {posts.length} articles</p>
    </section>
  );
}

function BlogCard({ post, index }: { post: PublicBlogSummary; index: number }) {
  const color = categoryColor(post.category);
  const icon = categoryIcon(post.category);
  const readTime = "5 min read";
  const date = new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(post.published_at ?? post.created_at));
  return (
    <article className="group flex h-full flex-col border-2 border-black bg-white shadow-hard transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#0058be]">
      <Link href={`/blogs/${post.slug}`} className={`relative flex h-52 items-center justify-center overflow-hidden border-b-2 border-black ${color}`} aria-label={`Read ${post.title}`}>
        {post.featured_image_url ? <Image src={post.featured_image_url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /> : <div className="landing-grid absolute inset-0 opacity-60" />}<span className="absolute left-4 top-4 border-2 border-black bg-white px-2 py-1 font-headline text-[10px] font-bold uppercase">Article / {String(index + 1).padStart(2, "0")}</span>{!post.featured_image_url && <span className="material-symbols-outlined relative text-7xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">{icon}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-6"><div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><span className="text-brand">{post.category}</span><span>{readTime}</span></div><h3 className="mt-5 font-headline text-2xl font-bold uppercase leading-tight"><Link href={`/blogs/${post.slug}`} className="hover:text-brand">{post.title}</Link></h3><p className="mt-3 flex-1 leading-relaxed text-on-surface-variant">{post.excerpt}</p><div className="mt-7 flex items-center justify-between border-t-2 border-black pt-4"><span className="text-xs font-semibold">{date}</span><Link href={`/blogs/${post.slug}`} className="flex items-center gap-1 font-headline text-xs font-bold uppercase text-brand">Read <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span></Link></div></div>
    </article>
  );
}

function categoryColor(category: string) { const key = category.toLowerCase(); if (key.includes("well")) return "bg-[#c8f4d4]"; if (key.includes("exam") || key.includes("test")) return "bg-[#ffe8a3]"; if (key.includes("strategy")) return "bg-[#e7dcff]"; return "bg-brand-fixed"; }
function categoryIcon(category: string) { const key = category.toLowerCase(); if (key.includes("well")) return "self_improvement"; if (key.includes("exam") || key.includes("test")) return "fact_check"; if (key.includes("strategy")) return "psychology"; return "menu_book"; }

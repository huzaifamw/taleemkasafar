import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const BLOGS_CACHE_TAG = "published-blogs";

export type PublicBlogSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  category: string;
  author: string;
};

export type PublicBlog = PublicBlogSummary & { content: string };
export type AdminBlog = PublicBlog & { status: string; author_id: string | null };

type BlogSummaryRow = {
  id: string; title: string; slug: string; excerpt: string | null;
  featured_image_url: string | null; published_at: string | null; created_at: string;
  updated_at: string; views_count: number;
  blog_post_tags: Array<{ blog_tags: { name: string } | null }>;
};

type BlogRow = BlogSummaryRow & { content: string };
type AdminBlogRow = BlogRow & { status: string; author_id: string | null };

function categoryOf(row: BlogSummaryRow) {
  return row.blog_post_tags[0]?.blog_tags?.name ?? "Study Smart";
}

function summaryOf(row: BlogSummaryRow): PublicBlogSummary {
  const { blog_post_tags: _tags, ...blog } = row;
  void _tags;
  return { ...blog, category: categoryOf(row), author: "Taleem Editorial" };
}

async function queryPublishedBlogs(): Promise<PublicBlogSummary[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("blogs").select("id,title,slug,excerpt,featured_image_url,published_at,created_at,updated_at,views_count,blog_post_tags(blog_tags(name))").eq("status", "published").order("published_at", { ascending: false });
  if (error) { console.error("Unable to load published blogs:", error.message); return []; }
  return ((data ?? []) as unknown as BlogSummaryRow[]).map(summaryOf);
}

export const getPublishedBlogs = unstable_cache(queryPublishedBlogs, ["published-blog-list"], {
  revalidate: 300,
  tags: [BLOGS_CACHE_TAG],
});

const getPublishedBlogPersistent = unstable_cache(async (slug: string): Promise<PublicBlog | null> => {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("blogs").select("id,title,slug,excerpt,content,featured_image_url,published_at,created_at,updated_at,views_count,blog_post_tags(blog_tags(name))").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as BlogRow;
  const { blog_post_tags: _tags, ...blog } = row;
  void _tags;
  return { ...blog, category: categoryOf(row), author: "Taleem Editorial" };
}, ["published-blog-by-slug"], { revalidate: 300, tags: [BLOGS_CACHE_TAG] });

// React cache deduplicates generateMetadata + page rendering in one request;
// unstable_cache above persists the result across requests and deployments.
export const getPublishedBlogBySlug = cache(getPublishedBlogPersistent);

export async function getAdminBlogs(): Promise<AdminBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blogs").select("*,blog_post_tags(blog_tags(name))").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as AdminBlogRow[]).map((row) => {
    const { blog_post_tags: _tags, ...blog } = row;
    void _tags;
    return { ...blog, category: categoryOf(row), author: "Taleem Editorial" };
  });
}

export async function getAdminBlog(id: string): Promise<AdminBlog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blogs").select("*,blog_post_tags(blog_tags(name))").eq("id", id).maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as AdminBlogRow;
  const { blog_post_tags: _tags, ...blog } = row;
  void _tags;
  return { ...blog, category: categoryOf(row), author: "Taleem Editorial" };
}

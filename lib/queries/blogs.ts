import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";

export type PublicBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  category: string;
  author: string;
};

export type AdminBlog = PublicBlog & { status: string; author_id: string | null };

type BlogRow = {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  featured_image_url: string | null; published_at: string | null; created_at: string;
  updated_at: string; views_count: number; status?: string; author_id?: string | null;
};

async function enrichBlogs(rows: BlogRow[], authenticated = false): Promise<PublicBlog[]> {
  if (!rows.length) return [];
  const client = authenticated ? await createClient() : createAnonClient();
  const ids = rows.map((row) => row.id);
  const { data: links } = await client.from("blog_post_tags").select("blog_id, tag_id").in("blog_id", ids);
  const tagIds = [...new Set((links ?? []).map((link) => link.tag_id))];
  const { data: tags } = tagIds.length ? await client.from("blog_tags").select("id, name").in("id", tagIds) : { data: [] };
  const tagMap = new Map((tags ?? []).map((tag) => [tag.id, tag.name]));
  const categoryMap = new Map<string, string>();
  for (const link of links ?? []) if (!categoryMap.has(link.blog_id)) categoryMap.set(link.blog_id, tagMap.get(link.tag_id) ?? "Study Smart");
  return rows.map((row) => ({ ...row, category: categoryMap.get(row.id) ?? "Study Smart", author: "Taleem Editorial" }));
}

export async function getPublishedBlogs(): Promise<PublicBlog[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("blogs").select("id,title,slug,excerpt,content,featured_image_url,published_at,created_at,updated_at,views_count").eq("status", "published").order("published_at", { ascending: false });
  if (error) { console.error("Unable to load published blogs:", error.message); return []; }
  return enrichBlogs(data ?? []);
}

export async function getPublishedBlogBySlug(slug: string): Promise<PublicBlog | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("blogs").select("id,title,slug,excerpt,content,featured_image_url,published_at,created_at,updated_at,views_count").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error || !data) return null;
  return (await enrichBlogs([data]))[0] ?? null;
}

export async function getAdminBlogs(): Promise<AdminBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blogs").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (await enrichBlogs(data ?? [], true)) as AdminBlog[];
}

export async function getAdminBlog(id: string): Promise<AdminBlog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return ((await enrichBlogs([data], true))[0] as AdminBlog) ?? null;
}

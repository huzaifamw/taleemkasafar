"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BlogActionState = { error: string | null };
const allowedStatuses = new Set(["draft", "published", "archived"]);

function value(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function validSlug(slug: string) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug); }

async function adminContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("admins").select("id").eq("user_id", user.id).eq("is_active", true).maybeSingle();
  return admin ? { supabase, adminId: admin.id } : null;
}

async function syncCategory(blogId: string, category: string, context: NonNullable<Awaited<ReturnType<typeof adminContext>>>) {
  const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data: tag, error } = await context.supabase.from("blog_tags").upsert({ name: category, slug }, { onConflict: "slug" }).select("id").single();
  if (error || !tag) throw new Error(error?.message ?? "Could not save category");
  await context.supabase.from("blog_post_tags").delete().eq("blog_id", blogId);
  const { error: linkError } = await context.supabase.from("blog_post_tags").insert({ blog_id: blogId, tag_id: tag.id });
  if (linkError) throw new Error(linkError.message);
}

type ParsedBlog =
  | { ok: false; error: string }
  | { ok: true; data: { title: string; slug: string; excerpt: string; content: string; featured_image_url: string | null; status: string; category: string } };

function parseBlog(form: FormData): ParsedBlog {
  const title = value(form, "title"); const slug = value(form, "slug").toLowerCase();
  const excerpt = value(form, "excerpt"); const content = value(form, "content");
  const featuredImage = value(form, "featured_image_url"); const status = value(form, "status");
  const category = value(form, "category");
  if (title.length < 5 || title.length > 160) return { ok: false, error: "Title must be between 5 and 160 characters." };
  if (!validSlug(slug) || slug.length > 180) return { ok: false, error: "Use a lowercase URL slug with words separated by hyphens." };
  if (excerpt.length < 20 || excerpt.length > 320) return { ok: false, error: "Excerpt must be between 20 and 320 characters." };
  if (content.length < 100) return { ok: false, error: "Article content must contain at least 100 characters." };
  if (!allowedStatuses.has(status)) return { ok: false, error: "Invalid publication status." };
  if (category.length < 2 || category.length > 50) return { ok: false, error: "Category must be between 2 and 50 characters." };
  if (featuredImage) { try { const url = new URL(featuredImage); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { return { ok: false, error: "Featured image must be a valid HTTP or HTTPS URL." }; } }
  return { ok: true, data: { title, slug, excerpt, content, featured_image_url: featuredImage || null, status, category } };
}

export async function createBlogAction(_previous: BlogActionState, form: FormData): Promise<BlogActionState> {
  const parsed = parseBlog(form); if (!parsed.ok) return { error: parsed.error };
  const context = await adminContext(); if (!context) return { error: "Admin access required." };
  const { category, ...payload } = parsed.data;
  const { data, error } = await context.supabase.from("blogs").insert({ ...payload, author_id: context.adminId, published_at: payload.status === "published" ? new Date().toISOString() : null }).select("id").single();
  if (error || !data) return { error: error?.code === "23505" ? "That URL slug is already in use." : error?.message ?? "Could not create article." };
  try { await syncCategory(data.id, category, context); } catch (syncError) { return { error: syncError instanceof Error ? syncError.message : "Article created, but category could not be saved." }; }
  revalidatePath("/blogs"); revalidatePath("/admin/blogs"); redirect("/admin/blogs");
}

export async function updateBlogAction(id: string, _previous: BlogActionState, form: FormData): Promise<BlogActionState> {
  const parsed = parseBlog(form); if (!parsed.ok) return { error: parsed.error };
  const context = await adminContext(); if (!context) return { error: "Admin access required." };
  const { category, ...payload } = parsed.data;
  const { data: current } = await context.supabase.from("blogs").select("published_at").eq("id", id).maybeSingle();
  const publishedAt = payload.status === "published" ? current?.published_at ?? new Date().toISOString() : null;
  const { error } = await context.supabase.from("blogs").update({ ...payload, published_at: publishedAt }).eq("id", id);
  if (error) return { error: error.code === "23505" ? "That URL slug is already in use." : error.message };
  try { await syncCategory(id, category, context); } catch (syncError) { return { error: syncError instanceof Error ? syncError.message : "Category could not be saved." }; }
  revalidatePath("/blogs"); revalidatePath(`/blogs/${payload.slug}`); revalidatePath("/admin/blogs"); redirect("/admin/blogs");
}

export async function deleteBlogAction(id: string): Promise<{ error?: string }> {
  const context = await adminContext(); if (!context) return { error: "Admin access required." };
  const { error } = await context.supabase.from("blogs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/blogs"); revalidatePath("/admin/blogs"); return {};
}

"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { AdminBlog } from "@/lib/queries/blogs";
import type { BlogActionState } from "@/app/admin/blogs/actions";

type Action = (state: BlogActionState, formData: FormData) => Promise<BlogActionState>;

export function BlogForm({ action, blog }: { action: Action; blog?: AdminBlog }) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [manualSlug, setManualSlug] = useState(Boolean(blog));
  const [content, setContent] = useState(blog?.content ?? "");
  const slugify = (text: string) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  useEffect(() => { if (!manualSlug) setSlug(slugify(title)); }, [manualSlug, title]);
  const input = "mt-2 w-full border-2 border-black bg-white px-4 py-3 font-body outline-none focus:border-brand focus:shadow-hard-primary";
  const label = "font-headline text-xs font-bold uppercase tracking-wider";
  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {state.error && <div className="border-2 border-danger bg-red-50 p-4 font-medium text-danger">{state.error}</div>}
        <div className="border-2 border-black bg-white p-5 shadow-hard md:p-7"><h2 className="font-headline text-xl font-bold uppercase">Article details</h2><div className="mt-6 space-y-5"><label className={label}>Title<input name="title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="How to build a revision plan that lasts" className={input} /></label><label className={label}>URL slug<input name="slug" required value={slug} onChange={(event) => { setManualSlug(true); setSlug(event.target.value); }} placeholder="build-a-revision-plan" className={input} /></label><label className={label}>Excerpt<textarea name="excerpt" required defaultValue={blog?.excerpt ?? ""} rows={3} maxLength={320} placeholder="A concise summary shown on article cards and search previews." className={`${input} resize-none`} /></label></div></div>
        <div className="border-2 border-black bg-white p-5 shadow-hard md:p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="font-headline text-xl font-bold uppercase">Article content</h2><p className="mt-1 text-sm text-on-surface-variant">Markdown supported: ## heading, - list item, &gt; quote, **bold**</p></div><span className="text-xs font-bold uppercase text-on-surface-variant">{content.trim().split(/\s+/).filter(Boolean).length} words</span></div><label className="sr-only" htmlFor="blog-content">Article content</label><textarea id="blog-content" name="content" required value={content} onChange={(event) => setContent(event.target.value)} rows={24} placeholder={`## Start with a clear heading\n\nWrite useful, original guidance here.\n\n- Add practical steps\n- Keep paragraphs readable\n\n> Use a callout for the key takeaway.`} className={`${input} resize-y font-mono text-sm leading-7`} /></div>
      </div>
      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <div className="border-2 border-black bg-brand-fixed p-5 shadow-hard"><h2 className="font-headline text-lg font-bold uppercase">Publishing</h2><div className="mt-5 space-y-5"><label className={label}>Status<select name="status" defaultValue={blog?.status ?? "draft"} className={input}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className={label}>Category<input name="category" required defaultValue={blog?.category ?? "Study Smart"} placeholder="Study Smart" className={input} /></label></div><button type="submit" disabled={pending} className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-black bg-black px-5 py-4 font-headline text-sm font-bold uppercase text-white shadow-hard-sm transition-all hover:bg-brand active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"><span className="material-symbols-outlined">{blog ? "save" : "add_circle"}</span>{pending ? "Saving…" : blog ? "Save changes" : "Create article"}</button><Link href="/admin/blogs" className="mt-3 block w-full border-2 border-black bg-white px-5 py-3 text-center font-headline text-xs font-bold uppercase">Cancel</Link></div>
        <div className="border-2 border-black bg-white p-5"><h2 className="font-headline text-lg font-bold uppercase">Featured image</h2><p className="mt-2 text-sm text-on-surface-variant">Optional external image URL. Leave empty to use the editorial pattern.</p><label className="sr-only" htmlFor="featured-image">Featured image URL</label><input id="featured-image" name="featured_image_url" type="url" defaultValue={blog?.featured_image_url ?? ""} placeholder="https://..." className={input} /></div>
        <div className="border-2 border-black bg-surface-high p-5 text-sm"><p className="font-headline font-bold uppercase">Publishing checklist</p><ul className="mt-3 space-y-2 text-on-surface-variant"><li>✓ Clear, specific headline</li><li>✓ Original educational advice</li><li>✓ Practical examples or steps</li><li>✓ Proofread before publishing</li></ul></div>
      </aside>
    </form>
  );
}

import Link from "next/link";
import { BlogForm } from "@/components/admin/blog-form";
import { createBlogAction } from "@/app/admin/blogs/actions";

export default function NewBlogPage() {
  return <div className="space-y-7 p-4 md:p-6 lg:p-8"><div><Link href="/admin/blogs" className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase text-on-surface-variant hover:text-brand"><span className="material-symbols-outlined text-lg">arrow_back</span>Back to blogs</Link><h1 className="mt-4 font-headline text-3xl font-bold uppercase md:text-4xl">Create article</h1><p className="mt-2 text-on-surface-variant">Write a useful, polished guide for students.</p></div><BlogForm action={createBlogAction} /></div>;
}

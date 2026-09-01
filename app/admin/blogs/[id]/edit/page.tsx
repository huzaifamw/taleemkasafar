import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogForm } from "@/components/admin/blog-form";
import { updateBlogAction } from "@/app/admin/blogs/actions";
import { getAdminBlog } from "@/lib/queries/blogs";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const blog = await getAdminBlog((await params).id); if (!blog) notFound();
  const action = updateBlogAction.bind(null, blog.id);
  return <div className="space-y-7 p-4 md:p-6 lg:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href="/admin/blogs" className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase text-on-surface-variant hover:text-brand"><span className="material-symbols-outlined text-lg">arrow_back</span>Back to blogs</Link><h1 className="mt-4 font-headline text-3xl font-bold uppercase md:text-4xl">Edit article</h1><p className="mt-2 text-on-surface-variant">Last updated {new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(blog.updated_at))}</p></div>{blog.status === "published" && <Link href={`/blogs/${blog.slug}`} target="_blank" className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-3 font-headline text-xs font-bold uppercase shadow-hard-sm"><span className="material-symbols-outlined text-lg">open_in_new</span>View live</Link>}</div><BlogForm action={action} blog={blog} /></div>;
}

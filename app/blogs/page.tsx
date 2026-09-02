import type { Metadata } from "next";
import Link from "next/link";
import { BlogExplorer } from "@/components/blogs/blog-explorer";
import { BlogFooter, BlogHeader } from "@/components/blogs/blog-header";
import { NewsletterForm } from "@/components/blogs/newsletter-form";
import { getPublishedBlogs } from "@/lib/queries/blogs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Study Desk | Taleem ka Safar",
  description: "Practical study advice, entry-test strategies, and student wellbeing guides from Taleem ka Safar.",
};

export default async function BlogsPage() {
  const blogPosts = await getPublishedBlogs();
  const featured = blogPosts[0];
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <BlogHeader />
      <section className="landing-grid border-b-2 border-black bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-12 max-w-4xl"><div className="inline-flex items-center gap-2 border-2 border-black bg-brand-fixed px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider"><span className="material-symbols-outlined text-base">auto_stories</span> The Study Desk</div><h1 className="mt-6 font-headline text-5xl font-bold uppercase leading-[0.92] tracking-[-0.05em] sm:text-6xl md:text-8xl">Ideas for studying<br /><span className="italic text-brand">with purpose.</span></h1><p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-on-surface-variant md:text-xl">Clear, practical guidance for entry-test preparation—from building daily focus to performing confidently when the clock starts.</p></div>
          {featured ? <article className="grid border-2 border-black bg-white shadow-[8px_8px_0_0_#000] lg:grid-cols-12">
            <div className="landing-grid relative flex min-h-72 items-center justify-center border-b-2 border-black bg-brand-fixed lg:col-span-5 lg:border-b-0 lg:border-r-2"><span className="absolute left-5 top-5 border-2 border-black bg-black px-3 py-2 font-headline text-[10px] font-bold uppercase tracking-wider text-white">Latest guide</span><span className="material-symbols-outlined text-8xl md:text-9xl">auto_stories</span></div>
            <div className="flex flex-col justify-center p-7 md:p-10 lg:col-span-7"><div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider"><span className="text-brand">{featured.category}</span><span>{new Intl.DateTimeFormat("en-PK", { dateStyle: "medium" }).format(new Date(featured.published_at ?? featured.created_at))}</span></div><h2 className="mt-5 font-headline text-3xl font-bold uppercase leading-tight md:text-5xl">{featured.title}</h2><p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">{featured.excerpt}</p><Link href={`/blogs/${featured.slug}`} className="mt-7 inline-flex w-fit items-center gap-3 border-2 border-black bg-black px-6 py-4 font-headline text-sm font-bold uppercase text-white shadow-hard-sm transition-all hover:bg-brand active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">Read the latest guide <span className="material-symbols-outlined">arrow_forward</span></Link></div>
          </article> : <div className="border-2 border-black bg-white p-10 text-center shadow-hard"><span className="material-symbols-outlined text-6xl text-brand">edit_note</span><h2 className="mt-4 font-headline text-2xl font-bold uppercase">Fresh guidance is being prepared</h2><p className="mt-2 text-on-surface-variant">Check back soon for practical entry-test advice.</p></div>}
        </div>
      </section>
      <BlogExplorer posts={blogPosts} />
      <section className="border-y-2 border-black bg-brand-fixed"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:px-8 lg:grid-cols-2 lg:items-center"><div><p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-brand">A useful email, not a noisy one</p><h2 className="mt-3 font-headline text-4xl font-bold uppercase leading-none md:text-5xl">One practical study idea each week.</h2><p className="mt-4 max-w-lg text-on-surface-variant">Short strategies you can apply in your very next study session.</p></div><NewsletterForm /></div></section>
      <BlogFooter />
    </main>
  );
}

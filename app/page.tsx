import Link from "next/link";
import { FeedbackForm } from "@/components/landing/feedback-form";
import { CountUpStats, FAQ, LiveActivity, LogoMarquee, ProductDemo } from "@/components/landing/live-components";
import { getPublishedBlogs } from "@/lib/queries/blogs";

const features = [
  { icon: "quiz", number: "01", title: "Chapter practice", text: "Build confidence one topic at a time with focused MCQs and instant results." },
  { icon: "timer", number: "02", title: "Real mock tests", text: "Rehearse under exam conditions with timed mocks designed for your entry test." },
  { icon: "psychology", number: "03", title: "AI study insights", text: "Turn every attempt into a clear plan with strengths, weak areas, and next steps." },
];

export default async function LandingPage() {
  const posts = (await getPublishedBlogs()).slice(0, 3);
  return (
    <main className="min-h-screen overflow-hidden bg-surface font-body text-on-surface">
      <header className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="leading-none">
            <span className="block font-headline text-xl font-bold tracking-tighter">Taleem ka Safar</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] opacity-50">Learn. Practice. Progress.</span>
          </Link>
          <nav className="hidden items-center gap-8 font-headline text-sm font-bold uppercase md:flex">
            <a href="#features" className="hover:text-brand">How it works</a>
            <a href="#stories" className="hover:text-brand">Stories</a>
            <Link href="/blogs" className="hover:text-brand">Study tips</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="px-3 py-3 font-headline text-xs font-bold uppercase hover:text-brand sm:px-4 sm:text-sm">Sign in</Link>
            <Link href="/auth/sign-up" className="border-2 border-black bg-brand px-4 py-3 font-headline text-xs font-bold uppercase text-white shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-5 sm:text-sm">Start free</Link>
          </div>
        </div>
      </header>

      <section className="landing-grid relative border-b-2 border-black bg-white">
        <div className="pointer-events-none absolute left-[38%] top-20 h-72 w-72 rounded-full bg-brand-fixed blur-3xl opacity-80" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:py-32">
          <div className="relative z-10 lg:col-span-7">
            <div className="mb-7"><LiveActivity /></div>
            <h1 className="font-headline text-5xl font-bold uppercase leading-[0.92] tracking-[-0.06em] sm:text-6xl md:text-8xl">
              Your test prep.<br /><span className="italic text-brand">Finally focused.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-relaxed text-on-surface-variant md:text-xl">
              A complete preparation workspace for Pakistan&apos;s university entry tests—chapter-wise practice, realistic mocks, and personal insights that turn effort into measurable progress.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/auth/sign-up" className="flex items-center gap-3 border-2 border-black bg-black px-7 py-5 font-headline text-lg font-bold uppercase text-white shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-brand hover:shadow-none">Begin your journey <span className="material-symbols-outlined">arrow_forward</span></Link>
              <a href="#features" className="border-2 border-black bg-white px-7 py-5 font-headline text-lg font-bold uppercase transition-colors hover:bg-surface-high">See how it works</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold">
              <span>✓ Free to start</span><span>✓ No credit card</span><span>✓ Built for mobile</span>
            </div>
          </div>

          <div className="relative lg:col-span-5"><ProductDemo /><div className="landing-float absolute -bottom-10 -left-5 hidden border-2 border-black bg-[#ffe8a3] px-4 py-3 shadow-hard md:block"><p className="font-headline text-2xl font-bold">+12%</p><p className="text-[10px] font-bold uppercase tracking-wider">Weekly accuracy</p></div></div>
        </div>
      </section>

      <LogoMarquee />

      <section className="mx-auto max-w-7xl px-5 pt-16 md:px-8"><CountUpStats /></section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-brand">A better way to prepare</p><h2 className="mt-3 max-w-3xl font-headline text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">Less guessing.<br />More progress.</h2></div>
          <p className="max-w-md font-medium text-on-surface-variant">One focused system takes you from your first practice question to your final exam-day rehearsal.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => <article key={feature.number} className="group border-2 border-black bg-white p-6 shadow-hard transition-transform hover:-translate-y-1"><div className="flex items-start justify-between"><span className="material-symbols-outlined text-5xl text-brand">{feature.icon}</span><span className="font-headline text-sm font-bold opacity-30">/{feature.number}</span></div><h3 className="mt-12 font-headline text-2xl font-bold uppercase">{feature.title}</h3><p className="mt-3 leading-relaxed text-on-surface-variant">{feature.text}</p></article>)}
        </div>
      </section>

      <section className="border-y-2 border-black bg-black text-white">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="border-b-2 border-white/30 p-8 md:p-14 lg:border-b-0 lg:border-r-2"><p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-[#9db9ff]">From attempt to action</p><h2 className="mt-5 font-headline text-4xl font-bold uppercase leading-none md:text-6xl">Know what to study next.</h2><p className="mt-6 max-w-lg text-lg leading-relaxed text-white/65">Every answer becomes useful data. See your performance by subject, chapter, difficulty, and time—then receive a focused next-step plan.</p><div className="mt-10 grid grid-cols-2 gap-3"><div className="border border-white/30 p-4"><p className="font-headline text-3xl font-bold text-[#9db9ff]">01</p><p className="mt-2 text-xs font-bold uppercase">Attempt a test</p></div><div className="border border-white/30 p-4"><p className="font-headline text-3xl font-bold text-[#9db9ff]">02</p><p className="mt-2 text-xs font-bold uppercase">Review patterns</p></div><div className="border border-white/30 p-4"><p className="font-headline text-3xl font-bold text-[#9db9ff]">03</p><p className="mt-2 text-xs font-bold uppercase">Follow your plan</p></div><div className="border border-white/30 p-4"><p className="font-headline text-3xl font-bold text-[#9db9ff]">04</p><p className="mt-2 text-xs font-bold uppercase">Measure growth</p></div></div></div>
          <div className="landing-grid bg-brand p-8 text-black md:p-14"><div className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#000]"><div className="flex items-center justify-between border-b-2 border-black pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-brand">AI performance brief</p><h3 className="font-headline text-2xl font-bold uppercase">Your focus this week</h3></div><span className="material-symbols-outlined text-4xl text-brand">auto_awesome</span></div><div className="mt-5 space-y-3"><div className="border-2 border-black bg-[#ffe8a3] p-4"><p className="text-[10px] font-bold uppercase opacity-60">Priority area</p><p className="mt-1 font-headline text-lg font-bold">Physics · Rotational Motion</p><p className="mt-2 text-sm">Accuracy drops on numerical questions. Review formulas, then complete a 15-question set.</p></div><div className="grid grid-cols-2 gap-3"><div className="border-2 border-black p-4"><span className="material-symbols-outlined text-[#169b45]">trending_up</span><p className="mt-2 font-headline font-bold">Strongest</p><p className="text-sm text-on-surface-variant">English vocabulary</p></div><div className="border-2 border-black p-4"><span className="material-symbols-outlined text-brand">schedule</span><p className="mt-2 font-headline font-bold">Suggested</p><p className="text-sm text-on-surface-variant">35 min practice</p></div></div><button className="w-full border-2 border-black bg-black py-4 font-headline text-sm font-bold uppercase text-white">Start recommended practice →</button></div></div></div>
        </div>
      </section>

      <section id="stories" className="border-y-2 border-black bg-brand text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5"><p className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-brand-fixed">Student feedback</p><h2 className="mt-4 font-headline text-4xl font-bold uppercase leading-none md:text-6xl">Made for the journey you&apos;re on.</h2><p className="mt-6 text-lg text-blue-100">Real preparation is difficult. The right tools make it feel possible.</p></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            <blockquote className="border-2 border-black bg-white p-6 text-black shadow-hard"><div className="mb-5 text-xl text-brand">★★★★★</div><p className="text-lg font-medium leading-relaxed">“The chapter practice showed me exactly where I was losing marks. My mock score improved in two weeks.”</p><footer className="mt-6 border-t-2 border-black pt-4 font-headline text-sm font-bold uppercase">Hira · Lahore</footer></blockquote>
            <blockquote className="border-2 border-black bg-brand-fixed p-6 text-black shadow-hard"><div className="mb-5 text-xl text-brand">★★★★★</div><p className="text-lg font-medium leading-relaxed">“It feels simple and direct. I open the dashboard, know what to study, and get started.”</p><footer className="mt-6 border-t-2 border-black pt-4 font-headline text-sm font-bold uppercase">Usman · Islamabad</footer></blockquote>
          </div>
        </div>
      </section>

      <section id="blogs" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between gap-6"><div><p className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-brand">From the study desk</p><h2 className="mt-3 font-headline text-4xl font-bold uppercase md:text-6xl">Tips that help.</h2></div><span className="hidden border-b-2 border-black pb-1 font-headline text-sm font-bold uppercase md:block">Fresh ideas weekly</span></div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, index) => <article key={post.title} className="group border-2 border-black bg-white shadow-hard"><Link href={`/blogs/${post.slug}`} className={`landing-grid flex h-48 items-center justify-center border-b-2 border-black ${index === 1 ? "bg-[#ffe8a3]" : index === 2 ? "bg-[#c8f4d4]" : "bg-brand-fixed"}`}><span className="material-symbols-outlined text-7xl transition-transform group-hover:scale-110">{index === 1 ? "fact_check" : index === 2 ? "self_improvement" : "menu_book"}</span></Link><div className="p-6"><div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"><span>{post.category}</span><span>5 min read</span></div><h3 className="mt-5 font-headline text-2xl font-bold uppercase leading-tight"><Link href={`/blogs/${post.slug}`} className="hover:text-brand">{post.title}</Link></h3><p className="mt-3 leading-relaxed text-on-surface-variant">{post.excerpt}</p><Link href={`/blogs/${post.slug}`} className="mt-6 inline-flex items-center gap-2 font-headline text-sm font-bold uppercase text-brand">Read article <span className="material-symbols-outlined text-lg">arrow_outward</span></Link></div></article>)}
        </div>
      </section>

      <section id="feedback" className="scroll-mt-24 border-y-2 border-black bg-surface-high">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-2 lg:items-center">
          <div><div className="inline-flex border-2 border-black bg-[#ffe8a3] px-3 py-2 font-headline text-xs font-bold uppercase">Your voice matters</div><h2 className="mt-6 font-headline text-4xl font-bold uppercase leading-none md:text-6xl">Help us build it better.</h2><p className="mt-6 max-w-lg text-lg font-medium leading-relaxed text-on-surface-variant">Found something confusing? Have a feature idea? Tell us. Taleem ka Safar should grow with the students who use it.</p></div>
          <FeedbackForm />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4"><p className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-brand">Questions, answered</p><h2 className="mt-4 font-headline text-4xl font-bold uppercase leading-none md:text-6xl">Before you begin.</h2><p className="mt-5 text-on-surface-variant">Everything you need to know about starting your preparation journey.</p></div>
        <div className="lg:col-span-8"><FAQ /></div>
      </section>

      <section className="bg-brand-fixed px-5 py-20 text-center md:px-8 md:py-28"><span className="material-symbols-outlined text-6xl text-brand">school</span><h2 className="mx-auto mt-5 max-w-4xl font-headline text-4xl font-bold uppercase leading-none tracking-tight md:text-7xl">Your next score starts today.</h2><p className="mx-auto mt-5 max-w-xl text-lg font-medium text-on-surface-variant">Join the students turning daily practice into real progress.</p><Link href="/auth/sign-up" className="mt-8 inline-flex items-center gap-3 border-2 border-black bg-black px-8 py-5 font-headline text-lg font-bold uppercase text-white shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-brand hover:shadow-none">Create free account <span className="material-symbols-outlined">arrow_forward</span></Link></section>

      <footer className="border-t-2 border-black bg-black text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8"><div><p className="font-headline text-xl font-bold">Taleem ka Safar</p><p className="mt-1 text-xs uppercase tracking-widest text-white/50">Every question takes you forward.</p></div><div className="flex flex-wrap gap-6 font-headline text-xs font-bold uppercase"><a href="#features">Platform</a><Link href="/blogs">Study tips</Link><a href="#stories">Feedback</a></div><p className="text-xs text-white/50">© 2026 Taleem ka Safar</p></div></footer>
    </main>
  );
}

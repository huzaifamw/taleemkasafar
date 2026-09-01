import Link from "next/link";

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="leading-none"><span className="block font-headline text-xl font-bold tracking-tighter">Taleem ka Safar</span><span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] opacity-50">The Study Desk</span></Link>
        <nav className="hidden items-center gap-7 font-headline text-sm font-bold uppercase md:flex"><Link href="/">Home</Link><Link href="/blogs" className="border-b-2 border-brand text-brand">Study tips</Link><Link href="/#features">Platform</Link></nav>
        <div className="flex items-center gap-2"><Link href="/auth/login" className="px-3 py-3 font-headline text-xs font-bold uppercase hover:text-brand">Sign in</Link><Link href="/auth/sign-up" className="border-2 border-black bg-brand px-4 py-3 font-headline text-xs font-bold uppercase text-white shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Start free</Link></div>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return <footer className="border-t-2 border-black bg-black text-white"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8"><div><p className="font-headline text-xl font-bold">Taleem ka Safar</p><p className="mt-1 text-xs uppercase tracking-widest text-white/50">Every question takes you forward.</p></div><div className="flex gap-6 font-headline text-xs font-bold uppercase"><Link href="/">Home</Link><Link href="/blogs">Study tips</Link><Link href="/auth/sign-up">Create account</Link></div><p className="text-xs text-white/50">© 2026 Taleem ka Safar</p></div></footer>;
}

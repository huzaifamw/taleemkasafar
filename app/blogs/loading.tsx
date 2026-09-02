export default function BlogsLoading() {
  return (
    <main className="min-h-screen bg-surface text-on-surface" aria-label="Loading articles" aria-busy="true">
      <div className="h-20 border-b-2 border-black bg-white" />
      <section className="landing-grid border-b-2 border-black bg-white">
        <div className="mx-auto max-w-7xl animate-pulse px-5 py-16 md:px-8 md:py-24">
          <div className="h-9 w-40 border-2 border-black bg-brand-fixed" />
          <div className="mt-7 h-14 max-w-3xl bg-surface-high md:h-20" />
          <div className="mt-3 h-14 max-w-2xl bg-surface-high md:h-20" />
          <div className="mt-7 h-6 max-w-xl bg-surface-high" />
          <div className="mt-12 grid min-h-80 border-2 border-black bg-white shadow-hard lg:grid-cols-12">
            <div className="landing-grid min-h-64 border-b-2 border-black bg-brand-fixed lg:col-span-5 lg:border-b-0 lg:border-r-2" />
            <div className="space-y-5 p-8 lg:col-span-7">
              <div className="h-4 w-40 bg-surface-high" />
              <div className="h-10 w-full bg-surface-high" />
              <div className="h-10 w-4/5 bg-surface-high" />
              <div className="h-5 w-full bg-surface-high" />
              <div className="h-12 w-52 border-2 border-black bg-black" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl animate-pulse px-5 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between border-b-2 border-black pb-8">
          <div className="space-y-3"><div className="h-3 w-32 bg-brand-fixed" /><div className="h-10 w-80 max-w-full bg-surface-high" /></div>
          <div className="hidden h-14 w-80 border-2 border-black bg-white lg:block" />
        </div>
        <div className="mt-7 flex gap-2">{[96, 128, 112, 136].map((width) => <div key={width} className="h-9 border-2 border-black bg-white" style={{ width }} />)}</div>
        <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="border-2 border-black bg-white shadow-hard"><div className="landing-grid h-52 border-b-2 border-black bg-brand-fixed" /><div className="space-y-4 p-6"><div className="h-3 w-28 bg-surface-high" /><div className="h-7 w-full bg-surface-high" /><div className="h-7 w-4/5 bg-surface-high" /><div className="h-4 w-full bg-surface-high" /><div className="h-4 w-3/4 bg-surface-high" /></div></div>)}
        </div>
      </section>
      <span className="sr-only">Loading study articles…</span>
    </main>
  );
}

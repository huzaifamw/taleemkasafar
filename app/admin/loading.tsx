export default function AdminLoading() {
  return (
    <div className="min-h-svh animate-pulse space-y-7 bg-surface p-4 md:p-6 lg:p-8" aria-label="Loading admin panel" aria-busy="true">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-brand-fixed" />
          <div className="h-10 w-52 bg-surface-high" />
          <div className="h-5 w-80 max-w-full bg-surface-high" />
        </div>
        <div className="h-12 w-36 border-2 border-black bg-brand shadow-hard-sm" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex min-h-32 items-center justify-between border-2 border-black bg-white p-5 shadow-hard-sm">
            <div className="space-y-3">
              <div className="h-3 w-24 bg-surface-high" />
              <div className="h-9 w-20 bg-surface-high" />
              <div className="h-3 w-28 bg-surface-high" />
            </div>
            <div className="h-12 w-12 border-2 border-black bg-brand-fixed" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="min-h-80 border-2 border-black bg-white p-6 shadow-hard lg:col-span-3">
          <div className="h-7 w-48 bg-surface-high" />
          <div className="mt-8 flex h-56 items-end gap-3 border-b-2 border-l-2 border-black px-4">
            {[42, 68, 51, 82, 61, 74, 56].map((height, index) => (
              <div key={`${height}-${index}`} className="flex-1 bg-brand-fixed" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="min-h-80 border-2 border-black bg-white shadow-hard lg:col-span-2">
          <div className="h-14 border-b-2 border-black bg-brand-fixed" />
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex h-16 items-center justify-between border-b-2 border-black px-5 last:border-b-0">
              <div className="space-y-2"><div className="h-3 w-32 bg-surface-high" /><div className="h-2 w-20 bg-surface-high" /></div>
              <div className="h-7 w-16 bg-surface-high" />
            </div>
          ))}
        </div>
      </section>
      <span className="sr-only">Loading administration tools…</span>
    </div>
  );
}

export default function AdminBlogsLoading() {
  return (
    <div className="animate-pulse space-y-7 p-4 md:p-6 lg:p-8" aria-label="Loading blog manager" aria-busy="true">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3"><div className="h-3 w-28 bg-brand-fixed" /><div className="h-10 w-44 bg-surface-high" /><div className="h-5 w-80 max-w-full bg-surface-high" /></div>
        <div className="h-14 w-40 border-2 border-black bg-brand shadow-hard-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="flex h-28 items-center justify-between border-2 border-black bg-white p-5 shadow-hard-sm"><div className="space-y-3"><div className="h-8 w-16 bg-surface-high" /><div className="h-3 w-24 bg-surface-high" /></div><div className="h-11 w-11 bg-brand-fixed" /></div>)}</div>
      <div className="overflow-hidden border-2 border-black bg-white shadow-hard">
        <div className="h-12 border-b-2 border-black bg-brand-fixed" />
        {[0, 1, 2, 3, 4].map((item) => <div key={item} className="grid min-h-20 grid-cols-[1fr_130px_150px_140px] items-center gap-5 border-b-2 border-black px-5 last:border-b-0"><div className="space-y-2"><div className="h-4 w-3/5 bg-surface-high" /><div className="h-3 w-2/5 bg-surface-high" /></div><div className="h-7 w-20 bg-surface-high" /><div className="h-4 w-24 bg-surface-high" /><div className="ml-auto h-9 w-28 bg-surface-high" /></div>)}
      </div>
      <span className="sr-only">Loading blog manager…</span>
    </div>
  );
}

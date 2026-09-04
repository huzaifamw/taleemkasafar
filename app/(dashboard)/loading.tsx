export default function DashboardLoading() {
  return (
    <div className="min-h-svh bg-surface" aria-label="Loading dashboard" aria-busy="true">
      <div className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b-2 border-black bg-white px-6 md:left-64 md:px-8">
        <div className="h-7 w-36 animate-pulse bg-surface-high" />
        <div className="hidden h-11 w-44 animate-pulse border-2 border-black bg-surface-low sm:block" />
        <div className="h-10 w-10 animate-pulse border-2 border-black bg-brand-fixed" />
      </div>

      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto max-w-7xl animate-pulse space-y-14">
          <section className="grid items-center gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
              <div className="h-8 w-40 border-2 border-black bg-brand-fixed" />
              <div className="h-14 w-full max-w-2xl bg-surface-high md:h-20" />
              <div className="h-14 w-4/5 max-w-xl bg-surface-high" />
              <div className="flex gap-4 pt-2">
                <div className="h-14 w-44 border-2 border-black bg-black shadow-hard" />
                <div className="h-14 w-40 border-2 border-black bg-white" />
              </div>
            </div>
            <div className="hidden lg:col-span-4 lg:block">
              <div className="aspect-square border-2 border-black bg-white shadow-hard-primary">
                <div className="landing-grid h-full bg-brand-fixed opacity-60" />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-7 flex items-center gap-4">
              <div className="h-10 w-52 bg-surface-high" />
              <div className="h-1 flex-1 bg-black" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="border-2 border-black bg-white p-6 shadow-hard-sm">
                  <div className="h-12 w-12 bg-brand-fixed" />
                  <div className="mt-8 h-7 w-3/5 bg-surface-high" />
                  <div className="mt-3 h-4 w-full bg-surface-high" />
                  <div className="mt-2 h-4 w-4/5 bg-surface-high" />
                  <div className="mt-6 h-10 w-full border-2 border-black bg-surface-low" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <span className="sr-only">Loading your learning workspace…</span>
    </div>
  );
}

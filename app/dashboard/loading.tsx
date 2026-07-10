export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.07),transparent_28%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-black/85 px-4 py-4 backdrop-blur-2xl lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="hidden lg:block">
            <div className="h-16 rounded-3xl border border-white/10 bg-white/[0.04]" />
            <div className="mt-4 h-24 rounded-3xl border border-teal-300/15 bg-teal-300/[0.055]" />
          </div>
          <div className="flex gap-2 lg:mt-8 lg:block lg:space-y-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-12 w-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] lg:w-full"
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="h-64 animate-pulse rounded-[2rem] border border-white/10 bg-zinc-950/75 shadow-2xl shadow-black/35" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-[1.5rem] border border-white/10 bg-zinc-950/75 shadow-2xl shadow-black/25"
              />
            ))}
          </div>
          <div className="mt-8 h-20 animate-pulse rounded-[1.5rem] border border-white/10 bg-zinc-950/75" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[1.5rem] border border-white/10 bg-zinc-950/75 shadow-2xl shadow-black/25"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

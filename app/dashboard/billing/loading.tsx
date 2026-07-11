export default function BillingLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-white/10 bg-zinc-950/80 p-5 lg:block">
          <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`billing-sidebar-skeleton-${index}`}
                className="h-11 animate-pulse rounded-2xl bg-white/[0.06]"
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
          <div className="rounded-[2.35rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/35">
            <div className="h-9 w-32 animate-pulse rounded-full bg-teal-300/10" />
            <div className="mt-6 h-14 max-w-3xl animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-4 h-5 max-w-2xl animate-pulse rounded-xl bg-white/[0.07]" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`billing-stat-skeleton-${index}`}
                className="h-36 animate-pulse rounded-[1.65rem] border border-white/10 bg-white/[0.045]"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="h-96 animate-pulse rounded-[1.85rem] border border-white/10 bg-white/[0.045]" />
            <div className="h-96 animate-pulse rounded-[1.85rem] border border-white/10 bg-white/[0.045]" />
          </div>
        </section>
      </div>
    </main>
  );
}

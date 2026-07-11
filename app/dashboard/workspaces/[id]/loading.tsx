export default function WorkspaceReportsLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden w-72 border-r border-white/10 bg-zinc-950/80 p-5 lg:block">
          <div className="h-10 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={`workspace-sidebar-skeleton-${index}`}
                className="h-11 animate-pulse rounded-2xl bg-white/[0.06]"
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
          <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/35 sm:p-8 lg:p-10">
            <div className="h-10 w-44 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-8 h-12 max-w-lg animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-4 h-5 max-w-2xl animate-pulse rounded-xl bg-white/[0.07]" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`workspace-stat-skeleton-${index}`}
                  className="h-28 animate-pulse rounded-2xl border border-white/10 bg-black/25"
                />
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
            <div className="h-12 animate-pulse rounded-[1.35rem] bg-black/35" />
            <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`workspace-report-skeleton-${index}`}
                  className="h-64 animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[0.04]"
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

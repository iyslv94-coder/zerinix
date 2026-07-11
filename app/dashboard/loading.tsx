function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-white/[0.055] ${className}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.055),transparent_28%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="flex border-b border-white/10 bg-black/85 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:min-h-screen lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:bg-black/70 lg:px-5 lg:py-6">
          <div className="hidden lg:block">
            <SkeletonBlock className="h-16 rounded-[1.65rem]" />
            <SkeletonBlock className="mt-4 h-24 rounded-[1.65rem]" />
          </div>
          <div className="flex flex-1 items-center gap-2 overflow-hidden lg:mt-8 lg:block lg:space-y-2">
            {["dashboard", "report", "chat", "workspace", "usage"].map((item) => (
              <SkeletonBlock
                key={item}
                className="h-14 w-32 shrink-0 rounded-[1.15rem] lg:w-full"
              />
            ))}
          </div>
          <SkeletonBlock className="ml-2 h-12 w-28 rounded-[1.15rem] lg:ml-0 lg:mt-6 lg:w-full" />
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
          <div className="rounded-[2.35rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-8 lg:p-10">
            <SkeletonBlock className="h-8 w-48 rounded-full" />
            <SkeletonBlock className="mt-6 h-16 max-w-2xl" />
            <SkeletonBlock className="mt-5 h-6 max-w-xl" />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
              <SkeletonBlock className="h-28" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {["workspaces", "reports", "requests", "cost", "activity"].map(
              (item) => (
                <SkeletonBlock key={item} className="h-44 rounded-[1.65rem]" />
              )
            )}
          </div>

          <div className="mt-8 grid gap-5 2xl:grid-cols-[1.05fr_0.95fr]">
            <SkeletonBlock className="h-96 rounded-[1.85rem]" />
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-1">
              <SkeletonBlock className="h-44 rounded-[1.85rem]" />
              <SkeletonBlock className="h-44 rounded-[1.85rem]" />
            </div>
          </div>

          <div className="mt-8">
            <SkeletonBlock className="h-20 rounded-[1.85rem]" />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {["one", "two", "three"].map((item) => (
                <SkeletonBlock key={item} className="h-72 rounded-[1.85rem]" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

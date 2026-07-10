import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  Clock3,
  FileText,
  Folder,
  Plus,
  Settings,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/server";
import DashboardSidebar from "./DashboardSidebar";
import WorkspaceManager from "./WorkspaceManager";
import { getAuthenticatedUser, loadUserWorkspaces } from "./report-utils";

export const dynamic = "force-dynamic";

function formatDashboardDate(value: string) {
  if (!value) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const { workspaces, error } = await loadUserWorkspaces(supabase, user);
  const totalReports = workspaces.reduce(
    (total, workspace) => total + workspace.reportCount,
    0
  );
  const activeWorkspaces = workspaces.filter(
    (workspace) => workspace.reportCount > 0
  ).length;
  const latestWorkspaceUpdate = workspaces
    .map((workspace) => workspace.updatedAt || workspace.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  const dashboardStats = [
    {
      label: "Workspaces",
      value: String(workspaces.length),
      detail: `${activeWorkspaces} active`,
      icon: Folder,
    },
    {
      label: "Reports",
      value: String(totalReports),
      detail: "Saved intelligence assets",
      icon: FileText,
    },
    {
      label: "System Status",
      value: error ? "Review" : "Ready",
      detail: error ? "Workspace sync needs attention" : "Workspace sync healthy",
      icon: Activity,
    },
    {
      label: "Latest Activity",
      value: formatDashboardDate(latestWorkspaceUpdate || ""),
      detail: latestWorkspaceUpdate ? "Last workspace update" : "Create your first report",
      icon: Clock3,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar />

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-teal-300/70">
                USER DASHBOARD
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Workspace Merkezi
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                ZERINIX raporlarını workspace&apos;lere ayır, ekipli düşün ve iş
                kararlarını düzenli bir rapor sistemi içinde yönet.
              </p>
            </div>

            <Link
              href="/plan"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Create New Report
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-zinc-950/75 p-5 shadow-2xl shadow-black/25"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="h-5 w-5 text-teal-200" />
                    </div>
                    <span className="rounded-full border border-teal-300/15 bg-teal-300/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-teal-100/80">
                      Live
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-zinc-500">
                    {stat.detail}
                  </p>
                </article>
              );
            })}
          </div>

          {error ? (
            <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-950/20 p-5 text-sm leading-6 text-amber-100">
              Supabase workspace verileri şu anda okunamadı: {error}
            </div>
          ) : null}

          <WorkspaceManager workspaces={workspaces} />

          <div
            id="settings"
            className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/60 p-5"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-teal-200" />
              <h2 className="text-lg font-semibold text-white">Settings</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Hesap ve çalışma alanı ayarları sonraki sürümde burada yönetilecek.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

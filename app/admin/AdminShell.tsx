import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { dashboardTheme } from "@/app/lib/ui/dashboard-theme";
import { requireAdminPage } from "./admin-data";
import { AdminGlobalSearch } from "./AdminGlobalSearch";
import { AdminNavigation } from "./AdminNavigation";

function formatRole(role: string) {
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export async function AdminShell({
  children,
  eyebrow,
  title,
  subtitle,
  hidePageHeader = false,
  headerActions,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  hidePageHeader?: boolean;
  headerActions?: ReactNode;
}) {
  const admin = await requireAdminPage();
  const email = admin.user.email || "Admin user";
  const role = formatRole(admin.role);
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <main className={dashboardTheme.page}>
      <div className={dashboardTheme.atmosphere} />
      <div className={dashboardTheme.grid} />
      <div className="relative z-10 flex min-h-screen flex-col xl:flex-row">
        <aside className={`${dashboardTheme.sidebar} xl:sticky xl:top-0 xl:h-screen xl:w-[16.5rem] xl:px-4 xl:py-4`}>
          <Link
            href="/admin"
            className={`flex h-16 items-center gap-3 rounded-[1.65rem] p-3 ${dashboardTheme.surface} ${dashboardTheme.hoverSurface}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-white text-[11px] font-black tracking-[0.16em] text-black shadow-lg shadow-white/10">
              ZX
            </span>
            <span>
              <span className="block text-[14px] font-bold tracking-[0.18em]">
                ZERINIX
              </span>
              <span className="text-[10px] text-zinc-500">Admin panel</span>
            </span>
          </Link>

          <AdminNavigation />
        </aside>

        <section className="flex-1 px-4 py-4 sm:px-6 xl:px-7 xl:py-5 2xl:px-8">
          <header className={`sticky top-3 z-30 mb-5 flex min-h-[4.25rem] flex-col gap-3 rounded-[1.65rem] p-2.5 ${dashboardTheme.surfaceStrong} lg:flex-row lg:items-center lg:justify-between`}>
            {headerActions ? (
              <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h1 className="text-[1.65rem] font-semibold leading-none tracking-[-0.035em] text-white md:text-[2rem]">
                    {title}
                  </h1>
                  <p className="mt-1.5 text-[13px] text-zinc-500">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {headerActions}
                </div>
              </div>
            ) : (
              <AdminGlobalSearch />
            )}

            <div className="flex items-center gap-2">
              <Link
                href="/admin/logs"
                className={`relative flex h-10 w-10 items-center justify-center rounded-[0.95rem] text-zinc-300 shadow-inner shadow-white/[0.025] ${dashboardTheme.innerSurface} ${dashboardTheme.hoverSurface} hover:text-white`}
                aria-label="Admin notifications"
              >
                <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.55)]" />
                <Bell className="h-4 w-4" />
              </Link>
              <details className="group relative">
                <summary className={`flex h-10 cursor-pointer list-none items-center gap-2.5 rounded-[0.95rem] px-2 shadow-inner shadow-white/[0.025] ${dashboardTheme.innerSurface} ${dashboardTheme.hoverSurface}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-black tracking-[0.12em] text-black">
                    {initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-44 truncate text-[13px] font-semibold text-white">
                      {email}
                    </span>
                    <span className="text-[11px] text-zinc-500">{role}</span>
                  </span>
                </summary>
                <div className={`absolute right-0 top-14 z-40 w-72 rounded-[1.45rem] p-4 ${dashboardTheme.surfaceStrong}`}>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Signed in as
                  </p>
                  <p className="mt-2 truncate text-sm font-semibold text-white">{email}</p>
                  <p className="mt-1 text-xs text-teal-100">{role}</p>
                  <div className="mt-4 grid gap-2">
                    <Link
                      href="/dashboard/settings"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:border-teal-300/30 hover:text-white"
                    >
                      Account settings
                    </Link>
                    <Link
                      href="/admin/security"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 transition hover:border-teal-300/30 hover:text-white"
                    >
                      Security settings
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-white/10 bg-white px-3 py-2 text-left text-sm font-semibold text-black transition hover:bg-zinc-200"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            </div>
          </header>

          {hidePageHeader ? null : (
            <div className={`rounded-[2rem] p-6 sm:p-8 ${dashboardTheme.surfaceStrong}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-200/80">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                {subtitle}
              </p>
            </div>
          )}

          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminComingSoon({ section }: { section: string }) {
  return (
    <div className={`mt-6 rounded-[1.75rem] p-8 ${dashboardTheme.surface}`}>
      <p className="text-sm font-semibold text-white">{section}</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        This admin module is not configured yet. It is intentionally empty until
        the required backend source, permissions model, and audit flow are
        implemented.
      </p>
    </div>
  );
}

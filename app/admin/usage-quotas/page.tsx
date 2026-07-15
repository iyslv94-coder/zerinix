import { Search } from "lucide-react";
import { AdminShell } from "../AdminShell";
import { loadAdminUsageQuotas, resolveAdminDateRange } from "../admin-data";

type UsageQuotasPageProps = {
  searchParams: Promise<{
    q?: string;
    range?: string;
    from?: string;
    to?: string;
  }>;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(value || 0);
}

function formatDateInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function UsageTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    label: string;
    detail: string;
    totalRequests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    aiCostUsd: number;
  }>;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 bg-black/25 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Requests</th>
              <th className="px-5 py-4">Prompt tokens</th>
              <th className="px-5 py-4">Completion tokens</th>
              <th className="px-5 py-4">Total tokens</th>
              <th className="px-5 py-4">AI cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className="text-zinc-300">
                <td className="px-5 py-4">
                  <span className="block max-w-md truncate font-medium text-white">{row.label}</span>
                  <span className="text-xs text-zinc-500">{row.detail}</span>
                </td>
                <td className="px-5 py-4">{formatCompactNumber(row.totalRequests)}</td>
                <td className="px-5 py-4">{formatCompactNumber(row.promptTokens)}</td>
                <td className="px-5 py-4">{formatCompactNumber(row.completionTokens)}</td>
                <td className="px-5 py-4">{formatCompactNumber(row.totalTokens)}</td>
                <td className="px-5 py-4">{formatCurrency(row.aiCostUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <div className="p-8">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-6 text-sm text-zinc-400">
            No usage data is available for this range.
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default async function AdminUsageQuotasPage({ searchParams }: UsageQuotasPageProps) {
  const params = await searchParams;
  const search = String(params.q || "").trim();
  const dateRange = resolveAdminDateRange({
    range: params.range,
    from: params.from,
    to: params.to,
  });
  const data = await loadAdminUsageQuotas({
    search,
    dateRange,
  });

  return (
    <AdminShell
      eyebrow="Admin / Usage"
      title="Usage & Quotas"
      subtitle="Inspect AI requests, token usage, and attributed platform cost from production usage records."
    >
      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <form action="/admin/usage-quotas" className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_9rem_9rem_auto]">
          <label className="relative">
            <span className="sr-only">Search usage</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search by user email or report title"
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
            />
          </label>
          <label>
            <span className="sr-only">Date range</span>
            <select
              name="range"
              defaultValue={dateRange.key}
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
            >
              <option value="24h">Today</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <input
            type="date"
            name="from"
            defaultValue={formatDateInput(dateRange.fromIso)}
            className="h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
          />
          <input
            type="date"
            name="to"
            defaultValue={formatDateInput(dateRange.toIso)}
            className="h-12 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition focus:border-teal-300/35 focus:ring-2 focus:ring-teal-300/10"
          />
          <button
            type="submit"
            className="h-12 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total AI requests" value={formatCompactNumber(data.totalAiRequests)} />
        <MetricCard label="Total prompt tokens" value={formatCompactNumber(data.totalPromptTokens)} />
        <MetricCard label="Total completion tokens" value={formatCompactNumber(data.totalCompletionTokens)} />
        <MetricCard label="Total tokens" value={formatCompactNumber(data.totalTokens)} />
        <MetricCard label="Total AI cost" value={formatCurrency(data.totalAiCostUsd)} />
        <MetricCard label="Average cost per report" value={formatCurrency(data.averageCostPerReport)} />
        <MetricCard label="Average tokens per report" value={formatCompactNumber(data.averageTokensPerReport)} />
        <MetricCard label="Selected range" value={data.dateRange.label} />
      </div>

      <div className="mt-5 space-y-5">
        <UsageTable title="Top 10 Most Expensive Users" rows={data.topUsers} />
        <UsageTable title="Top 10 Most Expensive Reports" rows={data.topReports} />
      </div>
    </AdminShell>
  );
}

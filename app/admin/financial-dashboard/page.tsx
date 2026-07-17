import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PieChart,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { dashboardTheme } from "@/app/lib/ui/dashboard-theme";
import { AdminShell } from "../AdminShell";

const executiveMetrics = [
  {
    label: "Monthly Revenue",
    value: "$128.4K",
    detail: "Demo run-rate",
    trend: "+18.2%",
    direction: "up",
    icon: CircleDollarSign,
    accent: "emerald",
  },
  {
    label: "Gross Profit",
    value: "$91.7K",
    detail: "Demo margin model",
    trend: "+11.6%",
    direction: "up",
    icon: TrendingUp,
    accent: "teal",
  },
  {
    label: "Operating Cost",
    value: "$36.7K",
    detail: "Demo expense base",
    trend: "-4.1%",
    direction: "down",
    icon: WalletCards,
    accent: "violet",
  },
  {
    label: "Cash Runway",
    value: "14.8 mo",
    detail: "Demo treasury view",
    trend: "+2.3 mo",
    direction: "up",
    icon: Landmark,
    accent: "sky",
  },
] as const;

const revenueMix = [
  { label: "Pro subscriptions", value: "$54.2K", width: "72%" },
  { label: "Business subscriptions", value: "$46.8K", width: "61%" },
  { label: "Usage expansion", value: "$18.9K", width: "38%" },
  { label: "Services", value: "$8.5K", width: "24%" },
];

const expenseLines = [
  { label: "AI infrastructure", value: "$14.8K", status: "Monitored" },
  { label: "Cloud hosting", value: "$7.6K", status: "Stable" },
  { label: "Payment fees", value: "$3.1K", status: "Demo" },
  { label: "Support operations", value: "$11.2K", status: "Review" },
];

const forecastRows = [
  { month: "Aug", revenue: "$142K", cost: "$41K", margin: "71%" },
  { month: "Sep", revenue: "$156K", cost: "$44K", margin: "72%" },
  { month: "Oct", revenue: "$173K", cost: "$49K", margin: "72%" },
  { month: "Nov", revenue: "$190K", cost: "$53K", margin: "72%" },
];

const metricAccentClasses = {
  emerald: "bg-emerald-300/10 text-emerald-200",
  teal: "bg-teal-300/10 text-teal-200",
  violet: "bg-violet-300/10 text-violet-200",
  sky: "bg-sky-300/10 text-sky-200",
};

function MetricCard({
  metric,
}: {
  metric: (typeof executiveMetrics)[number];
}) {
  const Icon = metric.icon;
  const TrendIcon = metric.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <section className={`rounded-[1.75rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-white/10 ${metricAccentClasses[metric.accent]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Demo
        </span>
      </div>
      <p className="mt-5 text-[12px] font-medium text-zinc-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
        {metric.value}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500">{metric.detail}</span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            metric.direction === "up" ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.trend}
        </span>
      </div>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BarChart3;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-200/70">
          Demo finance
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-teal-200">
        <Icon className="h-4 w-4" />
      </span>
    </div>
  );
}

export default async function AdminFinancialDashboardPage() {
  return (
    <AdminShell
      eyebrow="Admin / Financial"
      title="Financial Dashboard"
      subtitle="Demo executive finance workspace for revenue, margin, runway, expenses and forecast visibility."
    >
      <div className="mt-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {executiveMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
          <div className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
            <SectionHeader
              icon={BarChart3}
              title="Revenue and profit trajectory"
              subtitle="Placeholder monthly view for future Stripe and accounting integrations."
            />
            <div className="mt-8 flex h-72 items-end gap-3 rounded-[1.45rem] border border-white/10 bg-black/25 p-4">
              {[42, 56, 49, 66, 72, 80, 76, 88, 95, 104, 112, 128].map((value, index) => (
                <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2">
                  <div
                    className="rounded-t-xl bg-gradient-to-t from-teal-400/25 to-teal-200 shadow-lg shadow-teal-950/20"
                    style={{ height: `${Math.max(18, value * 0.72)}%` }}
                  />
                  <span className="text-center text-[10px] text-zinc-600">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
            <SectionHeader
              icon={PieChart}
              title="Revenue mix"
              subtitle="Demo channel allocation for launch planning."
            />
            <div className="mt-6 space-y-4">
              {revenueMix.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zinc-300">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-teal-300" style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <div className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
            <SectionHeader
              icon={ReceiptText}
              title="Expense control"
              subtitle="Demo operating cost categories."
            />
            <div className="mt-6 divide-y divide-white/10">
              {expenseLines.map((line) => (
                <div key={line.label} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{line.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{line.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">{line.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
            <SectionHeader
              icon={CreditCard}
              title="Collections overview"
              subtitle="Placeholder billing health for future Stripe sync."
            />
            <div className="mt-6 grid gap-3">
              {[
                ["Paid invoices", "94.2%"],
                ["Failed payments", "2.8%"],
                ["Pending collection", "$6.4K"],
                ["Refund exposure", "$820"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  <span className="text-sm text-zinc-400">{label}</span>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
            <SectionHeader
              icon={ShieldCheck}
              title="Finance readiness"
              subtitle="Demo controls for launch governance."
            />
            <div className="mt-6 space-y-3">
              {["Stripe reconciliation", "Revenue recognition", "Cost attribution", "Board reporting"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  <span className="text-sm text-zinc-300">{item}</span>
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                    Demo
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`rounded-[1.85rem] p-5 shadow-2xl shadow-black/25 ${dashboardTheme.surface}`}>
          <SectionHeader
            icon={Banknote}
            title="Four-month forecast"
            subtitle="Static placeholder forecast for the future financial planning engine."
          />
          <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.035] text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {forecastRows.map((row) => (
                  <tr key={row.month} className="bg-black/20 text-zinc-300">
                    <td className="px-4 py-4 font-semibold text-white">{row.month}</td>
                    <td className="px-4 py-4">{row.revenue}</td>
                    <td className="px-4 py-4">{row.cost}</td>
                    <td className="px-4 py-4">{row.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

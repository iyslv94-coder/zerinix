import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Quote,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "ZERINIX | AI Business Planning for Founders",
  description:
    "ZERINIX is a premium AI operating system for founders, combining business planning, market intelligence, strategic reports and secure execution workflows.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ZERINIX | AI Business Planning for Founders",
    description:
      "AI business planning, market intelligence and strategic reports for founders.",
    type: "website",
  },
};

const workflowSteps = [
  "Clarifying the business model",
  "Sizing the market opportunity",
  "Mapping competitors and risks",
  "Modeling revenue assumptions",
  "Writing the board-ready plan",
];

const chatMessages = [
  {
    role: "Founder",
    text: "I want to launch an AI CRM for private healthcare clinics.",
  },
  {
    role: "ZERINIX",
    text: "I will turn that into a structured founder report with market position, ICP, revenue model, risks and first customer strategy.",
  },
];

const features = [
  {
    title: "Investor-grade planning",
    description:
      "Create structured business reports with executive summary, business model, financial assumptions, risks and founder priorities.",
    icon: FileText,
  },
  {
    title: "Market diligence",
    description:
      "Turn a rough idea into market sizing, competitor landscape, pricing logic, demand signals and entry strategy.",
    icon: Globe2,
  },
  {
    title: "AI strategy workspace",
    description:
      "Keep reports, conversations, workspaces and follow-up decisions connected in one secure operating layer.",
    icon: Layers3,
  },
  {
    title: "Governed AI usage",
    description:
      "Designed with usage accounting, caching and model routing so serious analysis can scale responsibly.",
    icon: Zap,
  },
];

const platformModules = [
  {
    eyebrow: "AI Plan",
    title: "Board-ready business plans",
    description:
      "From one idea to a complete strategic report covering the customer, model, pricing, risks, KPIs and execution roadmap.",
    icon: Workflow,
  },
  {
    eyebrow: "Market Analysis",
    title: "Diligence before spend",
    description:
      "Understand market structure, competitors, trend pressure, TAM/SAM/SOM and validation priorities before committing capital.",
    icon: Radar,
  },
  {
    eyebrow: "AI Chat",
    title: "Advisor with memory",
    description:
      "Ask follow-up questions, reuse report context and keep strategic conversations tied to your business workspace.",
    icon: MessageSquareText,
  },
];

const trustSignals = [
  {
    title: "Designed for founder diligence",
    detail: "Business models, market logic, financial assumptions and next actions in one workflow.",
    icon: Building2,
  },
  {
    title: "Built for protected workspaces",
    detail: "Authenticated sessions, report history and Supabase-backed persistence.",
    icon: ShieldCheck,
  },
  {
    title: "Disciplined around AI cost",
    detail: "Usage tracking, caching and routing are part of the product foundation.",
    icon: CircleDollarSign,
  },
];

const pricing = [
  {
    name: "Free",
    price: "Private beta",
    description: "For invited founders exploring the ZERINIX workspace.",
    features: ["AI Chat access", "Limited reports", "Core workspace history"],
  },
  {
    name: "Pro",
    price: "Founder plan",
    description: "For operators turning ideas into investor-ready decisions.",
    features: ["AI Plan reports", "Market Analysis", "Premium PDF exports"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "Team scale",
    description: "For teams that need shared strategy, reporting and governance.",
    features: ["Higher AI limits", "Workspace organization", "Usage intelligence"],
  },
];

const security = [
  "Private beta access control",
  "Supabase authentication and RLS",
  "Cloudflare and Vercel edge protection",
  "AI usage accounting and cost limits",
];

const faqs = [
  {
    question: "Who is ZERINIX built for?",
    answer:
      "ZERINIX is built for founders, operators and early teams who need sharper business planning, market diligence and investor-ready strategic reports before committing time or capital.",
  },
  {
    question: "Does ZERINIX replace consultants or analysts?",
    answer:
      "No. ZERINIX helps founders structure decisions faster, pressure-test assumptions and prepare better inputs for investors, advisors and internal teams.",
  },
  {
    question: "Can I export reports?",
    answer:
      "Yes. Saved reports can be opened from the dashboard and exported as polished PDFs for review, sharing and decision meetings.",
  },
  {
    question: "Is ZERINIX available publicly?",
    answer:
      "ZERINIX is currently in private beta. Early access is controlled so we can keep quality, reliability and cost discipline high while the product matures.",
  },
  {
    question: "What makes the reports different from a generic AI answer?",
    answer:
      "Reports are structured around founder decisions: market sizing, customer focus, business model, risks, financial assumptions, roadmap and executive recommendation.",
  },
  {
    question: "Can teams use ZERINIX later?",
    answer:
      "Yes. Team workspaces, higher usage limits and deeper governance are part of the Business plan direction after private beta.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(244,244,245,0.12),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,0.12),transparent_36%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2),#000_88%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
        <nav
          className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Main navigation"
        >
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] shadow-lg shadow-black/30">
              <Sparkles className="h-4 w-4 text-teal-200" />
            </span>
            <span className="text-lg font-semibold tracking-[0.28em] text-white">
              ZERINIX
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-zinc-400 md:flex">
            <a className="transition hover:text-white" href="#features">
              Platform
            </a>
            <a className="transition hover:text-white" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-white" href="#faq">
              FAQ
            </a>
            <a className="transition hover:text-white" href="#security">
              Security
            </a>
          </div>

          <Link
            href="/login?next=/plan"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-teal-200/40 hover:bg-white/[0.08]"
          >
            <LockKeyhole className="h-4 w-4 text-teal-200" />
            <span className="hidden sm:inline">Developer Login</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl grid-cols-1 items-center gap-12 overflow-hidden px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
        <div className="landing-fade-up landing-mobile-safe min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-4 py-2 text-sm font-medium text-teal-100 shadow-lg shadow-teal-950/20">
            <span className="h-2 w-2 rounded-full bg-teal-200 shadow-[0_0_18px_rgba(94,234,212,0.8)]" />
            Private beta for ambitious founders
          </div>

          <h1 className="mt-7 max-w-5xl text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Turn raw business ideas into investor-ready strategy.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
            ZERINIX gives founders a premium AI workspace for business planning,
            market intelligence, strategic reports and execution-ready decisions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <WaitlistForm />
            <Link
              href="/login?next=/plan"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.08] sm:w-auto"
            >
              Developer Login
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
            Private beta is intentionally limited. Request access or sign in if
            your workspace is already enabled.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["1", "workspace for planning and analysis"],
              ["PDF", "exports for investor conversations"],
              ["24/7", "AI strategy desk for founders"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl"
              >
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-fade-up landing-delay-1 landing-mobile-safe relative min-w-0">
          <div className="absolute -inset-6 rounded-[2rem] bg-teal-200/10 blur-3xl" />
          <div className="relative min-w-0 overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.06] shadow-2xl shadow-black/60 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
                  AI Strategy Session
                </p>
                <p className="mt-1 text-sm text-zinc-500">Live founder workflow</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
              </div>
            </div>

            <div className="space-y-4 p-5">
              {chatMessages.map((message) => (
                <div
                  key={message.role}
                  className={
                    message.role === "Founder"
                      ? "ml-auto max-w-[88%] rounded-2xl bg-white px-4 py-3 text-black"
                      : "max-w-[92%] rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-zinc-100"
                  }
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
                    {message.role}
                  </p>
                  <p className="mt-2 break-words text-sm leading-6">{message.text}</p>
                </div>
              ))}

              <div className="rounded-2xl border border-teal-200/20 bg-teal-200/[0.06] p-4">
                <div className="flex flex-col gap-4 min-[460px]:flex-row min-[460px]:items-center min-[460px]:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-200 text-black">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Building report
                      </p>
                      <p className="text-xs text-zinc-500">
                        First insight visible in seconds
                      </p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full border border-teal-200/20 px-3 py-1 text-xs font-semibold text-teal-100">
                    Streaming
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2 text-sm text-zinc-300"
                    >
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>{step}</span>
                      {index === workflowSteps.length - 1 ? (
                        <span className="ml-auto flex items-center gap-1 text-xs text-teal-200">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-200" />
                          writing
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-3">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;

            return (
              <article
                key={signal.title}
                className="rounded-3xl border border-white/10 bg-black/25 p-5"
              >
                <Icon className="h-5 w-5 text-teal-200" />
                <h2 className="mt-4 text-base font-semibold text-white">
                  {signal.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {signal.detail}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="landing-fade-up flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
              Platform
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Strategy, market analysis and workspace memory in one premium layer.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-zinc-500">
            ZERINIX is built for the moment before a founder spends money,
            hires a team or pitches capital: the decision has to be sharper.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {platformModules.map((module, index) => {
            const Icon = module.icon;

            return (
              <article
                key={module.title}
                className="landing-card-hover rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-200/20 bg-teal-200/10">
                    <Icon className="h-5 w-5 text-teal-200" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    {module.eyebrow}
                  </span>
                </div>
                <h3 className="mt-7 text-2xl font-semibold tracking-tight text-white">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {module.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="landing-fade-up mt-20 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
            Founder infrastructure
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built around the work that happens before the pitch deck.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="landing-card-hover rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-200/20 bg-teal-200/10">
                  <Icon className="h-5 w-5 text-teal-200" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-8 backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
            Intelligence layer
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            From idea to operating plan, without the consultant theater.
          </h2>
          <p className="mt-5 text-sm leading-7 text-zinc-400">
            ZERINIX is built for founders who need clear decisions: what to build,
            who to sell to, how to price, where risk hides and what to do in the
            next 90 days.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [Target, "Positioning", "Define the sharpest beachhead and customer promise."],
            [Radar, "Competition", "Understand rivals, substitutes and open angles."],
            [TrendingUp, "Revenue", "Model pricing, packaging and expansion paths."],
            [Clock3, "Roadmap", "Turn strategy into a 30, 60 and 90 day sequence."],
          ].map(([Icon, title, description]) => {
            const TypedIcon = Icon as typeof Target;

            return (
              <div
                key={title as string}
                className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-xl"
              >
                <TypedIcon className="h-6 w-6 text-teal-200" />
                <h3 className="mt-5 text-lg font-semibold text-white">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {description as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
              <Quote className="h-8 w-8 text-teal-200" />
              <p className="mt-7 text-2xl font-medium leading-10 tracking-tight text-white sm:text-3xl">
                “ZERINIX is designed for founders who need a sharper first
                strategy before they burn months validating the wrong idea.”
              </p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Product principle
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-3">
              {[
                ["Planning", "Business model, ICP, pricing and roadmap"],
                ["Diligence", "Market size, competitors, risks and trends"],
                ["Execution", "Saved reports, workspace memory and exports"],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="border-b border-white/10 p-7 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200/70">
                    {title}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
              Pricing preview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Start focused. Scale when the work becomes real.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-500">
            Final pricing will launch after private beta. Early access users help
            shape limits, workflows and team features.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlighted
                  ? "rounded-3xl border border-teal-200/35 bg-teal-200/[0.08] p-6 shadow-2xl shadow-teal-950/30 backdrop-blur-xl"
                  : "rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              }
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                {plan.highlighted ? (
                  <span className="rounded-full bg-teal-200 px-3 py-1 text-xs font-semibold text-black">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {plan.price}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {plan.description}
              </p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-emerald-300" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <a
                  href="#waitlist"
                  className={
                    plan.highlighted
                      ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-teal-200"
                      : "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
                  }
                >
                  Request access
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
              FAQ
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Clear answers before you enter the workspace.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500">
              ZERINIX is focused on serious founder work: planning, market
              analysis, reports, decisions and secure workspace history.
            </p>
          </div>

          <div className="grid gap-3">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-teal-300/20 bg-teal-300/[0.06] p-8 shadow-2xl shadow-teal-950/20 backdrop-blur-2xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-100/80">
                Private beta
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Build the next version of your company with a sharper operating system.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <WaitlistForm />
              <Link
                href="/login?next=/plan"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.055] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.1]"
              >
                Developer Login
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] backdrop-blur-2xl">
          <div className="grid gap-8 p-8 lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200/25 bg-teal-200/10">
                <ShieldCheck className="h-7 w-7 text-teal-200" />
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                Built for private strategy, protected from day one.
              </h2>
              <p className="mt-5 text-sm leading-7 text-zinc-400">
                ZERINIX is designed around authenticated workspaces, guarded AI
                endpoints, usage limits and production-grade deployment controls.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {security.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <Fingerprint className="mt-0.5 h-5 w-5 text-teal-200" />
                  <p className="text-sm leading-6 text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
          <div className="max-w-md">
            <p className="text-lg font-semibold tracking-[0.28em] text-white">ZERINIX</p>
            <p className="mt-2 text-sm text-zinc-500">
              Premium AI business planning, market intelligence and strategic
              reporting for founders preparing serious decisions.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Product
              </p>
              <div className="mt-4 grid gap-3 text-sm text-zinc-400">
                <a href="#features" className="transition hover:text-white">
                  Platform
                </a>
                <a href="#pricing" className="transition hover:text-white">
                  Pricing
                </a>
                <a href="#faq" className="transition hover:text-white">
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Access
              </p>
              <div className="mt-4 grid gap-3 text-sm text-zinc-400">
                <a href="#waitlist" className="transition hover:text-white">
                  Request Early Access
                </a>
                <a href="#security" className="transition hover:text-white">
                  Security
                </a>
                <Link
                  href="/login?next=/plan"
                  prefetch={false}
                  className="transition hover:text-white"
                >
                  Developer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

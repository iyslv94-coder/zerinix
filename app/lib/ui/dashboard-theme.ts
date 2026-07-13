export const dashboardTheme = {
  page:
    "relative min-h-screen overflow-hidden bg-black text-white",
  atmosphere:
    "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.055),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_36%)]",
  grid:
    "pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40",
  sidebar:
    "border-b border-white/10 bg-black/85 px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:border-b-0 lg:border-r lg:border-white/10 lg:bg-black/70",
  surface:
    "border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 backdrop-blur-xl",
  surfaceStrong:
    "border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/35 backdrop-blur-2xl",
  innerSurface: "border border-white/10 bg-black/25",
  hoverSurface:
    "transition duration-300 hover:-translate-y-0.5 hover:border-teal-300/25 hover:bg-white/[0.065]",
  tealPill:
    "border border-teal-300/20 bg-teal-300/10 text-teal-100",
  tealFocus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200/40",
  mutedPill:
    "border border-white/10 bg-black/25 text-zinc-500",
};

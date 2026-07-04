import Link from "next/link";
import AIDashboard from "./AIDashboard";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-black text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,rgba(20,184,166,0.12),transparent_32%),linear-gradient(225deg,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">

        <div>
          <p className="text-sm font-semibold tracking-[0.45em] text-teal-300/80">
            ZERINIX
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.04] md:text-6xl">
            Girişimciler için premium AI işletim sistemi
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-8 text-gray-300">
            Hedefini yaz, ZERINIX stratejini, günlük görevlerini, marka hamlelerini
            ve büyüme yol haritanı tek bir komuta merkezinde düzenlesin.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 border-y border-white/10 py-5 text-sm text-gray-400">
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p>AI strateji masası</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">30 gün</p>
              <p>net aksiyon planı</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Tek panel</p>
              <p>hedef ve görev takibi</p>
            </div>
          </div>

          <Link
            href="/plan"
            className="mt-10 inline-flex rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200"
          >
            Hedefimi Planla
          </Link>
        </div>

        <div className="hidden justify-center lg:flex">
          <AIDashboard />
        </div>

      </div>
    </section>
  );
}

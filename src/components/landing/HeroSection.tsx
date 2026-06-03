"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import type { PlatformBranding, LandingStats } from "@/types/landing"

type Props = {
  branding: PlatformBranding
  stats: LandingStats
  locale?: string
}

export default function HeroSection({
  stats,
  locale = "pt",
}: Props) {
  const router = useRouter()
  const { t } = useTranslation(locale)

  const headline = t("landing.hero.headline")

  const connections = [
    { label: t("landing.ecosystem.modules.0.title"), value: stats.students },
    { label: t("landing.ecosystem.modules.1.title"), value: stats.teachers },
    { label: t("landing.ecosystem.modules.2.title"), value: stats.classes },
    { label: t("landing.ecosystem.modules.3.title"), value: null },
    { label: t("landing.ecosystem.modules.4.title"), value: null },
    { label: t("landing.ecosystem.modules.6.title"), value: null },
    { label: t("landing.ecosystem.modules.5.title"), value: null },
  ]

  return (
    <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg-tertiary)] text-xs text-[var(--landing-text-muted)] mb-8">
            {t("landing.hero.badge")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-[1.05] mb-6 whitespace-pre-line">
            {headline}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--landing-text-secondary)] max-w-3xl mx-auto leading-relaxed mb-10">
            {t("landing.hero.subheadline")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => router.push("/registar-escola")}
              className="w-full sm:w-auto py-3 px-8 rounded-lg text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-sans cursor-pointer"
            >
              {t("landing.hero.cta")}
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="w-full sm:w-auto py-3 px-8 rounded-lg text-sm font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-all font-sans cursor-pointer"
            >
              {t("landing.hero.explore")}
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-elevated)] rounded-2xl overflow-hidden p-8 md:p-12">
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 text-white text-sm font-bold tracking-tight">
                C₁₀
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                {connections.slice(0, 4).map((mod, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]"
                  >
                    <p className="text-lg font-bold text-[var(--landing-text-primary)]">
                      {mod.value?.toLocaleString() || "—"}
                    </p>
                    <p className="text-xs text-[var(--landing-text-muted)]">{mod.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
                {connections.slice(4).map((mod, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--landing-bg-tertiary)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--landing-text-dim)]">✦</span>
                    </div>
                    <p className="text-xs text-[var(--landing-text-muted)]">{mod.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[var(--landing-text-muted)]">
                {stats.schools} {t("landing.hero.stats")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

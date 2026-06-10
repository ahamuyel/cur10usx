"use client"

import { useTranslation } from "@/lib/i18n"
import { Building2, Palette, BarChart3, Settings2 } from "lucide-react"
import type { LandingStats } from "@/types/landing"

type Props = { locale?: string; stats: LandingStats }

const featureIcons = [Building2, Palette, BarChart3, Settings2]

export default function MultiTenantSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)

  const features = tv("landing.multiTenant.features") as {
    title: string
    desc: string
  }[]

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.multiTenant.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.multiTenant.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.multiTenant.description")}
          </p>
        </div>

        {/* Architecture visual */}
        <div className="mb-16 relative">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-[var(--landing-border)] bg-[var(--landing-bg)] flex items-center justify-center shadow-sm">
                  <Building2 size={32} className="text-primary/60" />
                </div>
                <span className="mt-3 text-xs font-medium text-[var(--landing-text-dim)]">
                  Escola {String.fromCharCode(65 + i)}
                </span>
              </div>
            ))}
          </div>

          {/* Connection lines */}
          <div className="hidden md:flex justify-center mt-6">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg)] shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                C
              </div>
              <span className="text-sm font-medium text-[var(--landing-text-primary)]">
                Cur10usX Multi-Tenant Cloud
              </span>
              <span className="text-[10px] text-[var(--landing-text-dim)] bg-[var(--landing-bg-tertiary)] px-2 py-0.5 rounded-full font-mono">
                dados isolados
              </span>
            </div>
          </div>

          {/* Arrows connecting schools to center */}
          <div className="hidden md:grid grid-cols-3 gap-8 mt-4">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = featureIcons[idx]
            return (
              <div
                key={idx}
                className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-6 md:p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--landing-text-primary)] tracking-tight mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

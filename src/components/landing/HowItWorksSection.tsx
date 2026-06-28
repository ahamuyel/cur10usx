"use client"

import { useTranslation } from "@/lib/i18n"
import { ArrowRight } from "lucide-react"

export default function HowItWorksSection() {
  const { t } = useTranslation()

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.how_it_works.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            {t("landing.how_it_works.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.how_it_works.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 md:gap-0 items-stretch">
          <div className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-8 rounded-xl md:rounded-r-none transition-all duration-300 hover:border-[var(--landing-border-strong)]">
            <span className="text-[10px] font-semibold text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
              {t("landing.how_it_works.level1_label")}
            </span>
            <h3 className="text-lg font-bold text-[var(--landing-text-primary)] mb-3">
              {t("landing.how_it_works.level1_title")}
            </h3>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.how_it_works.level1_desc")}
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center px-6">
            <div className="w-10 h-10 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] flex items-center justify-center">
              <ArrowRight size={18} className="text-[var(--landing-text-muted)]" />
            </div>
          </div>

          <div className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-8 rounded-xl md:rounded-l-none transition-all duration-300 hover:border-[var(--landing-border-strong)] md:border-l-0">
            <span className="text-[10px] font-semibold text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
              {t("landing.how_it_works.level2_label")}
            </span>
            <h3 className="text-lg font-bold text-[var(--landing-text-primary)] mb-3">
              {t("landing.how_it_works.level2_title")}
            </h3>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.how_it_works.level2_desc")}
            </p>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-center my-2">
          <ArrowRight size={18} className="text-[var(--landing-text-muted)] rotate-90" />
        </div>
      </div>
    </section>
  )
}

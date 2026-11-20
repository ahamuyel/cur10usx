"use client"

import { useTranslation } from "@/lib/i18n"
import { Building2, GraduationCap, Heart, Users } from "lucide-react"

const iconMap = [Building2, GraduationCap, Heart, Users]

export default function BenefitsSection() {
  const { t, tv } = useTranslation()
  const items = tv("landing.benefits.items") as {
    role: string
    before: string
    after: string
  }[]

  return (
    <section
      id="benefits"
      className="py-16 md:py-28 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--landing-bg-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.benefits.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-[1.05] mb-5">
            {t("landing.benefits.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
            {t("landing.benefits.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.map((item, idx) => {
            const Icon = iconMap[idx] || Users
            return (
              <div
                key={idx}
                className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                <div className="p-5 md:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/5 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary/60" />
                    </div>
                    <p className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest font-semibold">
                      {item.role}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="p-3 md:p-4 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20">
                      <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">
                        {t("landing.benefits.journey")}
                      </p>
                      <p className="text-xs md:text-sm text-[var(--landing-text-muted)] leading-relaxed whitespace-pre-line">
                        {item.before}
                      </p>
                    </div>
                    <div className="p-3 md:p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                      <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                        {t("landing.benefits.outcome")}
                      </p>
                      <p className="text-xs md:text-sm text-[var(--landing-text-primary)] leading-relaxed">
                        {item.after}
                      </p>
                    </div>
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

"use client"

import { Building2, TrendingUp, Award, CalendarCheck, Sparkles, Check } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { TimelineReveal } from "@/components/ui/timeline-reveal"

type FeatureCardItem = {
  id: string
  eyebrow: string
  title: string
  description: string
  bullets: string[]
}

const iconMap: Record<string, typeof Building2> = {
  institutional: Building2,
  evolutionary: TrendingUp,
  portfolio: Award,
  tracking: CalendarCheck,
  intelligence: Sparkles,
}

export default function FeaturesBentoSection() {
  const { t, tv } = useTranslation()
  const items = (tv("landing.features.items") as FeatureCardItem[]) || []

  return (
    <section
      id="funcionalidades"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 sm:mb-14">
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.features.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.features.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.features.description")}
          </p>
        </div>

        {/* Asymmetric 6-column Bento Grid (2 primary wide cards + 3 secondary cards) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
          {items.map((item, idx) => {
            const Icon = iconMap[item.id] || Sparkles
            const isTopRow = idx < 2
            const colSpan = isTopRow ? "md:col-span-3" : "md:col-span-2"

            return (
              <TimelineReveal key={item.id} index={idx} className={colSpan}>
                <SpotlightCard className="h-full p-6 sm:p-7">
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center">
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[11px] font-normal text-[var(--landing-text-muted)]">
                          {item.eyebrow}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-medium tracking-[-0.015em] text-[var(--landing-text-primary)] mb-2.5">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <ul className="pt-4 border-t border-[var(--landing-border-subtle)] space-y-2">
                      {item.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-center gap-2 text-xs text-[var(--landing-text-secondary)]"
                        >
                          <Check
                            className="w-3.5 h-3.5 text-[var(--landing-accent)] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </SpotlightCard>
              </TimelineReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

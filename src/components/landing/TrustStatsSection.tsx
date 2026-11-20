"use client"

import Image from "next/image"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { MotionReveal } from "@/components/ui/scroll-text"
import { useTranslation } from "@/lib/i18n"
import type { LandingStats, SchoolLogo } from "@/types/landing"

type TrustStatsSectionProps = {
  stats: LandingStats
  schools: SchoolLogo[]
}

export default function TrustStatsSection({ stats, schools }: TrustStatsSectionProps) {
  const { t } = useTranslation()

  const realMetrics = [
    { value: stats.schools, label: t("landing.stats.schools") },
    { value: stats.students, label: t("landing.stats.students") },
    { value: stats.teachers, label: t("landing.stats.teachers") },
    { value: stats.classes, label: t("landing.stats.classes") },
  ].filter((m) => m.value > 0)

  const hasSchools = schools.length > 0
  const hasMetrics = realMetrics.length > 0

  if (!hasSchools && !hasMetrics) return null

  return (
    <section
      id="trust"
      className="py-12 sm:py-14 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {hasMetrics && (
          <MotionReveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--landing-border)]">
              {realMetrics.map((metric) => (
                <div key={metric.label} className="px-4 py-3 sm:py-1 text-center">
                  <div className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[var(--landing-text-primary)] tabular-nums">
                    {metric.value.toLocaleString("pt-AO")}
                  </div>
                  <div className="mt-1 text-xs font-light text-[var(--landing-text-muted)]">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        )}

        {hasSchools && (
          <div className="space-y-4">
            <p className="text-center text-xs font-light text-[var(--landing-text-muted)]">
              {t("landing.stats.partner_label")}
            </p>
            {schools.length >= 4 ? (
              <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                <InfiniteSlider gap={36} duration={32} durationOnHover={65}>
                  {schools.map((school) => (
                    <div key={school.name} className="flex items-center gap-2.5 px-2 py-1">
                      <Image
                        src={school.logo}
                        alt={school.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-md object-contain"
                      />
                      <span className="text-xs font-normal text-[var(--landing-text-secondary)] whitespace-nowrap">
                        {school.name}
                      </span>
                    </div>
                  ))}
                </InfiniteSlider>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-6">
                {schools.map((school) => (
                  <div key={school.name} className="flex items-center gap-2">
                    <Image
                      src={school.logo}
                      alt={school.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-md object-contain"
                    />
                    <span className="text-xs font-normal text-[var(--landing-text-secondary)]">
                      {school.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

"use client"

import { useRef } from "react"
import Image from "next/image"
import { Cloud, ShieldCheck, Lock, Layers } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { Spotlight, SpotLightItem } from "@/components/ui/spotlight"
import { TimelineAnimation } from "@/components/ui/timeline-animation"
import type { LandingStats, SchoolLogo } from "@/types/landing"

const pillarIcons = [Layers, ShieldCheck, Lock, Cloud]

type TrustStatsSectionProps = {
  stats: LandingStats
  schools: SchoolLogo[]
}

export default function TrustStatsSection({
  stats,
  schools = [],
}: TrustStatsSectionProps) {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const points = (tv("landing.trust.points") as { title: string; desc: string }[]) || []

  // Strictly real database counters — only render metrics > 0
  const realMetrics = [
    { key: "schools", label: t("landing.stats.schools"), value: stats.schools },
    { key: "students", label: t("landing.stats.students"), value: stats.students },
    { key: "teachers", label: t("landing.stats.teachers"), value: stats.teachers },
    { key: "classes", label: t("landing.stats.classes"), value: stats.classes },
  ].filter((m) => typeof m.value === "number" && m.value > 0)

  const validSchools = Array.isArray(schools)
    ? schools.filter((s) => Boolean(s?.logo && s?.name))
    : []

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Real Partner Schools Marquee — ONLY when real logos exist */}
        {validSchools.length > 0 && (
          <div className="space-y-5">
            <p className="text-center text-xs font-normal tracking-wide uppercase text-[var(--landing-text-muted)]">
              {t("landing.stats.partner_label")}
            </p>
            <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <InfiniteSlider gap={40} duration={30} durationOnHover={60}>
                {validSchools.map((school) => (
                  <div
                    key={school.name}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)]"
                  >
                    <Image
                      src={school.logo}
                      alt={school.name}
                      width={24}
                      height={24}
                      unoptimized
                      className="w-6 h-6 rounded object-contain"
                    />
                    <span className="text-xs font-medium text-[var(--landing-text-secondary)] whitespace-nowrap">
                      {school.name}
                    </span>
                  </div>
                ))}
              </InfiniteSlider>
            </div>
          </div>
        )}

        {/* Real Platform Metrics — ONLY when real counts > 0 */}
        {realMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-border)] overflow-hidden">
            {realMetrics.map((metric) => (
              <div
                key={metric.key}
                className="bg-[var(--landing-surface)] px-5 py-6 sm:px-6 sm:py-7 text-center"
              >
                <p className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--landing-text-primary)] tabular-nums">
                  {metric.value.toLocaleString()}
                </p>
                <p className="mt-1.5 text-xs font-normal text-[var(--landing-text-muted)]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Engineering & Architecture Pillars using UI Layouts Proximity Spotlight */}
        <div>
          <TimelineAnimation
            timelineRef={sectionRef}
            animationNum={0}
            className="max-w-2xl mb-10 sm:mb-12"
          >
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
              {t("landing.trust.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
              {t("landing.trust.headline")}
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.trust.description")}
            </p>
          </TimelineAnimation>

          <Spotlight
            ProximitySpotlight
            CursorFlowGradient
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {points.map((point, idx) => {
              const Icon = pillarIcons[idx] || ShieldCheck
              return (
                <TimelineAnimation
                  key={point.title}
                  timelineRef={sectionRef}
                  animationNum={idx + 1}
                >
                  <SpotLightItem className="h-full" innerClassName="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--landing-text-dim)]">
                        0{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--landing-text-primary)] mb-1.5">
                      {point.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                      {point.desc}
                    </p>
                  </SpotLightItem>
                </TimelineAnimation>
              )
            })}
          </Spotlight>
        </div>
      </div>
    </section>
  )
}

"use client"

import { GraduationCap, BookOpen, CalendarCheck, Award } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TimelineReveal } from "@/components/ui/timeline-reveal"

type EvolutionStage = {
  step: string
  title: string
  description: string
}

type EvolutionDimension = {
  label: string
  detail: string
}

const dimensionIcons = [GraduationCap, BookOpen, CalendarCheck, Award]

export default function EvolutionaryProfileSection() {
  const { t, tv } = useTranslation()
  const stages = (tv("landing.evolution.stages") as EvolutionStage[]) || []
  const dimensions = (tv("landing.evolution.dimensions") as EvolutionDimension[]) || []

  return (
    <section
      id="perfil-evolutivo"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Narrative + Progressive Vertical Timeline */}
          <div className="lg:col-span-6">
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
              {t("landing.evolution.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
              {t("landing.evolution.headline")}
            </h2>
            <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.evolution.description")}
            </p>

            {/* Timeline */}
            <ol className="mt-10 relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--landing-border)]">
              {stages.map((stage, idx) => (
                <li key={stage.step} className="relative pl-11">
                  <TimelineReveal index={idx}>
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0.5 w-8 h-8 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] flex items-center justify-center font-mono text-[11px] font-medium text-[var(--landing-accent)]"
                    >
                      {stage.step}
                    </span>
                    <h3 className="text-sm sm:text-[15px] font-medium text-[var(--landing-text-primary)] mb-1">
                      {stage.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                      {stage.description}
                    </p>
                  </TimelineReveal>
                </li>
              ))}
            </ol>
          </div>

          {/* Right Column: Clean Conceptual Anatomy of the Evolutionary Profile */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <TimelineReveal index={1}>
              <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 sm:p-7 shadow-[0_18px_50px_-30px_rgba(9,9,11,0.16)] dark:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.75)]">
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-[var(--landing-border-subtle)]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--landing-accent)] mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" aria-hidden="true" />
                      {t("landing.evolution.preview_badge")}
                    </span>
                    <h3 className="text-base font-medium text-[var(--landing-text-primary)]">
                      {t("landing.evolution.preview_title")}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[var(--landing-text-muted)]">
                    Cur10usX Profile
                  </span>
                </div>

                {/* Tracked Dimensions List (Strictly architectural, zero fabricated student data) */}
                <div className="mt-5 space-y-3">
                  {dimensions.map((dim, idx) => {
                    const Icon = dimensionIcons[idx] || GraduationCap
                    return (
                      <div
                        key={dim.label}
                        className="flex items-start gap-3.5 p-3.5 rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)]/70 transition-colors hover:border-[var(--landing-border)]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm font-medium text-[var(--landing-text-primary)]">
                              {dim.label}
                            </p>
                            <span className="font-mono text-[10px] text-[var(--landing-text-dim)] shrink-0">
                              0{idx + 1}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs font-light text-[var(--landing-text-secondary)] leading-relaxed">
                            {dim.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subtle longitudinal continuity bar */}
                <div className="mt-6 pt-5 border-t border-[var(--landing-border-subtle)]">
                  <div className="grid grid-cols-4 gap-2 mb-2.5">
                    {stages.map((s) => (
                      <div key={s.step} className="space-y-1.5">
                        <div className="h-1.5 rounded-full bg-[var(--landing-accent-subtle)] overflow-hidden">
                          <div className="h-full w-full rounded-full bg-[var(--landing-accent)]/70" />
                        </div>
                        <p className="font-mono text-[10px] text-[var(--landing-text-muted)] truncate">
                          {s.step}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-light text-[var(--landing-text-muted)]">
                    {t("landing.evolution.preview_caption")}
                  </p>
                </div>
              </div>
            </TimelineReveal>
          </div>
        </div>
      </div>
    </section>
  )
}

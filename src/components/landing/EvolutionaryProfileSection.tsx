"use client"

import { useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react"
import { GraduationCap, BookOpen, CalendarCheck, Award } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TimelineAnimation } from "@/components/ui/timeline-animation"

type EvolutionStage = {
  step: string
  title: string
  description: string
}

type EvolutionDimension = {
  label: string
  detail: string
}

const stageIcons = [GraduationCap, CalendarCheck, BookOpen, Award]

function StackingStageCard({
  stage,
  dimension,
  index,
  total,
  progress,
}: {
  stage: EvolutionStage
  dimension?: EvolutionDimension
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const prefersReducedMotion = useReducedMotion()
  const Icon = stageIcons[index] || GraduationCap

  const rangeStart = index / total
  const targetScale = 1 - (total - 1 - index) * 0.035
  const scale = useTransform(progress, [rangeStart, 1], [1, targetScale])

  const topOffset = 92 + index * 22

  return (
    <div
      className="lg:sticky"
      style={prefersReducedMotion ? undefined : { top: `${topOffset}px` }}
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { scale }}
        className="origin-top rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 sm:p-7 shadow-[0_14px_40px_-24px_rgba(9,9,11,0.18)] dark:shadow-[0_14px_40px_-24px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-mono text-[11px] text-[var(--landing-accent)] block">
                {stage.step} / 0{total}
              </span>
              <h3 className="text-base sm:text-lg font-medium tracking-[-0.015em] text-[var(--landing-text-primary)]">
                {stage.title}
              </h3>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i <= index
                    ? "w-5 bg-[var(--landing-accent)]"
                    : "w-1.5 bg-[var(--landing-border-strong)]"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed mb-5">
          {stage.description}
        </p>

        {dimension && (
          <div className="rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--landing-text-primary)] truncate">
                {dimension.label}
              </p>
              <p className="text-[11px] font-light text-[var(--landing-text-muted)] truncate">
                {dimension.detail}
              </p>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-muted)] shrink-0">
              Layer {stage.step}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Uses UI Layouts `stacking-card` scroll-linked depth stacking pattern
 * (https://www.ui-layouts.com/components/stacking-card) powered purely by motion/react.
 */
export default function EvolutionaryProfileSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  })

  const stages = (tv("landing.evolution.stages") as EvolutionStage[]) || []
  const dimensions = (tv("landing.evolution.dimensions") as EvolutionDimension[]) || []

  return (
    <section
      id="perfil-evolutivo"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={stackRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
        >
          {/* Sticky Editorial Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <TimelineAnimation timelineRef={sectionRef} animationNum={0}>
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
                {t("landing.evolution.tag")}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
                {t("landing.evolution.headline")}
              </h2>
              <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.evolution.description")}
              </p>
            </TimelineAnimation>

            <TimelineAnimation
              timelineRef={sectionRef}
              animationNum={1}
              className="mt-8 rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5"
            >
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--landing-border-subtle)]">
                <span className="text-xs font-medium text-[var(--landing-text-primary)]">
                  {t("landing.evolution.preview_badge")}
                </span>
                <span className="w-2 h-2 rounded-full bg-[var(--landing-accent)]" aria-hidden="true" />
              </div>
              <p className="text-xs font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.evolution.preview_caption")}
              </p>
            </TimelineAnimation>
          </div>

          {/* Right Column: UI Layouts Stacking Cards */}
          <div className="lg:col-span-7 space-y-5 lg:space-y-8">
            {stages.map((stage, idx) => (
              <StackingStageCard
                key={stage.step}
                stage={stage}
                dimension={dimensions[idx]}
                index={idx}
                total={stages.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

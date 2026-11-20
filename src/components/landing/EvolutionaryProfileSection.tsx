"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type EvolutionStage = {
  step: string
  title: string
  description: string
}

/**
 * Editorial scroll-linked student journey timeline (zero heavy card boxes).
 * A luminous vertical track draws down smoothly as the user scrolls.
 */
export default function EvolutionaryProfileSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const timelineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 60%"],
  })

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  const stages = (tv("landing.evolution.stages") as EvolutionStage[]) || []

  if (!stages.length) return null

  return (
    <section
      id="perfil-evolutivo"
      className="py-20 sm:py-28 bg-[var(--landing-bg-secondary)] border-y border-[var(--landing-border)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Sticky Editorial Intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <MotionReveal y={12}>
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
                {t("landing.evolution.tag")}
              </span>
            </MotionReveal>
            <ScrollText
              text={t("landing.evolution.headline")}
              className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]"
            />
            <MotionReveal delay={0.14} y={14}>
              <p className="mt-4 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.evolution.description")}
              </p>
            </MotionReveal>
          </div>

          {/* Right: Open Scroll-Linked Vertical Timeline (No cards!) */}
          <div ref={timelineRef} className="lg:col-span-7 relative pl-8 sm:pl-10">
            {/* Static background rail */}
            <div
              aria-hidden="true"
              className="absolute left-3 sm:left-3.5 top-2 bottom-2 w-px bg-[var(--landing-border)]"
            />
            {/* Animated luminous progress rail */}
            <motion.div
              aria-hidden="true"
              style={prefersReducedMotion ? undefined : { scaleY: lineScaleY }}
              className="origin-top absolute left-3 sm:left-3.5 top-2 bottom-2 w-px bg-[var(--landing-accent)]"
            />

            <div className="space-y-12 sm:space-y-14">
              {stages.map((stage, idx) => (
                <MotionReveal key={stage.step} delay={idx * 0.06} y={24} className="relative">
                  {/* Step node on rail */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[25px] sm:-left-[31px] top-1 w-3 h-3 rounded-full bg-[var(--landing-bg-secondary)] border-2 border-[var(--landing-accent)]"
                  />
                  <span className="font-mono text-xs text-[var(--landing-accent)] block mb-1.5">
                    {stage.step}
                  </span>
                  <h3 className="text-lg sm:text-xl font-medium tracking-[-0.015em] text-[var(--landing-text-primary)]">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed max-w-lg">
                    {stage.description}
                  </p>
                </MotionReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

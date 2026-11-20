"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { Check, Minus } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TimelineReveal } from "@/components/ui/timeline-reveal"

type ProblemItem = {
  title: string
  description: string
}

type TransformationStep = {
  title: string
  legacy_title: string
  legacy_items: string[]
  platform_title: string
  platform_items: string[]
}

export default function ProblemTransformationSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState<"legacy" | "platform">("platform")

  const problems = (tv("landing.problem.items") as ProblemItem[]) || []
  const steps = (tv("landing.transformation.steps") as TransformationStep[]) || []

  return (
    <section
      id="transformacao"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-12 sm:mb-14">
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.problem.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.problem.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.problem.description")}
          </p>
        </div>

        {/* 4 Concise Problem Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14 sm:mb-16">
          {problems.map((item, idx) => (
            <TimelineReveal key={item.title} index={idx}>
              <div className="h-full rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 sm:p-6">
                <span className="font-mono text-[11px] text-[var(--landing-text-dim)] block mb-3">
                  0{idx + 1}
                </span>
                <h3 className="text-sm font-medium text-[var(--landing-text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </TimelineReveal>
          ))}
        </div>

        {/* Interactive Before / After Transformation (UI Layouts Animated Tabs) */}
        <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div className="max-w-xl">
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-text-muted)] block mb-2">
                {t("landing.transformation.tag")}
              </span>
              <h3 className="text-xl sm:text-2xl font-medium tracking-[-0.02em] text-[var(--landing-text-primary)]">
                {t("landing.transformation.headline")}
              </h3>
              <p className="mt-2 text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.transformation.description")}
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div
              role="tablist"
              aria-label={t("landing.transformation.tag")}
              className="inline-flex self-start md:self-auto p-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]"
            >
              {(["legacy", "platform"] as const).map((tab) => {
                const selected = activeTab === tab
                const label =
                  tab === "legacy"
                    ? t("landing.transformation.tab_legacy")
                    : t("landing.transformation.tab_platform")
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] ${
                      selected
                        ? "text-[var(--landing-bg)]"
                        : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId={prefersReducedMotion ? undefined : "transformation-tab-pill"}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-lg bg-[var(--landing-text-primary)]"
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3 Workflow Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--landing-border-subtle)]">
                  <span className="text-xs font-medium text-[var(--landing-text-primary)]">
                    {step.title}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--landing-text-dim)]">
                    0{idx + 1}
                  </span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === "legacy" ? (
                    <motion.div
                      key="legacy"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-xs font-medium text-[var(--landing-text-muted)] mb-3">
                        {step.legacy_title}
                      </p>
                      <ul className="space-y-2.5">
                        {step.legacy_items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed"
                          >
                            <Minus
                              className="w-3.5 h-3.5 text-[var(--landing-text-dim)] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="platform"
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="text-xs font-medium text-[var(--landing-accent)] mb-3">
                        {step.platform_title}
                      </p>
                      <ul className="space-y-2.5">
                        {step.platform_items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] font-normal text-[var(--landing-text-primary)] leading-relaxed"
                          >
                            <Check
                              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

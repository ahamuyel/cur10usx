"use client"

import { useRef } from "react"
import { Check, Minus, Layers, Radio, Sparkles } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { TimelineAnimation } from "@/components/ui/timeline-animation"
import { TabsProvider, TabsBtn, TabsContent } from "@/components/ui/uilayouts-tabs"
import { Spotlight, SpotLightItem } from "@/components/ui/spotlight"

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

const stepIcons = [Layers, Radio, Sparkles]

export default function ProblemTransformationSection() {
  const { t, tv } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)

  const problems = (tv("landing.problem.items") as ProblemItem[]) || []
  const steps = (tv("landing.transformation.steps") as TransformationStep[]) || []

  return (
    <section
      id="transformacao"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <TimelineAnimation
          timelineRef={sectionRef}
          animationNum={0}
          className="max-w-2xl mb-12 sm:mb-14"
        >
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
            {t("landing.problem.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
            {t("landing.problem.headline")}
          </h2>
          <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
            {t("landing.problem.description")}
          </p>
        </TimelineAnimation>

        {/* Horizontal Architectural Problem Strip (joined hairline dividers, editorial contrast) */}
        <TimelineAnimation timelineRef={sectionRef} animationNum={1} className="mb-14 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:gap-px rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-border)] overflow-hidden">
            {problems.map((item, idx) => (
              <div
                key={item.title}
                className="bg-[var(--landing-surface)] p-5 sm:p-6 flex flex-col justify-between gap-4 hover:bg-[var(--landing-surface-hover)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[var(--landing-text-dim)]">
                    0{idx + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-[var(--landing-border-strong)]"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--landing-text-primary)] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TimelineAnimation>

        {/* UI Layouts Wobbly Tabs — Legacy vs Cur10usX Transformation */}
        <TimelineAnimation timelineRef={sectionRef} animationNum={2}>
          <TabsProvider
            defaultValue="platform"
            tabsOrder={["legacy", "platform"]}
            wobbly
          >
            <div className="rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] p-5 sm:p-7 lg:p-9">
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

                <div
                  role="tablist"
                  aria-label={t("landing.transformation.tag")}
                  className="inline-flex self-start md:self-auto p-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg)]"
                >
                  <TabsBtn value="legacy">
                    {t("landing.transformation.tab_legacy")}
                  </TabsBtn>
                  <TabsBtn value="platform">
                    {t("landing.transformation.tab_platform")}
                  </TabsBtn>
                </div>
              </div>

              <TabsContent value="legacy">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {steps.map((step, idx) => {
                    const Icon = stepIcons[idx] || Layers
                    return (
                      <div
                        key={step.title}
                        className="rounded-2xl border border-dashed border-[var(--landing-border-strong)] bg-[var(--landing-surface)]/65 p-5 sm:p-6"
                      >
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--landing-border-subtle)]">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--landing-text-muted)]">
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                            {step.title}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--landing-text-dim)]">
                            0{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--landing-text-muted)] mb-3.5">
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
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="platform">
                <Spotlight
                  ProximitySpotlight
                  CursorFlowGradient
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {steps.map((step, idx) => {
                    const Icon = stepIcons[idx] || Layers
                    return (
                      <SpotLightItem key={step.title} className="h-full" innerClassName="p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--landing-border-subtle)]">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--landing-text-primary)]">
                            <Icon
                              className="w-3.5 h-3.5 text-[var(--landing-accent)]"
                              aria-hidden="true"
                            />
                            {step.title}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--landing-accent)]">
                            0{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--landing-accent)] mb-3.5">
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
                      </SpotLightItem>
                    )
                  })}
                </Spotlight>
              </TabsContent>
            </div>
          </TabsProvider>
        </TimelineAnimation>
      </div>
    </section>
  )
}

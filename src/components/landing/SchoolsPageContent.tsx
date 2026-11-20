"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"
import HeroBackdrop from "@/components/landing/HeroBackdrop"
import CTASection from "@/components/landing/CTASection"

type SchoolPillar = {
  area: string
  tag: string
  period: string
  meta_left: string
  meta_left_val: string
  meta_right: string
  meta_right_val: string
  highlights: string[]
  paragraphs: string[]
}

type SchoolStep = {
  num: string
  title: string
  desc: string
}

/**
 * `/para-escolas` page — adapts UI Layouts `portfolio-experience` hairline 12-col rows
 * (https://www.ui-layouts.com/blocks/experience-section) for an airy, non-technical school guide.
 */
export default function SchoolsPageContent() {
  const { t, tv } = useTranslation()
  const pillars = (tv("landing.pages.schools.pillars") as SchoolPillar[]) || []
  const steps = (tv("landing.pages.schools.steps") as SchoolStep[]) || []

  return (
    <>
      {/* Editorial Hero Band */}
      <section className="relative pt-16 overflow-hidden bg-[var(--landing-bg)] border-b border-[var(--landing-border)]">
        <HeroBackdrop />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto border-x border-[var(--landing-border)] px-5 sm:px-10 pt-14 pb-14 sm:pt-20 sm:pb-20 text-center">
            <MotionReveal immediate y={10}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-normal text-[var(--landing-accent)] mb-6">
                {t("landing.pages.schools.tag")}
              </span>
            </MotionReveal>

            <ScrollText
              as="h1"
              text={t("landing.pages.schools.headline")}
              accentLastLine
              immediate
              delay={0.05}
              className="text-3xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.035em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
            />

            <MotionReveal immediate delay={0.22} y={14}>
              <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-base lg:text-lg font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.pages.schools.description")}
              </p>
            </MotionReveal>

            <MotionReveal
              immediate
              delay={0.3}
              y={14}
              className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
            >
              <Link
                href="/registar-escola"
                className="group inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <span>{t("landing.pages.schools.cta_primary")}</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center px-7 h-12 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] transition-colors"
              >
                {t("landing.pages.schools.cta_secondary")}
              </Link>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* UI Layouts `portfolio-experience` 12-Col Hairline Editorial Rows */}
      <section className="py-16 sm:py-24 bg-[var(--landing-bg)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {pillars.map((pillar, idx) => (
            <MotionReveal
              key={pillar.area}
              delay={idx * 0.05}
              y={24}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 py-14 sm:py-16 border-t border-[var(--landing-border)] first:border-t-0"
            >
              {/* Col 1: Area & Tagline */}
              <div className="md:col-span-4 space-y-3">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-[var(--landing-text-primary)] leading-tight">
                  {pillar.area}
                </h2>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--landing-accent)]">
                    {pillar.tag}
                  </p>
                  <p className="text-xs text-[var(--landing-text-muted)]">
                    {pillar.period}
                  </p>
                </div>
              </div>

              {/* Col 2: Practical Highlights & Quick Facts */}
              <div className="md:col-span-3 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--landing-text-muted)] block">
                      {pillar.meta_left}
                    </span>
                    <span className="mt-0.5 text-sm font-medium text-[var(--landing-text-primary)] block">
                      {pillar.meta_left_val}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[var(--landing-text-muted)] block">
                      {pillar.meta_right}
                    </span>
                    <span className="mt-0.5 text-sm font-medium text-[var(--landing-text-primary)] block">
                      {pillar.meta_right_val}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pillar.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[11px] border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] text-[var(--landing-text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Col 3: Plain Human Explanation */}
              <div className="md:col-span-5 space-y-4">
                {pillar.paragraphs.map((para) => (
                  <p
                    key={para}
                    className="text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </MotionReveal>
          ))}
        </div>
      </section>

      {/* Simple 3-Step Onboarding Strip (Zero heavy cards) */}
      <section className="py-20 sm:py-24 bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <MotionReveal y={10}>
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--landing-accent)] block mb-3">
                {t("landing.pages.schools.steps_tag")}
              </span>
            </MotionReveal>
            <ScrollText
              text={t("landing.pages.schools.steps_headline")}
              className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--landing-border)] border-y border-[var(--landing-border)]">
            {steps.map((step, idx) => (
              <MotionReveal
                key={step.num}
                delay={idx * 0.08}
                y={18}
                className="py-8 md:py-10 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                <span className="font-mono text-xs text-[var(--landing-accent)] block mb-3">
                  {step.num}
                </span>
                <h3 className="text-lg font-medium text-[var(--landing-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}

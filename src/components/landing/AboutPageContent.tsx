"use client"

import Link from "next/link"
import { ChevronDown, Sparkles, HeartHandshake, TrendingUp, ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type AboutValue = {
  title: string
  desc: string
}

const valueIcons = [Sparkles, HeartHandshake, TrendingUp]

/**
 * `/sobre` page — adapted directly from UI Layouts `about-mission` block
 * (https://www.ui-layouts.com/blocks/about-section).
 */
export default function AboutPageContent() {
  const { t, tv } = useTranslation()
  const values = (tv("landing.pages.about.values") as AboutValue[]) || []

  return (
    <div className="bg-[var(--landing-bg)]">
      {/* UI Layouts `about-mission` Centered Hero with Masked Grid */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-b from-[var(--landing-bg-secondary)] to-[var(--landing-bg)] border-b border-[var(--landing-border)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid-bg opacity-65 [mask-image:radial-gradient(ellipse_45%_55%_at_50%_45%,#000_45%,transparent_100%)]"
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-7">
          <MotionReveal immediate y={10}>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--landing-accent)]">
              {t("landing.pages.about.tag")}
            </span>
          </MotionReveal>

          <ScrollText
            as="h1"
            text={t("landing.pages.about.headline")}
            immediate
            delay={0.05}
            className="text-3xl sm:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.03em] leading-[1.1] text-[var(--landing-text-primary)] text-balance"
          />

          <MotionReveal immediate delay={0.25} y={12}>
            <a
              href="#missao"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full border border-[var(--landing-border-strong)] bg-[var(--landing-surface)]/80 backdrop-blur-md text-xs font-medium text-[var(--landing-text-primary)] hover:border-[var(--landing-accent)] transition-colors"
            >
              <span>{t("landing.pages.about.scroll_label")}</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </MotionReveal>
        </div>
      </section>

      {/* UI Layouts `about-mission` Two-Column Mission + 3 Clean Circular Value Pillars */}
      <section id="missao" className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex items-start gap-12 lg:gap-16">
            <MotionReveal y={14} className="md:w-64 shrink-0 mb-8 md:mb-0">
              <h2 className="text-2xl sm:text-3xl font-medium uppercase tracking-tight text-[var(--landing-text-primary)]">
                {t("landing.pages.about.mission_title")}
              </h2>
            </MotionReveal>

            <div className="flex-1">
              <MotionReveal delay={0.08} y={16}>
                <p className="text-base sm:text-xl font-light text-[var(--landing-text-secondary)] leading-relaxed mb-14">
                  {t("landing.pages.about.mission_body")}
                </p>
              </MotionReveal>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                {values.map((val, idx) => {
                  const Icon = valueIcons[idx] || Sparkles
                  return (
                    <MotionReveal key={val.title} delay={idx * 0.08} y={18} className="text-left sm:text-center">
                      <div className="w-14 h-14 rounded-full bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center sm:mx-auto mb-4">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-medium text-[var(--landing-text-primary)] mb-2">
                        {val.title}
                      </h3>
                      <p className="text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                        {val.desc}
                      </p>
                    </MotionReveal>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Clear Pathways Band */}
      <section className="py-16 sm:py-20 bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollText
            text={t("landing.pages.about.explore_title")}
            className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] text-[var(--landing-text-primary)]"
          />

          <MotionReveal
            delay={0.14}
            y={14}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
          >
            <Link
              href="/para-escolas"
              className="group inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all"
            >
              <span>{t("landing.pages.about.explore_school")}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/para-estudantes"
              className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] transition-colors"
            >
              <span>{t("landing.pages.about.explore_student")}</span>
            </Link>
          </MotionReveal>
        </div>
      </section>
    </div>
  )
}

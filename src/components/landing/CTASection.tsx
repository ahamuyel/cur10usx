"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

export default function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
      {/* Soft top ambient light — clean & serene, no heavy box */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[min(640px,95vw)] h-[240px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl opacity-80"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <MotionReveal y={12}>
          <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
            {t("landing.cta.tag")}
          </span>
        </MotionReveal>

        <ScrollText
          text={t("landing.cta.headline")}
          className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] leading-[1.1] text-[var(--landing-text-primary)] text-balance"
        />

        <MotionReveal delay={0.14} y={14}>
          <p className="mt-5 text-sm sm:text-base font-light text-[var(--landing-text-secondary)] leading-relaxed max-w-xl mx-auto">
            {t("landing.cta.description")}
          </p>
        </MotionReveal>

        <MotionReveal
          delay={0.22}
          y={16}
          className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
        >
          <Link
            href="/registar-escola"
            className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg-secondary)]"
          >
            <span>{t("landing.cta.button")}</span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center px-6 h-12 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
          >
            {t("landing.cta.explore")}
          </Link>
        </MotionReveal>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { ArrowRight, Building2, GraduationCap } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"
import HeroBackdrop from "@/components/landing/HeroBackdrop"

export default function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]">
      {/* Matching architectural grid + drifting primary light */}
      <HeroBackdrop intensity="subtle" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto border-x border-[var(--landing-border)] px-5 sm:px-10 py-20 sm:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <MotionReveal y={10}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-medium text-[var(--landing-accent)] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" aria-hidden="true" />
                <span>{t("landing.cta.tag")}</span>
              </span>
            </MotionReveal>

            <ScrollText
              text={t("landing.cta.headline")}
              className="text-3xl sm:text-4xl lg:text-[3.1rem] font-medium tracking-[-0.03em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
            />

            <MotionReveal delay={0.14} y={12}>
              <p className="mt-5 text-sm sm:text-base font-light text-[var(--landing-text-secondary)] leading-relaxed max-w-xl mx-auto">
                {t("landing.cta.description")}
              </p>
            </MotionReveal>
          </div>

          {/* Two crisp, unmistakable interactive doors: School vs Student/Family */}
          <MotionReveal
            delay={0.22}
            y={18}
            className="mt-12 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link
              href="/registar-escola"
              className="group relative flex flex-col justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg-secondary)]"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[var(--landing-bg)]/12 flex items-center justify-center">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="w-4 h-4 opacity-70 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left">
                <p className="text-base font-medium leading-snug">
                  {t("landing.cta.button")}
                </p>
                <p className="mt-1 text-xs opacity-75 font-light">
                  {t("landing.nav.institutions")}
                </p>
              </div>
            </Link>

            <Link
              href="/signin"
              className="group relative flex flex-col justify-between gap-6 p-6 sm:p-7 rounded-2xl border border-[var(--landing-border-strong)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--landing-accent)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="w-4 h-4 text-[var(--landing-text-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--landing-accent)]"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left">
                <p className="text-base font-medium leading-snug">
                  {t("landing.cta.explore")}
                </p>
                <p className="mt-1 text-xs text-[var(--landing-text-secondary)] font-light">
                  {t("landing.nav.students")}
                </p>
              </div>
            </Link>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}

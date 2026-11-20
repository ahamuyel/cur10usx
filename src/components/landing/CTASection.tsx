"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] px-6 py-14 sm:px-12 sm:py-16 lg:py-20 text-center">
          {/* Subtle grid & top glow that adapt to both Light and Dark Mode */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[220px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
              {t("landing.cta.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)] text-balance">
              {t("landing.cta.headline")}
            </h2>
            <p className="mt-4 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed max-w-xl mx-auto">
              {t("landing.cta.description")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link
                href="/registar-escola"
                className="group inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg-secondary)]"
              >
                <span>{t("landing.cta.button")}</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center px-6 h-11 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
              >
                {t("landing.cta.explore")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

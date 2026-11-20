"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useTranslation } from "@/lib/i18n"

export default function HeroSection() {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  const headlineLines = t("landing.hero.headline").split("\n")

  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <section
      id="produto"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-[var(--landing-bg)]"
    >
      {/* Subtle architectural grid background (pure CSS, zero JS frame loop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_70%_55%_at_50%_15%,#000_25%,transparent_100%)]"
      />
      {/* Restrained top accent wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(760px,95vw)] h-[280px] rounded-full bg-[var(--landing-accent-subtle)] blur-3xl opacity-70"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-xs font-normal text-[var(--landing-text-secondary)] mb-6 sm:mb-7"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]"
              aria-hidden="true"
            />
            <span>{t("landing.hero.badge")}</span>
          </motion.div>

          {/* Headline — refined scale & Medium weight */}
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.48, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2rem] sm:text-5xl lg:text-[3.5rem] font-medium tracking-[-0.03em] leading-[1.08] text-[var(--landing-text-primary)] text-balance"
          >
            {headlineLines.map((line, i) => (
              <span key={i} className="block">
                {i === headlineLines.length - 1 ? (
                  <span className="text-[var(--landing-accent)]">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </motion.h1>

          {/* Subheadline — Light/Regular readability */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 sm:mt-6 max-w-2xl mx-auto text-[15px] sm:text-base lg:text-[17px] font-light text-[var(--landing-text-secondary)] leading-relaxed"
          >
            {t("landing.hero.subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.48, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
          >
            <Link
              href="/registar-escola"
              className="group inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-[var(--landing-text-primary)] text-[var(--landing-bg)] text-sm font-medium hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)]"
            >
              <span>{t("landing.hero.cta")}</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <a
              href="#experiencia"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text-primary)] text-sm font-normal hover:bg-[var(--landing-bg-tertiary)] hover:border-[var(--landing-border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <span>{t("landing.hero.explore")}</span>
              <ChevronDown className="w-4 h-4 text-[var(--landing-text-muted)]" aria-hidden="true" />
            </a>
          </motion.div>
        </div>

        {/* Real Platform Visual Showcase */}
        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              })}
          transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1.5 sm:p-2 shadow-[0_24px_70px_-32px_rgba(9,9,11,0.22)] dark:shadow-[0_24px_70px_-32px_rgba(0,0,0,0.85)]">
            <div className="rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] overflow-hidden">
              {/* Minimal browser top chrome */}
              <div className="flex items-center justify-between px-3.5 sm:px-4 h-10 border-b border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                </div>
                <span className="text-[11px] font-mono text-[var(--landing-text-muted)] truncate max-w-[200px] sm:max-w-none">
                  cur10usx.com/dashboard
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[var(--landing-text-muted)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {t("landing.hero.preview_label")}
                </span>
              </div>

              {/* Real Cur10usX screenshot */}
              <div className="relative bg-[var(--landing-bg)]">
                <Image
                  src="/screenshots/dashboard-1.png"
                  alt={t("landing.hero.preview_label")}
                  width={1101}
                  height={842}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1024px"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

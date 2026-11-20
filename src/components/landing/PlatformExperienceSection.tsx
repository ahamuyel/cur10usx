"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { LayoutDashboard, Users } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type ExperienceView = {
  id: string
  label: string
  url: string
  image: string
  alt: string
  title: string
  description: string
}

const viewIcons: Record<string, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  management: Users,
}

export default function PlatformExperienceSection() {
  const { t, tv } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const views = (tv("landing.experience.views") as ExperienceView[]) || []
  const [activeId, setActiveId] = useState<string>(views[0]?.id || "overview")

  const currentView = views.find((v) => v.id === activeId) || views[0]

  if (!currentView) return null

  return (
    <section
      id="experiencia"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
              {t("landing.experience.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
              {t("landing.experience.headline")}
            </h2>
            <p className="mt-3.5 text-sm sm:text-[15px] font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.experience.description")}
            </p>
          </div>

          {/* Interactive View Tabs (UI Layouts Image Tabs pattern) */}
          <div
            role="tablist"
            aria-label={t("landing.experience.tag")}
            className="inline-flex self-start lg:self-auto p-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)]"
          >
            {views.map((view) => {
              const selected = view.id === currentView.id
              const Icon = viewIcons[view.id] || LayoutDashboard
              return (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(view.id)}
                  className={`relative inline-flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] ${
                    selected
                      ? "text-[var(--landing-bg)]"
                      : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={prefersReducedMotion ? undefined : "experience-tab-pill"}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-lg bg-[var(--landing-text-primary)]"
                    />
                  )}
                  <Icon className="relative z-10 w-3.5 h-3.5" aria-hidden="true" />
                  <span className="relative z-10 whitespace-nowrap">{view.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Real Screenshot Frame */}
        <div className="rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-1.5 sm:p-2 shadow-[0_20px_60px_-30px_rgba(9,9,11,0.18)] dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="rounded-xl border border-[var(--landing-border-subtle)] bg-[var(--landing-bg-secondary)] overflow-hidden">
            <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--landing-border)]">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--landing-border-strong)]" />
              </div>
              <span className="text-[11px] font-mono text-[var(--landing-text-muted)]">
                {currentView.url}
              </span>
              <div className="w-10" aria-hidden="true" />
            </div>

            <div className="relative bg-[var(--landing-bg)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentView.id}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={currentView.image}
                    alt={currentView.alt}
                    width={1101}
                    height={842}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1200px"
                    className="w-full h-auto block"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Caption bar */}
          <div className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-[var(--landing-text-primary)]">
                {currentView.title}
              </h3>
              <p className="mt-0.5 text-xs sm:text-[13px] font-light text-[var(--landing-text-secondary)]">
                {currentView.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

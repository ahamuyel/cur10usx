"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTranslation } from "@/lib/i18n"

export default function TransformationSection() {
  const { t, tv } = useTranslation()
  const [activeTab, setActiveTab] = useState<"legacy" | "platform">("platform")

  const steps = tv("landing.transformation.steps") as {
    title: string
    legacy_title: string
    legacy_items: string[]
    platform_title: string
    platform_items: string[]
  }[]

  return (
    <section
      id="transformation"
      className="py-16 md:py-28 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.transformation.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-[1.05] mb-5">
            {t("landing.transformation.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl mb-6 md:mb-8">
            {t("landing.transformation.description")}
          </p>

          <div className="inline-flex p-0.5 bg-[var(--landing-bg-tertiary)] rounded-lg border border-[var(--landing-border)]">
            <button
              onClick={() => setActiveTab("legacy")}
              className={`py-2 px-4 md:px-5 text-xs font-semibold rounded-md transition-all cursor-pointer min-h-[36px] ${
                activeTab === "legacy"
                  ? "bg-[var(--landing-bg)] text-[var(--landing-text-primary)] shadow-sm border border-[var(--landing-border)]"
                  : "text-[var(--landing-text-muted)] hover:text-[var(--landing-text-secondary)]"
              }`}
            >
              {t("landing.transformation.tab_legacy")}
            </button>
            <button
              onClick={() => setActiveTab("platform")}
              className={`py-2 px-4 md:px-5 text-xs font-semibold rounded-md transition-all cursor-pointer min-h-[36px] ${
                activeTab === "platform"
                  ? "bg-[var(--landing-bg)] text-[var(--landing-text-primary)] shadow-sm border border-[var(--landing-border)]"
                  : "text-[var(--landing-text-muted)] hover:text-[var(--landing-text-secondary)]"
              }`}
            >
              {t("landing.transformation.tab_platform")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-5 md:p-7 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)]"
            >
              <span className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest block mb-4 md:mb-5 font-semibold">
                0{idx + 1} / {step.title}
              </span>

              <AnimatePresence mode="wait">
                {activeTab === "legacy" ? (
                  <motion.div
                    key="legacy-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="text-sm font-bold text-red-500 mb-3">
                      {step.legacy_title}
                    </h4>
                    <ul className="space-y-2.5">
                      {step.legacy_items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[var(--landing-text-muted)] text-xs md:text-sm leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-red-300 mt-0.5 select-none shrink-0">−</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.div
                    key="platform-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4 className="text-sm font-bold text-emerald-500 mb-3">
                      {step.platform_title}
                    </h4>
                    <ul className="space-y-2.5">
                      {step.platform_items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[var(--landing-text-primary)] text-xs md:text-sm leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold mt-0.5 select-none shrink-0">
                            ✓
                          </span>
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
    </section>
  )
}

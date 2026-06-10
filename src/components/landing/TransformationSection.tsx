"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTranslation } from "@/lib/i18n"
import { FileSpreadsheet, ClipboardList, Calculator, Smartphone, CheckCircle2, BarChart3 } from "lucide-react"

type Props = { locale?: string }

const beforeIcons = [ClipboardList, FileSpreadsheet, Calculator]
const afterIcons = [Smartphone, CheckCircle2, BarChart3]

export default function TransformationSection({ locale = "pt" }: Props) {
  const { t, tv } = useTranslation(locale)
  const [activeTab, setActiveTab] = useState<"legacy" | "curious">("curious")

  const steps = tv("landing.transformation.steps") as {
    title: string
    before: { title: string; items: string[]; status: string }
    after: { title: string; items: string[]; status: string }
  }[]

  return (
    <section
      id="transformation"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.transformation.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            {t("landing.transformation.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.transformation.description")}
          </p>

          <div className="inline-flex p-1 bg-[var(--landing-bg-secondary)] border border-[var(--landing-border)] rounded-xl mt-8">
            <button
              onClick={() => setActiveTab("legacy")}
              className={`py-2.5 px-5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "legacy"
                  ? "bg-[var(--landing-bg)] text-[var(--landing-text-primary)] shadow-sm border border-[var(--landing-border)]"
                  : "text-[var(--landing-text-dim)] hover:text-[var(--landing-text-secondary)]"
              }`}
            >
              <FileSpreadsheet size={14} className="inline mr-1.5 -mt-0.5" />
              {t("landing.transformation.legacy")}
            </button>
            <button
              onClick={() => setActiveTab("curious")}
              className={`py-2.5 px-5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "curious"
                  ? "bg-[var(--landing-bg)] text-[var(--landing-text-primary)] shadow-sm border border-[var(--landing-border)]"
                  : "text-[var(--landing-text-dim)] hover:text-[var(--landing-text-secondary)]"
              }`}
            >
              <BarChart3 size={14} className="inline mr-1.5 -mt-0.5" />
              {t("landing.transformation.platform")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const BeforeIcon = beforeIcons[idx]
            const AfterIcon = afterIcons[idx]
            return (
              <div
                key={idx}
                className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-[var(--landing-border)]">
                  <span className="text-[10px] text-[var(--landing-text-dim)] uppercase tracking-widest font-mono">
                    0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--landing-text-primary)] mt-1">
                    {step.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "legacy" ? (
                      <motion.div
                        key="legacy"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Mini visual */}
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                            <BeforeIcon size={20} className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                              {step.before.title}
                            </p>
                            <p className="text-[10px] text-red-400 dark:text-red-500 font-mono uppercase tracking-wider">
                              {step.before.status}
                            </p>
                          </div>
                        </div>

                        <ul className="space-y-2.5">
                          {step.before.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-[var(--landing-text-muted)] flex items-start gap-2"
                            >
                              <span className="text-red-300 mt-0.5 shrink-0">−</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="curious"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Mini visual */}
                        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                            <AfterIcon size={20} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {step.after.title}
                            </p>
                            <p className="text-[10px] text-emerald-400 dark:text-emerald-500 font-mono uppercase tracking-wider">
                              {step.after.status}
                            </p>
                          </div>
                        </div>

                        <ul className="space-y-2.5">
                          {step.after.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-[var(--landing-text-primary)] flex items-start gap-2"
                            >
                              <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

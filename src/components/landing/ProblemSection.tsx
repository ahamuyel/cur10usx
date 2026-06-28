 "use client"

import { useTranslation } from "@/lib/i18n"
import { FileSpreadsheet, MessageSquare, FileText, SearchX } from "lucide-react"

type ProblemItem = {
  title: string
  description: string
  stat: string
  statLabel: string
}

const icons = [FileSpreadsheet, MessageSquare, FileText, SearchX]

export default function ProblemSection() {
  const { t, tv } = useTranslation()
  const problems = tv("landing.problem.items") as ProblemItem[]

  return (
    <section
      id="problems"
      className="py-20 md:py-32 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--landing-bg-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.problem.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            {t("landing.problem.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.problem.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((item, idx) => {
            const Icon = icons[idx]
            return (
              <div
                key={idx}
                className="group relative border border-[var(--landing-border)] bg-[var(--landing-bg)] p-8 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--landing-text-primary)] tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-lg font-black text-red-400">{item.stat}</span>
                      <span className="text-xs text-[var(--landing-text-dim)]">{item.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

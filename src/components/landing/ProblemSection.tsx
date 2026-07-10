"use client"

import { useTranslation } from "@/lib/i18n"
import { useRef, useEffect } from "react"

type ProblemItem = {
  title: string
  description: string
}

const arrows = ["↓", "↓", "↓", "↓"]

export default function ProblemSection() {
  const { t, tv } = useTranslation()
  const problems = tv("landing.problem.items") as ProblemItem[]

  return (
    <section
      id="problems"
      className="py-16 md:py-28 bg-[var(--landing-bg)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--landing-bg-secondary)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.problem.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-[1.05] mb-5">
            {t("landing.problem.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
            {t("landing.problem.description")}
          </p>
        </div>

        {/* Narrative chain - mobile: stacked, tablet+: connected */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {problems.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Arrow down on mobile */}
                {idx < problems.length - 1 && (
                  <div className="flex md:hidden justify-center py-2 text-[var(--landing-text-dim)]/30">
                    <span className="text-lg">↓</span>
                  </div>
                )}
                <div className="group relative border border-[var(--landing-border)] bg-[var(--landing-bg)] p-5 md:p-6 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] hover:shadow-sm">
                  <span className="text-[10px] font-bold text-[var(--landing-text-dim)] uppercase tracking-wider block mb-2">
                    0{idx + 1}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-[var(--landing-text-primary)] tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

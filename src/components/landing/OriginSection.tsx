"use client"

import { useTranslation } from "@/lib/i18n"

export default function OriginSection() {
  const { t, tv } = useTranslation()
  const paragraphs = tv("landing.origin.paragraphs") as string[]

  return (
    <section
      id="about"
      className="py-16 md:py-28 bg-[var(--landing-bg)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8 md:mb-10">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.origin.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-tight md:leading-none mb-4 md:mb-6">
            {t("landing.origin.headline")}
          </h2>
        </div>

        <div className="max-w-3xl border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-5 md:p-8 rounded-xl">
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-sm md:text-base text-[var(--landing-text-secondary)] leading-relaxed mb-4 last:mb-0"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

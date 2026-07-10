"use client"

import { useTranslation } from "@/lib/i18n"

type FeatureItem = {
  side: string
  title: string
  description: string
}

export default function SchoolFeaturesSection() {
  const { t, tv } = useTranslation()
  const items = tv("landing.school_features.items") as FeatureItem[]

  return (
    <section
      id="product"
      className="py-16 md:py-28 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 md:mb-20">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.school_features.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-tight md:leading-none mb-4 md:mb-6">
            {t("landing.school_features.headline")}
          </h2>
          <p className="text-sm md:text-base text-[var(--landing-text-secondary)] leading-relaxed max-w-xl">
            {t("landing.school_features.description")}
          </p>
        </div>

        <div className="flex flex-col">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-8 py-5 md:py-6 border-t border-[var(--landing-border)] first:border-t-0 first:pt-0"
            >
              <span className="text-[11px] md:text-xs text-[var(--landing-text-dim)] font-medium">
                {item.side}
              </span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-[var(--landing-text-primary)] mb-1 md:mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
      className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.school_features.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--landing-text-primary)] tracking-tight leading-none mb-6">
            {t("landing.school_features.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.school_features.description")}
          </p>
        </div>

        <div className="flex flex-col">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-8 py-6 border-t border-[var(--landing-border)] first:border-t-0 first:pt-0"
            >
              <span className="text-xs text-[var(--landing-text-dim)] font-medium pt-0.5">
                {item.side}
              </span>
              <div>
                <h3 className="text-base font-bold text-[var(--landing-text-primary)] mb-1.5">
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

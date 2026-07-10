"use client"

import { useTranslation } from "@/lib/i18n"

type PointData = {
  title: string
  description: string
}

export default function VisionSection() {
  const { t, tv } = useTranslation()

  const points = tv("landing.vision.points") as PointData[]

  return (
    <section
      id="vision"
      className="py-16 md:py-28 bg-[var(--landing-bg-secondary)] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.vision.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-[1.05] mb-5">
            {t("landing.vision.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
            {t("landing.vision.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {points.map((point, idx) => (
            <div
              key={idx}
              className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-5 md:p-7 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)] relative"
            >
              <span className="text-4xl md:text-5xl font-bold text-[var(--landing-text-dim)]/10 absolute top-3 right-3 md:top-4 md:right-4 select-none">
                0{idx + 1}
              </span>
              <h3 className="text-base md:text-lg font-bold text-[var(--landing-text-primary)] tracking-tight mb-3">
                {point.title}
              </h3>
              <p className="text-xs md:text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

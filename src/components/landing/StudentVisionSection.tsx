"use client"

import { useTranslation } from "@/lib/i18n"

type VisionItem = {
  title: string
  description: string
}

export default function StudentVisionSection() {
  const { t, tv } = useTranslation()
  const items = tv("landing.student_vision.items") as VisionItem[]

  return (
    <section
      id="student-vision"
      className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.student_vision.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.student_vision.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.student_vision.description")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] rounded-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-[var(--landing-border)]">
              <p className="text-base md:text-lg text-[var(--landing-text-primary)] leading-relaxed font-[var(--font-voice,inherit)] italic">
                {t("landing.student_vision.quote")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--landing-border)]">
              {items.map((item, idx) => (
                <div key={idx} className="p-5 md:p-6">
                  <span className="text-[10px] font-semibold text-[var(--landing-text-dim)] uppercase tracking-widest block mb-1.5">
                    {item.title}
                  </span>
                  <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

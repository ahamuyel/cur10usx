"use client"

import { useTranslation } from "@/lib/i18n"
import { Cloud, ShieldCheck, Lock, Database } from "lucide-react"

const iconMap = [Cloud, ShieldCheck, Lock, Database]

export default function TrustSection() {
  const { t, tv } = useTranslation()
  const points = tv("landing.trust.points") as { title: string; desc: string }[]

  return (
    <section
      id="trust"
      className="py-16 md:py-28 bg-[var(--landing-bg)] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.trust.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-[1.05] mb-5">
            {t("landing.trust.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
            {t("landing.trust.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {points.map((point, idx) => {
            const Icon = iconMap[idx] || ShieldCheck
            return (
              <div
                key={idx}
                className="border border-[var(--landing-border)] bg-[var(--landing-bg-elevated)] p-5 md:p-6 rounded-xl transition-all duration-300 hover:border-[var(--landing-border-strong)]"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/5 flex items-center justify-center mb-4">
                  <Icon size={16} className="text-primary/60" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-[var(--landing-text-primary)] tracking-tight mb-2">
                  {point.title}
                </h3>
                <p className="text-xs md:text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  {point.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

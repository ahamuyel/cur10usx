"use client"

import { useTranslation } from "@/lib/i18n"
import { Users, GraduationCap, Building2, ClipboardCheck, BarChart3, FileText, MessageSquare, Heart } from "lucide-react"

const iconMap = [Users, GraduationCap, Building2, ClipboardCheck, BarChart3, FileText, MessageSquare, Heart]

export default function ProductEcosystem() {
  const { t, tv } = useTranslation()
  const items = tv("landing.ecosystem.items") as { title: string; description: string }[]

  return (
    <section
      id="ecosystem"
      className="py-16 md:py-28 bg-[var(--landing-bg-dark)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.ecosystem.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-[1.05] mb-5">
            {t("landing.ecosystem.headline")}
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
            {t("landing.ecosystem.description")}
          </p>
        </div>

        {/* Connected ecosystem grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((item, idx) => {
            const Icon = iconMap[idx] || Users
            return (
              <div
                key={idx}
                className="group border border-neutral-800 bg-neutral-900/40 p-4 md:p-5 rounded-xl transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900/60"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-primary/20 border border-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={14} className="text-primary/70" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-neutral-100 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

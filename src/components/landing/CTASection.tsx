"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3 font-semibold">
            {t("landing.cta.tag")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-[1.05] mb-5">
            {t("landing.cta.headline")}
          </h2>
          <p className="text-[var(--landing-text-dark-secondary)] text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8 md:mb-10">
            {t("landing.cta.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <button
              onClick={() => router.push("/registar-escola")}
              className="group inline-flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg min-h-[48px]"
            >
              {t("landing.cta.button")}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-900 transition-all min-h-[48px]"
            >
              {t("landing.cta.explore")}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

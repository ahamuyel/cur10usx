"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { ArrowRight, CreditCard, Clock, Headphones } from "lucide-react"

export default function CTASection() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <section className="py-16 md:py-28 bg-[var(--landing-bg-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] md:text-xs text-[var(--landing-text-dark-secondary)] uppercase tracking-widest block mb-3">
            {t("landing.cta.tag")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-dark-primary)] leading-tight md:leading-none mb-4 md:mb-6 max-w-lg md:max-w-none mx-auto">
            {t("landing.cta.headline")}
          </h2>
          <p className="text-sm md:text-base text-[var(--landing-text-dark-secondary)] leading-relaxed max-w-xl mx-auto mb-8 md:mb-10">
            {t("landing.cta.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4 sm:px-0">
            <button
              onClick={() => router.push("/registar-escola")}
              className="group inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-lg w-full sm:w-auto justify-center"
            >
              {t("landing.cta.button")}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-900 transition-all w-full sm:w-auto justify-center"
            >
              {t("landing.cta.free_account")}
            </button>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs text-[var(--landing-text-dark-secondary)]">
            <div className="flex items-center gap-1.5">
              <CreditCard size={13} className="text-emerald-400" />
              {t("landing.cta.multicaixa")}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-emerald-400" />
              {t("landing.cta.setup")}
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones size={13} className="text-emerald-400" />
              {t("landing.cta.support")}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

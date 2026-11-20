"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type FAQItem = {
  q: string
  a: string
}

export default function FAQSection() {
  const { t, tv } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  const items = tv("landing.faq.items") as FAQItem[]

  return (
    <section className="py-20 md:py-32 bg-[var(--landing-bg-secondary)] relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 md:mb-20">
          <span className="text-xs text-[var(--landing-text-dim)] uppercase tracking-widest block mb-3">
            {t("landing.faq.tag")}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--landing-text-primary)] leading-none mb-6">
            {t("landing.faq.headline")}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-sm md:text-base leading-relaxed">
            {t("landing.faq.description")}
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[var(--landing-border-strong)] bg-[var(--landing-bg)] shadow-sm"
                    : "border-[var(--landing-border)] bg-[var(--landing-bg)]/60 hover:border-[var(--landing-border-strong)]"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-[var(--landing-text-primary)] transition group"
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--landing-text-dim)] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

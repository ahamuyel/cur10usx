"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type FAQItem = {
  q: string
  a: string
}

export default function FAQSection() {
  const { t, tv } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = (tv("landing.faq.items") as FAQItem[]) || []

  if (!items.length) return null

  return (
    <section
      id="faq"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--landing-bg-secondary)] border-t border-[var(--landing-border)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Intro */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-2.5">
              {t("landing.faq.tag")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]">
              {t("landing.faq.headline")}
            </h2>
            <p className="mt-3 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
              {t("landing.faq.description")}
            </p>
          </div>

          {/* Accordion List */}
          <div className="lg:col-span-8 space-y-2.5">
            {items.map((item, idx) => {
              const isOpen = openIndex === idx
              const panelId = `faq-panel-${idx}`
              const triggerId = `faq-trigger-${idx}`
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[var(--landing-border-strong)] bg-[var(--landing-surface)]"
                      : "border-[var(--landing-border)] bg-[var(--landing-surface)]/70 hover:border-[var(--landing-border-strong)]"
                  }`}
                >
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--landing-accent)]"
                  >
                    <span className="text-sm font-medium text-[var(--landing-text-primary)] leading-snug">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-bg-secondary)] flex items-center justify-center shrink-0 text-[var(--landing-text-muted)]"
                    >
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-xs sm:text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

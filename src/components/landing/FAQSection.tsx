"use client"

import { useTranslation } from "@/lib/i18n"
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@/components/ui/uilayouts-accordion"
import { ScrollText, MotionReveal } from "@/components/ui/scroll-text"

type FAQItem = {
  q: string
  a: string
}

export default function FAQSection() {
  const { t, tv } = useTranslation()
  const items = (tv("landing.faq.items") as FAQItem[]) || []

  if (!items.length) return null

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-[var(--landing-bg)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Intro */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <MotionReveal y={12}>
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--landing-accent)] block mb-3">
                {t("landing.faq.tag")}
              </span>
            </MotionReveal>
            <ScrollText
              text={t("landing.faq.headline")}
              className="text-2xl sm:text-3xl font-medium tracking-[-0.025em] leading-[1.15] text-[var(--landing-text-primary)]"
            />
            <MotionReveal delay={0.12} y={14}>
              <p className="mt-3 text-sm font-light text-[var(--landing-text-secondary)] leading-relaxed">
                {t("landing.faq.description")}
              </p>
            </MotionReveal>
          </div>

          {/* Clean Hairline UI Layouts Accordion (Zero card boxes!) */}
          <MotionReveal delay={0.16} y={18} className="lg:col-span-8">
            <div className="border-t border-[var(--landing-border)]">
              <Accordion defaultValue="faq-0" className="space-y-0">
                {items.map((item, idx) => (
                  <AccordionItem
                    key={item.q}
                    value={`faq-${idx}`}
                    className="!rounded-none !border-0 !border-b !border-[var(--landing-border)] !bg-transparent hover:!border-[var(--landing-border)]"
                  >
                    <AccordionHeader className="!px-0 !py-5">{item.q}</AccordionHeader>
                    <AccordionPanel className="[&>div]:!px-0 [&>div]:!pb-5">
                      {item.a}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
